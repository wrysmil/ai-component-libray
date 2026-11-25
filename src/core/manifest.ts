/**
 * Manifest parsing / validation.
 *
 * The manifest is a generated JSON document (`src/manifest/manifest.json`).
 * This module only knows how to validate an unknown JSON value into the
 * {@link Manifest} shape; it never touches the file system so that it can be
 * used from the browser side showcase site as well.
 */

import { CATEGORIES, isCategory } from './types.js';
import type { ComponentFile, Manifest, ManifestEntry, PropMeta } from './types.js';

export class ManifestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestValidationError';
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new ManifestValidationError(`${path} must be a string`);
  }
  return value;
}

function assertStringArray(value: unknown, path: string): string[] {
  if (!isStringArray(value)) {
    throw new ManifestValidationError(`${path} must be an array of strings`);
  }
  return value;
}

function parsePropMeta(value: unknown, path: string): PropMeta {
  if (typeof value !== 'object' || value === null) {
    throw new ManifestValidationError(`${path} must be an object`);
  }
  const raw = value as Record<string, unknown>;
  const options = raw['options'];
  if (options !== null && options !== undefined && !isStringArray(options)) {
    throw new ManifestValidationError(`${path}.options must be an array of strings or null`);
  }
  const defaultValue = raw['default'];
  if (defaultValue !== null && defaultValue !== undefined && typeof defaultValue !== 'string') {
    throw new ManifestValidationError(`${path}.default must be a string or null`);
  }
  return {
    name: assertString(raw['name'], `${path}.name`),
    type: assertString(raw['type'], `${path}.type`),
    required: raw['required'] === true,
    default: defaultValue === undefined ? null : (defaultValue as string | null),
    description: assertString(raw['description'], `${path}.description`),
    options: options === undefined || options === null ? null : (options as string[]),
  };
}

function parseComponentFile(value: unknown, path: string): ComponentFile {
  if (typeof value !== 'object' || value === null) {
    throw new ManifestValidationError(`${path} must be an object`);
  }
  const raw = value as Record<string, unknown>;
  const role = raw['role'];
  const allowed = ['implementation', 'types', 'style', 'readme', 'example'];
  if (typeof role !== 'string' || !allowed.includes(role)) {
    throw new ManifestValidationError(`${path}.role must be one of ${allowed.join(', ')}`);
  }
  return {
    path: assertString(raw['path'], `${path}.path`),
    role: role as ComponentFile['role'],
  };
}

function parseEntry(value: unknown, path: string): ManifestEntry {
  if (typeof value !== 'object' || value === null) {
    throw new ManifestValidationError(`${path} must be an object`);
  }
  const raw = value as Record<string, unknown>;
  const category = raw['category'];
  if (!isCategory(category)) {
    throw new ManifestValidationError(
      `${path}.category must be one of ${CATEGORIES.join(', ')} (got ${String(category)})`,
    );
  }
  const framework = raw['framework'];
  if (framework !== 'react') {
    throw new ManifestValidationError(`${path}.framework must be "react"`);
  }
  const license = raw['license'];
  if (license !== 'MIT') {
    throw new ManifestValidationError(`${path}.license must be "MIT"`);
  }
  const props = raw['props'];
  if (!Array.isArray(props)) {
    throw new ManifestValidationError(`${path}.props must be an array`);
  }
  const files = raw['files'];
  if (!Array.isArray(files)) {
    throw new ManifestValidationError(`${path}.files must be an array`);
  }
  return {
    id: assertString(raw['id'], `${path}.id`),
    name: assertString(raw['name'], `${path}.name`),
    title: assertString(raw['title'], `${path}.title`),
    category,
    tags: assertStringArray(raw['tags'], `${path}.tags`),
    keywords: assertStringArray(raw['keywords'], `${path}.keywords`),
    description: assertString(raw['description'], `${path}.description`),
    summary: assertString(raw['summary'], `${path}.summary`),
    whenToUse: assertStringArray(raw['whenToUse'], `${path}.whenToUse`),
    whenNotToUse: assertStringArray(raw['whenNotToUse'], `${path}.whenNotToUse`),
    props: props.map((prop, index) => parsePropMeta(prop, `${path}.props[${index}]`)),
    dependencies: assertStringArray(raw['dependencies'], `${path}.dependencies`),
    peerDependencies: assertStringArray(raw['peerDependencies'], `${path}.peerDependencies`),
    framework: 'react',
    license: 'MIT',
    demoPath: assertString(raw['demoPath'], `${path}.demoPath`),
    files: files.map((file, index) => parseComponentFile(file, `${path}.files[${index}]`)),
    usage: assertString(raw['usage'], `${path}.usage`),
    install: assertString(raw['install'], `${path}.install`),
    examplePath: assertString(raw['examplePath'], `${path}.examplePath`),
  };
}

/** Validate an unknown JSON value and return the typed manifest. */
export function parseManifest(value: unknown): Manifest {
  if (typeof value !== 'object' || value === null) {
    throw new ManifestValidationError('manifest must be an object');
  }
  const raw = value as Record<string, unknown>;
  const components = raw['components'];
  if (!Array.isArray(components)) {
    throw new ManifestValidationError('manifest.components must be an array');
  }
  const parsed = components.map((entry, index) => parseEntry(entry, `manifest.components[${index}]`));
  const seen = new Set<string>();
  for (const entry of parsed) {
    if (seen.has(entry.id)) {
      throw new ManifestValidationError(`duplicate component id: ${entry.id}`);
    }
    seen.add(entry.id);
  }
  return {
    version: assertString(raw['version'], 'manifest.version'),
    components: parsed,
  };
}

/** Look up a single entry by id. */
export function findEntry(manifest: Manifest, id: string): ManifestEntry | undefined {
  return manifest.components.find((entry) => entry.id === id);
}

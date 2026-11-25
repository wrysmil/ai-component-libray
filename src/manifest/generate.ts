/**
 * Manifest generator.
 *
 * Reads every component directory under `src/components`, combines the hand
 * written `meta.ts` with facts derived from the source tree (`types.ts`
 * props, file list, ...) and writes `src/manifest/manifest.json`.
 *
 * The generated file is a build artifact: never edit it by hand, run
 * `npm run generate:manifest` instead. CI verifies that regenerating
 * produces no diff.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

import { CATEGORIES, isCategory } from '../core/types.js';
import type {
  ComponentFile,
  ComponentMeta,
  FileRole,
  Manifest,
  ManifestEntry,
  PropMeta,
} from '../core/types.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const componentsDir = path.join(repoRoot, 'src', 'components');
const indexFile = path.join(repoRoot, 'src', 'index.ts');
const outputFile = path.join(here, 'manifest.json');

class GeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeneratorError';
  }
}

/** Files every component directory must provide. */
function requiredComponentFiles(id: string): { file: string; role: FileRole }[] {
  return [
    { file: `${id}.tsx`, role: 'implementation' },
    { file: 'types.ts', role: 'types' },
    { file: `${id}.css`, role: 'style' },
    { file: 'example.tsx', role: 'example' },
    { file: 'README.md', role: 'readme' },
    { file: 'meta.ts', role: 'implementation' },
  ];
}

function roleOfFile(id: string, name: string): FileRole | null {
  if (name === `${id}.tsx`) return 'implementation';
  if (name === 'types.ts') return 'types';
  if (name === `${id}.css`) return 'style';
  if (name === 'example.tsx') return 'example';
  if (name.toLowerCase() === 'readme.md') return 'readme';
  return null;
}

function listComponentFiles(id: string): ComponentFile[] {
  const dir = path.join(componentsDir, id);
  const files: ComponentFile[] = [];
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (!statSync(full).isFile()) continue;
    const role = roleOfFile(id, name);
    if (!role) continue;
    files.push({ path: toPosix(path.relative(repoRoot, full)), role });
  }
  return files;
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

interface ReflectedProp extends PropMeta {}

function stripImportPrefixes(typeText: string): string {
  return typeText.replace(/import\("[^"]*"\)\./g, '');
}

/** Reflect the props of one exported interface of `types.ts`. */
function reflectProps(
  program: ts.Program,
  typesFile: string,
  propsTypeName: string,
  componentId: string,
): ReflectedProp[] {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(typesFile);
  if (!sourceFile) {
    throw new GeneratorError(`[${componentId}] cannot read types file ${typesFile}`);
  }
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new GeneratorError(`[${componentId}] types file has no module symbol`);
  }
  const exported = checker.getExportsOfModule(moduleSymbol);
  const symbol = exported.find((candidate) => candidate.getName() === propsTypeName);
  if (!symbol) {
    throw new GeneratorError(
      `[${componentId}] props interface "${propsTypeName}" is not exported from ${toPosix(path.relative(repoRoot, typesFile))}`,
    );
  }
  const declaration = symbol.declarations?.[0];
  if (!declaration || !ts.isInterfaceDeclaration(declaration)) {
    throw new GeneratorError(
      `[${componentId}] "${propsTypeName}" must be an exported interface in types.ts`,
    );
  }
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const props: ReflectedProp[] = [];
  for (const property of checker.getPropertiesOfType(type)) {
    // Only the props declared by this interface — inherited members (e.g. from
    // React.ButtonHTMLAttributes) belong to the DOM, not to the component API.
    const isOwnMember = property.declarations?.some(
      (candidate) => candidate.parent === declaration,
    );
    if (!isOwnMember) continue;
    const name = property.getName();
    const propertyDeclaration = property.declarations?.[0];
    const propertyType = checker.getTypeOfSymbolAtLocation(property, propertyDeclaration ?? declaration);
    const required = !(property.flags & ts.SymbolFlags.Optional);
    let typeText = checker.typeToString(
      propertyType,
      undefined,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType,
    );
    typeText = stripImportPrefixes(typeText);
    if (!required) {
      typeText = typeText.replace(/\s*\|\s*undefined$/u, '');
    }

    const documentation = ts.displayPartsToString(property.getDocumentationComment(checker)).trim();
    let defaultValue: string | null = null;
    if (propertyDeclaration) {
      for (const tag of ts.getJSDocTags(propertyDeclaration)) {
        if (tag.tagName.text === 'default') {
          defaultValue = ts.getTextOfJSDocComment(tag.comment)?.trim() ?? '';
        }
      }
    }

    let options: string[] | null = null;
    if (propertyType.isUnion()) {
      const literals: string[] = [];
      let onlyLiterals = true;
      for (const constituent of propertyType.types) {
        if (constituent.isStringLiteral()) {
          literals.push(constituent.value);
        } else if (constituent.flags & ts.TypeFlags.Undefined) {
          continue;
        } else {
          onlyLiterals = false;
          break;
        }
      }
      if (onlyLiterals && literals.length > 0) {
        options = literals;
      }
    }

    props.push({ name, type: typeText, required, default: defaultValue, description: documentation, options });
  }
  return props;
}

async function loadMeta(metaFile: string): Promise<ComponentMeta> {
  const module = (await import(pathToFileURL(metaFile).href)) as { meta: ComponentMeta };
  if (!module.meta) {
    throw new GeneratorError(`${toPosix(path.relative(repoRoot, metaFile))} must export "meta"`);
  }
  return module.meta;
}

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
    version?: string;
    name?: string;
  };
  if (!pkg.version) throw new GeneratorError('package.json has no version');
  return pkg.version;
}

export function readIndexExports(program: ts.Program): Set<string> {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(indexFile);
  if (!sourceFile) throw new GeneratorError('cannot read src/index.ts');
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new GeneratorError('src/index.ts has no module symbol');
  return new Set(checker.getExportsOfModule(moduleSymbol).map((symbol) => symbol.getName()));
}

export async function generateManifest(): Promise<Manifest> {
  const version = readPackageVersion();
  const componentIds = readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (componentIds.length === 0) {
    throw new GeneratorError('no component directories found');
  }

  const metas = new Map<string, ComponentMeta>();
  const typeFiles: string[] = [];
  for (const id of componentIds) {
    const metaFile = path.join(componentsDir, id, 'meta.ts');
    const meta = await loadMeta(metaFile);
    if (meta.id !== id) {
      throw new GeneratorError(`[${id}] meta.id "${meta.id}" must equal the directory name`);
    }
    if (!isCategory(meta.category)) {
      throw new GeneratorError(
        `[${id}] category "${meta.category}" must be one of ${CATEGORIES.join(', ')}`,
      );
    }
    if (metas.has(meta.id)) {
      throw new GeneratorError(`duplicate component id: ${meta.id}`);
    }
    for (const required of requiredComponentFiles(id)) {
      const full = path.join(componentsDir, id, required.file);
      try {
        if (!statSync(full).isFile()) throw new Error('not a file');
      } catch {
        throw new GeneratorError(`[${id}] missing required file ${required.file}`);
      }
    }
    metas.set(meta.id, meta);
    typeFiles.push(path.join(componentsDir, id, 'types.ts'));
  }

  const program = ts.createProgram([indexFile, ...typeFiles], {
    strict: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
    noEmit: true,
  });
  const indexExports = readIndexExports(program);

  const entries: ManifestEntry[] = [];
  for (const id of componentIds) {
    const meta = metas.get(id)!;
    if (!indexExports.has(meta.name)) {
      throw new GeneratorError(
        `[${id}] component "${meta.name}" is not exported from src/index.ts`,
      );
    }
    const props = reflectProps(
      program,
      path.join(componentsDir, id, 'types.ts'),
      meta.propsType,
      id,
    );
    if (props.length === 0) {
      throw new GeneratorError(`[${id}] props interface "${meta.propsType}" has no members`);
    }
    for (const prop of props) {
      if (/\bany\b/u.test(prop.type)) {
        throw new GeneratorError(`[${id}] prop "${prop.name}" uses "any" — add a precise type`);
      }
      if (!prop.description) {
        throw new GeneratorError(`[${id}] prop "${prop.name}" is missing a JSDoc description`);
      }
    }

    const files = listComponentFiles(id);
    const roles = new Set(files.map((file) => file.role));
    for (const needed of ['implementation', 'types', 'style', 'example', 'readme'] as const) {
      if (!roles.has(needed)) {
        throw new GeneratorError(`[${id}] component directory has no "${needed}" file`);
      }
    }

    entries.push({
      id: meta.id,
      name: meta.name,
      title: meta.title,
      category: meta.category,
      tags: [...meta.tags],
      keywords: [...meta.keywords],
      description: meta.description,
      summary: meta.summary,
      whenToUse: [...meta.whenToUse],
      whenNotToUse: [...meta.whenNotToUse],
      props,
      dependencies: [...meta.dependencies],
      peerDependencies: ['react'],
      framework: 'react',
      license: 'MIT',
      demoPath: `/components/${meta.id}`,
      files,
      usage: [
        `import { ${meta.name} } from 'ai-component-libray';`,
        `import 'ai-component-libray/styles/${meta.id}.css';`,
      ].join('\n'),
      install: 'npm install ai-component-libray',
      examplePath: toPosix(path.relative(repoRoot, path.join(componentsDir, id, 'example.tsx'))),
    });
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));
  return { version, components: entries };
}

async function main(): Promise<void> {
  const manifest = await generateManifest();
  writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `manifest written: ${toPosix(path.relative(repoRoot, outputFile))} (${manifest.components.length} components)\n`,
  );
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

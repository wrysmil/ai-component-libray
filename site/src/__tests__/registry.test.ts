/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';

import { components } from '../manifest.js';
import { registry, registryIds } from '../registry.js';

/**
 * The preview registry is the one place where a new component has to be
 * registered for the showcase site (see the README). The manifest generator
 * does not know about it, therefore the relation is guarded here: a component
 * that is not registered would show the placeholder
 * "This component is not registered in the preview registry." on its page.
 */
describe('preview registry', () => {
  it('registers every component of the manifest', () => {
    const missing = components
      .map((entry) => entry.id)
      .filter((id) => !(id in registry));
    expect(missing).toEqual([]);
  });

  it('does not register a component that is not part of the manifest', () => {
    const known = new Set(components.map((entry) => entry.id));
    const unknown = registryIds.filter((id) => !known.has(id));
    expect(unknown).toEqual([]);
  });

  it('exposes exactly the registered ids', () => {
    expect(registryIds.sort()).toEqual(Object.keys(registry).sort());
  });
});

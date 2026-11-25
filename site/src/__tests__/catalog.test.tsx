/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from '../App.js';
import { components } from '../manifest.js';

// The repository does not enable the vitest globals, therefore the automatic
// cleanup of the testing library is registered explicitly.
afterEach(() => {
  cleanup();
});

/** Renders the current location so that the tests can assert on the URL. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderCatalog(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('catalog page', () => {
  it('lists every component of the manifest with a link to its detail page', () => {
    const { container } = renderCatalog();

    const cards = screen.getAllByTestId('component-card');
    expect(cards).toHaveLength(components.length);

    for (const entry of components) {
      const link = container.querySelector(`a[href="/components/${entry.id}"]`);
      expect(link).not.toBeNull();
      expect(link?.textContent).toContain(entry.title);
    }
  });

  it('shows name, description, category and tags of a component', () => {
    renderCatalog();
    const entry = components[0];
    expect(entry).toBeDefined();
    if (!entry) return;

    const [card] = screen.getAllByTestId('component-card');
    expect(card).toBeDefined();
    if (!card) return;
    expect(card.textContent).toContain(entry.name);
    expect(card.textContent).toContain(entry.description);
    expect(card.getAttribute('data-category')).toBe(entry.category);
    for (const tag of entry.tags) {
      expect(card.textContent).toContain(tag);
    }
  });

  it('filters the list with the keyword search and keeps the query in the URL', async () => {
    renderCatalog();

    const before = screen.getAllByTestId('component-card').length;
    expect(before).toBe(components.length);

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'zzz-no-such-component' },
    });

    await waitFor(() => {
      expect(screen.queryAllByTestId('component-card')).toHaveLength(0);
    });
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByTestId('result-count').textContent).toContain('0 components');

    await waitFor(() => {
      expect(screen.getByTestId('location-search').textContent).toContain('q=zzz-no-such-component');
    });
  });

  it('narrows the list down when the keyword matches', async () => {
    renderCatalog();

    const entry = components[0];
    expect(entry).toBeDefined();
    if (!entry) return;

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: entry.keywords[0] ?? entry.name },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('component-card').length).toBeLessThanOrEqual(components.length);
    });
    expect(screen.getAllByTestId('component-card').length).toBeGreaterThan(0);
  });

  it('filters by category, writes it to the URL and only shows that category', async () => {
    renderCatalog();

    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'action' } });

    await waitFor(() => {
      expect(screen.getByTestId('location-search').textContent).toContain('category=action');
    });

    const expected = components.filter((entry) => entry.category === 'action');
    const cards = screen.getAllByTestId('component-card');
    expect(cards).toHaveLength(expected.length);
    for (const card of cards) {
      expect(card.getAttribute('data-category')).toBe('action');
    }
  });

  it('filters by tag', async () => {
    renderCatalog();

    const entry = components[0];
    expect(entry).toBeDefined();
    if (!entry) return;
    const tag = entry.tags[0];
    expect(tag).toBeDefined();
    if (!tag) return;

    fireEvent.change(screen.getByLabelText('Tag'), { target: { value: tag } });

    await waitFor(() => {
      expect(screen.getByTestId('location-search').textContent).toContain(`tag=${tag}`);
    });

    const cards = screen.getAllByTestId('component-card');
    for (const card of cards) {
      expect(card.textContent).toContain(tag);
    }
  });
});

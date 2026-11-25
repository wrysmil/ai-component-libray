/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from '../App.js';
import { components } from '../manifest.js';
import { keywordSearchProvider } from '../../../src/core/search.js';

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
  it('lists every component of the manifest with a link to its detail page', async () => {
    renderCatalog();

    // The catalogue is paged — every component has to be reachable, not only
    // the ones of the first page.
    const seen = new Set<string>();

    for (;;) {
      const cards = screen.getAllByTestId('component-card');
      expect(cards.length).toBeGreaterThan(0);

      for (const card of cards) {
        const link = card.querySelector('a[href^="/components/"]');
        const href = link?.getAttribute('href') ?? '';
        seen.add(href.replace('/components/', ''));
        expect(link?.textContent).toContain(
          components.find((entry) => entry.id === href.replace('/components/', ''))?.title ?? '',
        );
      }

      const next = screen.queryByRole('button', { name: 'Next' }) as HTMLButtonElement | null;
      if (!next || next.disabled) break;
      fireEvent.click(next);
      await waitFor(() => {
        expect(screen.getByTestId('result-count').textContent).toContain('components found');
      });
    }

    expect([...seen].sort()).toEqual(components.map((entry) => entry.id).sort());
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
    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThanOrEqual(components.length);

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

    const token = '表格';
    const expected = keywordSearchProvider
      .search(components, { q: token })
      .map((match) => match.entry.id);

    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(components.length);

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: token },
    });

    await waitFor(() => {
      const cards = screen.getAllByTestId('component-card');
      const rendered = cards.map((card) =>
        (card.querySelector('a[href^="/components/"]')?.getAttribute('href') ?? '').replace(
          '/components/',
          '',
        ),
      );
      expect(rendered.sort()).toEqual([...expected].sort());
    });
  });

  it('restores the filters from the URL', () => {
    renderCatalog('/?q=modal&category=overlay');

    expect((screen.getByLabelText('Search') as HTMLInputElement).value).toBe('modal');
    expect((screen.getByLabelText('Category') as HTMLSelectElement).value).toBe('overlay');

    const cards = screen.getAllByTestId('component-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.textContent).toContain('Modal');
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

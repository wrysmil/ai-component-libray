import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { keywordSearchProvider, paginate } from '../../../src/core/search.js';
import { isCategory } from '../../../src/core/types.js';
import type { Category } from '../../../src/core/types.js';

import { categories, categoryLabel, components, tags } from '../manifest.js';

/** Number of cards per page. */
const PAGE_SIZE = 6;

/** Debounce of the keyword input before it is written to the URL. */
const DEBOUNCE_MS = 200;

/**
 * The catalog page: the list of every component of the manifest.
 *
 * All filter state lives in the URL query string (`?q=&category=&tag=&page=`)
 * so that a result can be shared and the back button works.
 */
export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const rawCategory = searchParams.get('category') ?? '';
  const tag = searchParams.get('tag') ?? '';
  const selectedCategory: Category | undefined = isCategory(rawCategory) ? rawCategory : undefined;

  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // The text input is controlled by a local state so that typing stays
  // responsive; it is written to the URL after a short debounce.
  const [text, setText] = useState(query);

  useEffect(() => {
    setText(query);
  }, [query]);

  useEffect(() => {
    if (text === query) return undefined;
    const timer = window.setTimeout(() => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (text) next.set('q', text);
        else next.delete('q');
        next.delete('page');
        return next;
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query, setSearchParams, text]);

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      mutate(next);
      return next;
    });
  };

  const handleCategory = (value: string) => {
    updateParams((params) => {
      if (value) params.set('category', value);
      else params.delete('category');
      params.delete('page');
    });
  };

  const handleTag = (value: string) => {
    updateParams((params) => {
      if (value) params.set('tag', value);
      else params.delete('tag');
      params.delete('page');
    });
  };

  const handlePage = (page: number) => {
    updateParams((params) => {
      params.set('page', String(page));
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // The search itself is delegated to the shared search implementation of the
  // library — the site never re-implements the matching rules.
  const matches = useMemo(
    () =>
      keywordSearchProvider.search(components, {
        q: query || undefined,
        category: selectedCategory,
        tags: tag ? [tag] : undefined,
      }),
    [query, selectedCategory, tag],
  );

  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  // A page number beyond the last one (e.g. `?page=99`) falls back to the last
  // page instead of showing an empty list.
  const effectivePage = Math.min(currentPage, pageCount);

  const result = useMemo(
    () => paginate(matches, effectivePage, PAGE_SIZE),
    [matches, effectivePage],
  );

  const hasFilters = Boolean(query || selectedCategory || tag);

  return (
    <div className="catalog">
      <header className="catalog__header">
        <h1 className="catalog__title">Components</h1>
        <p className="catalog__lead">
          {components.length} components of the AI component library. Search by name, description or
          tag, or filter by category.
        </p>
      </header>

      <form className="catalog__filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="catalog__field catalog__field--grow">
          <label className="catalog__label" htmlFor="catalog-search">
            Search
          </label>
          <input
            id="catalog-search"
            className="catalog__input"
            type="search"
            autoComplete="off"
            placeholder="Search components…"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        <div className="catalog__field">
          <label className="catalog__label" htmlFor="catalog-category">
            Category
          </label>
          <select
            id="catalog-category"
            className="catalog__select"
            value={selectedCategory ?? ''}
            onChange={(event) => handleCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
        <div className="catalog__field">
          <label className="catalog__label" htmlFor="catalog-tag">
            Tag
          </label>
          <select
            id="catalog-tag"
            className="catalog__select"
            value={tag}
            onChange={(event) => handleTag(event.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        {hasFilters ? (
          <button type="button" className="button button--ghost" onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </form>

      <p className="catalog__count" role="status" data-testid="result-count">
        {result.total} {result.total === 1 ? 'component' : 'components'} found
      </p>

      {result.items.length === 0 ? (
        <div className="catalog__empty" data-testid="empty-state">
          <h2>No results</h2>
          <p>
            No component matches the current filters. Try a different keyword, another category or
            clear the filters to see everything again.
          </p>
          <button type="button" className="button button--primary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="catalog__grid" data-testid="component-list">
          {result.items.map((entry) => (
            <li key={entry.id} className="catalog__item">
              <article className="card" data-testid="component-card" data-category={entry.category}>
                <header className="card__header">
                  <h2 className="card__title">
                    <Link to={`/components/${entry.id}`}>{entry.title}</Link>
                  </h2>
                  <span className="card__category">{categoryLabel(entry.category)}</span>
                </header>
                <p className="card__name">{entry.name}</p>
                <p className="card__description">{entry.description}</p>
                <ul className="card__tags">
                  {entry.tags.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="card__link" to={`/components/${entry.id}`}>
                  View component
                  <span className="card__link-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 ? (
        <nav className="catalog__pagination" aria-label="Pagination">
          <button
            type="button"
            className="button button--ghost"
            disabled={effectivePage <= 1}
            onClick={() => handlePage(effectivePage - 1)}
          >
            Previous
          </button>
          <span className="catalog__page">
            Page {effectivePage} of {pageCount}
          </span>
          <button
            type="button"
            className="button button--ghost"
            disabled={effectivePage >= pageCount}
            onClick={() => handlePage(effectivePage + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default CatalogPage;

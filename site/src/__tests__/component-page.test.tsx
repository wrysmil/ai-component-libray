/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../App.js';
import { getComponent } from '../manifest.js';

/**
 * The real content of the implementation file, read from disk.
 *
 * The file is resolved against the repository root (the working directory of
 * the test runner).
 */
const buttonSource = readFileSync(
  path.resolve(process.cwd(), 'src/components/button/button.tsx'),
  'utf8',
);

const writeText = vi.fn<(text: string) => Promise<void>>(async () => undefined);

function renderComponentPage(id = 'button') {
  return render(
    <MemoryRouter initialEntries={[`/components/${id}`]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
});

// The repository does not enable the vitest globals, therefore the automatic
// cleanup of the testing library is registered explicitly.
afterEach(() => {
  cleanup();
});

describe('component page', () => {
  it('renders the real component of the registry', () => {
    renderComponentPage('button');

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeTruthy();
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('data-variant')).toBe('primary');
    expect(button.getAttribute('data-size')).toBe('medium');
  });

  it('updates the preview when a control changes', () => {
    renderComponentPage('button');

    const variant = screen.getByLabelText(/variant/i) as HTMLSelectElement;
    expect(variant.tagName).toBe('SELECT');
    fireEvent.change(variant, { target: { value: 'danger' } });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button.getAttribute('data-variant')).toBe('danger');

    const size = screen.getByLabelText(/^size/i) as HTMLSelectElement;
    fireEvent.change(size, { target: { value: 'large' } });
    expect(button.getAttribute('data-size')).toBe('large');
  });

  it('shows every prop of the component in the props table', () => {
    const entry = getComponent('button');
    expect(entry).toBeDefined();
    if (!entry) return;

    renderComponentPage('button');

    const table = screen.getByTestId('props-table');
    for (const prop of entry.props) {
      expect(within(table).getByText(prop.name)).toBeTruthy();
      expect(table.textContent).toContain(prop.type);
      expect(table.textContent).toContain(prop.description);
    }
  });

  it('shows the usage information of the component', () => {
    const entry = getComponent('button');
    expect(entry).toBeDefined();
    if (!entry) return;

    renderComponentPage('button');

    const page = screen.getByTestId('preview').closest('article');
    expect(page).toBeTruthy();
    const text = page?.textContent ?? '';
    expect(text).toContain('When to use');
    expect(text).toContain('When not to use');
    expect(text).toContain('Installation');
    expect(text).toContain(entry.install);
    expect(text).toContain(entry.usage);
  });

  it('copies the real source file of the component', async () => {
    renderComponentPage('button');

    // The implementation file is the first tab of the source viewer.
    expect(screen.getByTestId('source-content').textContent).toBe(buttonSource);

    fireEvent.click(screen.getByRole('button', { name: /copy source/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText.mock.calls[0]?.[0]).toBe(buttonSource);
  });

  it('copies the install command and every file of the component', async () => {
    const entry = getComponent('button');
    expect(entry).toBeDefined();
    if (!entry) return;

    renderComponentPage('button');

    fireEvent.click(screen.getByRole('button', { name: /copy all files/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    const allFiles = writeText.mock.calls[0]?.[0] ?? '';
    expect(allFiles).toContain('// src/components/button/button.tsx');
    expect(allFiles).toContain('// src/components/button/types.ts');
    expect(allFiles).toContain(buttonSource);

    writeText.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /copy install command/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText.mock.calls[0]?.[0]).toBe(entry.install);
  });

  it('shows a not found message for an unknown component', () => {
    renderComponentPage('does-not-exist');
    expect(screen.getByText(/page not found/i)).toBeTruthy();
  });

  it('reports invalid JSON inline and keeps the last valid value', () => {
    renderComponentPage('data-table');

    const textarea = screen.getByLabelText(/columns/i) as HTMLTextAreaElement;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.value).toContain('"title": "Name"');

    fireEvent.change(textarea, { target: { value: '{ not json' } });

    expect(screen.getByRole('alert').textContent).toContain('Invalid JSON');

    // The last valid value is kept — the preview still shows the original
    // columns.
    const tables = screen.getAllByRole('table');
    expect(tables.some((table) => table.textContent?.includes('Name') === true)).toBe(true);
  });

  it('drops an invalid JSON draft when the props are reset', () => {
    renderComponentPage('data-table');

    const textarea = screen.getByLabelText(/columns/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{ not json' } });
    expect(screen.getByRole('alert').textContent).toContain('Invalid JSON');

    fireEvent.click(screen.getByRole('button', { name: /reset props/i }));

    expect(textarea.value).toContain('"title": "Name"');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('lets the visitor type in the preview of a controlled component', () => {
    renderComponentPage('text-input');

    const input = screen.getByLabelText('Full name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ada' } });

    expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('Ada');
  });

  it('switches the tab of the preview', () => {
    renderComponentPage('tabs');

    const preview = within(screen.getByTestId('preview'));
    expect(preview.getByRole('tabpanel').textContent).toContain('Overview panel');

    fireEvent.click(preview.getByRole('tab', { name: 'Props' }));

    expect(preview.getByRole('tabpanel').textContent).toContain('Props panel');
    expect(preview.getByRole('tab', { name: 'Props' }).getAttribute('aria-selected')).toBe('true');
  });

  it('opens and closes the modal of the preview', () => {
    renderComponentPage('modal');

    // The modal is closed by default — it must never trap the visitor on the
    // page.
    expect(screen.queryByRole('dialog')).toBeNull();

    const open = document.getElementById('prop-open') as HTMLInputElement;
    expect(open).not.toBeNull();
    fireEvent.click(open);

    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

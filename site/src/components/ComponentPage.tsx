import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { ManifestEntry } from '../../../src/core/types.js';

import { demoProps } from '../demo-props.js';
import { registry } from '../registry.js';
import { categoryLabel, getComponent } from '../manifest.js';

import { CopyButton } from './CopyButton.js';
import { NotFoundPage } from './NotFoundPage.js';
import { PropControls } from './PropControls.js';
import { PropsTable } from './PropsTable.js';
import { SourceViewer } from './SourceViewer.js';

/**
 * Parse the `default` value of a prop.
 *
 * The manifest stores defaults as the source text of the default value
 * (`"primary"`, `false`, `12`, ...), so they can be parsed as JSON.
 */
export function parseDefault(raw: string | null): unknown {
  if (raw === null || raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '—') return undefined;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed === null ? undefined : parsed;
  } catch {
    return undefined;
  }
}

/** The initial values of the preview: manifest defaults + demo props. */
export function initialValues(entry: ManifestEntry): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const prop of entry.props) {
    const parsed = parseDefault(prop.default);
    if (parsed !== undefined) values[prop.name] = parsed;
  }
  // The demo props win — they provide a meaningful first render.
  Object.assign(values, demoProps[entry.id] ?? {});
  return values;
}

/** The detail page of a single component. */
export function ComponentPage() {
  const { id = '' } = useParams();
  const entry = getComponent(id);

  if (!entry) {
    return <NotFoundPage reason={`There is no component called “${id}” in the manifest.`} />;
  }

  return <ComponentDetail entry={entry} />;
}

function ComponentDetail({ entry }: { entry: ManifestEntry }) {
  const descriptor = registry[entry.id];
  const initial = useMemo(() => initialValues(entry), [entry]);
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [resetCount, setResetCount] = useState(0);

  const handleChange = (name: string, value: unknown) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleReset = () => {
    setValues(initial);
    // The counter forces the controls to drop invalid drafts as well.
    setResetCount((previous) => previous + 1);
  };

  // Controlled components get their callbacks wired to the preview state, so
  // that the preview really behaves like the component in a project.
  const previewProps = useMemo(() => {
    if (!descriptor?.link) return values;
    return descriptor.link(values, handleChange);
  }, [descriptor, values]);

  return (
    <article className="detail">
      <nav className="detail__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">← Back to the catalog</Link>
      </nav>

      <header className="detail__header">
        <div>
          <h1 className="detail__title">{entry.title}</h1>
          <p className="detail__name">
            <code>{entry.name}</code> · <span>{categoryLabel(entry.category)}</span>
          </p>
        </div>
        <ul className="detail__tags">
          {entry.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <p className="detail__description">{entry.description}</p>

      <div className="detail__layout">
        <section className="detail__preview" aria-label="Live preview">
          <h2 className="section__title">Preview</h2>
          <div className="preview" data-testid="preview">
            {descriptor ? (
              descriptor.render(previewProps)
            ) : (
              <p className="preview__missing">
                This component is not registered in the preview registry.
              </p>
            )}
          </div>
          <p className="preview__hint">
            The preview renders the real component from the library sources — change a prop on the
            right to see it update immediately.
          </p>
        </section>

        <section className="detail__controls" aria-label="Props">
          <h2 className="section__title">Props</h2>
          <PropControls
            props={entry.props}
            values={values}
            onChange={handleChange}
            onReset={handleReset}
            resetKey={resetCount}
          />
        </section>
      </div>

      <section className="detail__section">
        <h2 className="section__title">Props reference</h2>
        <PropsTable props={entry.props} />
      </section>

      <div className="detail__columns">
        <section className="detail__section">
          <h2 className="section__title">When to use</h2>
          <ul className="list list--check">
            {entry.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="detail__section">
          <h2 className="section__title">When not to use</h2>
          <ul className="list list--cross">
            {entry.whenNotToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="detail__section">
        <h2 className="section__title">Installation</h2>
        <div className="install">
          <pre className="code code--inline" data-testid="install-command">
            <code>{entry.install}</code>
          </pre>
          <CopyButton value={entry.install} label="Copy install command" />
        </div>
        <h3 className="section__subtitle">Dependencies</h3>
        <ul className="list">
          {entry.dependencies.length === 0 ? (
            <li>No runtime dependencies.</li>
          ) : (
            entry.dependencies.map((dependency) => <li key={dependency}>{dependency}</li>)
          )}
        </ul>
        <h3 className="section__subtitle">Peer dependencies</h3>
        <ul className="list">
          {entry.peerDependencies.length === 0 ? (
            <li>None.</li>
          ) : (
            entry.peerDependencies.map((dependency) => <li key={dependency}>{dependency}</li>)
          )}
        </ul>
      </section>

      <section className="detail__section">
        <h2 className="section__title">Usage</h2>
        <pre className="code">
          <code>{entry.usage}</code>
        </pre>
        <p className="detail__example-path">
          Runnable example: <code>{entry.examplePath}</code>
        </p>
      </section>

      <SourceViewer entry={entry} />
    </article>
  );
}

export default ComponentPage;

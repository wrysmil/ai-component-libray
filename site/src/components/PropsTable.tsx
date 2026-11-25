import type { PropMeta } from '../../../src/core/types.js';

export interface PropsTableProps {
  /** The props of the component, taken from the manifest. */
  props: PropMeta[];
}

/** A table documenting every prop of a component. */
export function PropsTable({ props }: PropsTableProps) {
  return (
    <div className="props-table-wrapper">
      <table className="props-table" data-testid="props-table">
        <caption className="props-table__caption">Props</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Required</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <th scope="row">
                <code>{prop.name}</code>
              </th>
              <td>
                <code className="props-table__type">{prop.type}</code>
              </td>
              <td>{prop.required ? 'Yes' : 'No'}</td>
              <td>
                <code>{prop.default ?? '—'}</code>
              </td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.length === 0 ? <p className="props-table__empty">This component has no props.</p> : null}
    </div>
  );
}

export default PropsTable;

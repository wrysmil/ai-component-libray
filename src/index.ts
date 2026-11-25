/**
 * Public entry point of the component library.
 *
 * Every component (and its types) must be registered here — the manifest
 * generator fails the build when a component is missing from this file.
 */

export { Button } from './components/button/button.js';
export type { ButtonProps } from './components/button/types.js';

export { IconButton } from './components/icon-button/icon-button.js';
export type { IconButtonProps } from './components/icon-button/types.js';

export { TextInput } from './components/text-input/text-input.js';
export type { TextInputProps } from './components/text-input/types.js';

export { Select } from './components/select/select.js';
export type { SelectOption, SelectProps } from './components/select/types.js';

export { Checkbox } from './components/checkbox/checkbox.js';
export type { CheckboxProps } from './components/checkbox/types.js';

export { Card } from './components/card/card.js';
export type { CardProps } from './components/card/types.js';

export { DataTable } from './components/data-table/data-table.js';
export type {
  DataTableColumn,
  DataTableProps,
  DataTableRow,
} from './components/data-table/types.js';

export { Modal } from './components/modal/modal.js';
export type { ModalProps } from './components/modal/types.js';

export { Tooltip } from './components/tooltip/tooltip.js';
export type { TooltipProps } from './components/tooltip/types.js';

export { Tabs } from './components/tabs/tabs.js';
export type { TabItem, TabsProps } from './components/tabs/types.js';

export { Progress } from './components/progress/progress.js';
export type { ProgressProps } from './components/progress/types.js';

export { EmptyState } from './components/empty-state/empty-state.js';
export type { EmptyStateProps } from './components/empty-state/types.js';

export { CATEGORIES } from './core/types.js';
export type {
  Category,
  ComponentFile,
  ComponentMeta,
  FileRole,
  Manifest,
  ManifestEntry,
  PropMeta,
  SearchMatch,
  SearchProvider,
  SearchQuery,
  SearchResult,
} from './core/types.js';

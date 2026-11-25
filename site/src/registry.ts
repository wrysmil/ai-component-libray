/**
 * Registry that maps a component id to its React implementation.
 *
 * The showcase site imports the components from the library source, so the
 * preview is the real component — not a screenshot or a copy.
 */

import { createElement } from 'react';
import type { ReactElement } from 'react';

import { Button } from '../../src/components/button/button.js';
import '../../src/components/button/button.css';
import type { ButtonProps } from '../../src/components/button/types.js';

import { IconButton } from '../../src/components/icon-button/icon-button.js';
import '../../src/components/icon-button/icon-button.css';
import type { IconButtonProps } from '../../src/components/icon-button/types.js';

import { TextInput } from '../../src/components/text-input/text-input.js';
import '../../src/components/text-input/text-input.css';
import type { TextInputProps } from '../../src/components/text-input/types.js';

import { Select } from '../../src/components/select/select.js';
import '../../src/components/select/select.css';
import type { SelectProps } from '../../src/components/select/types.js';

import { Checkbox } from '../../src/components/checkbox/checkbox.js';
import '../../src/components/checkbox/checkbox.css';
import type { CheckboxProps } from '../../src/components/checkbox/types.js';

import { Card } from '../../src/components/card/card.js';
import '../../src/components/card/card.css';
import type { CardProps } from '../../src/components/card/types.js';

import { DataTable } from '../../src/components/data-table/data-table.js';
import '../../src/components/data-table/data-table.css';
import type { DataTableProps } from '../../src/components/data-table/types.js';

import { Modal } from '../../src/components/modal/modal.js';
import '../../src/components/modal/modal.css';
import type { ModalProps } from '../../src/components/modal/types.js';

import { Tooltip } from '../../src/components/tooltip/tooltip.js';
import '../../src/components/tooltip/tooltip.css';
import type { TooltipProps } from '../../src/components/tooltip/types.js';

import { Tabs } from '../../src/components/tabs/tabs.js';
import '../../src/components/tabs/tabs.css';
import type { TabsProps } from '../../src/components/tabs/types.js';

import { Progress } from '../../src/components/progress/progress.js';
import '../../src/components/progress/progress.css';
import type { ProgressProps } from '../../src/components/progress/types.js';

import { EmptyState } from '../../src/components/empty-state/empty-state.js';
import '../../src/components/empty-state/empty-state.css';
import type { EmptyStateProps } from '../../src/components/empty-state/types.js';

export interface ComponentDescriptor {
  id: string;
  /** Render the component with the given (user controlled) props. */
  render: (props: Record<string, unknown>) => ReactElement;
}

export const registry: Record<string, ComponentDescriptor> = {
  button: {
    id: 'button',
    render: (props) => createElement(Button, props as unknown as ButtonProps),
  },
  'icon-button': {
    id: 'icon-button',
    render: (props) => createElement(IconButton, props as unknown as IconButtonProps),
  },
  'text-input': {
    id: 'text-input',
    render: (props) => createElement(TextInput, props as unknown as TextInputProps),
  },
  select: {
    id: 'select',
    render: (props) => createElement(Select, props as unknown as SelectProps),
  },
  checkbox: {
    id: 'checkbox',
    render: (props) => createElement(Checkbox, props as unknown as CheckboxProps),
  },
  card: {
    id: 'card',
    render: (props) => createElement(Card, props as unknown as CardProps),
  },
  'data-table': {
    id: 'data-table',
    render: (props) => createElement(DataTable, props as unknown as DataTableProps),
  },
  modal: {
    id: 'modal',
    render: (props) => createElement(Modal, props as unknown as ModalProps),
  },
  tooltip: {
    id: 'tooltip',
    render: (props) => createElement(Tooltip, props as unknown as TooltipProps),
  },
  tabs: {
    id: 'tabs',
    render: (props) => createElement(Tabs, props as unknown as TabsProps),
  },
  progress: {
    id: 'progress',
    render: (props) => createElement(Progress, props as unknown as ProgressProps),
  },
  'empty-state': {
    id: 'empty-state',
    render: (props) => createElement(EmptyState, props as unknown as EmptyStateProps),
  },
};

/** Ids of every registered component. */
export const registryIds = Object.keys(registry);

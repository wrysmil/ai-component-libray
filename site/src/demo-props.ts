/**
 * Default props used by the showcase preview.
 *
 * They provide a meaningful first render for every component and give the
 * auto generated controls a sensible starting point.
 */

export const demoProps: Record<string, Record<string, unknown>> = {
  button: {
    variant: 'primary',
    size: 'medium',
    loading: false,
    children: 'Click me',
  },
  'icon-button': {
    icon: '★',
    label: 'Favourite',
    size: 'medium',
    variant: 'ghost',
    disabled: false,
  },
  'text-input': {
    label: 'Full name',
    value: '',
    placeholder: 'Jane Doe',
    hint: 'As it appears on your ID.',
    type: 'text',
    required: false,
    disabled: false,
    onChange: () => undefined,
  },
  select: {
    label: 'Framework',
    value: 'react',
    options: [
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
      { label: 'Svelte', value: 'svelte' },
    ],
    placeholder: 'Pick one',
    size: 'medium',
    disabled: false,
    onChange: () => undefined,
  },
  checkbox: {
    label: 'Accept the terms of service',
    checked: true,
    indeterminate: false,
    disabled: false,
    onChange: () => undefined,
  },
  card: {
    title: 'Component of the day',
    description: 'A card groups related content with an optional action area.',
    variant: 'default',
    padding: 'md',
    children: 'Cards are the building blocks of most interfaces.',
  },
  'data-table': {
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'role', title: 'Role', sortable: true },
      { key: 'status', title: 'Status' },
    ],
    rows: [
      { name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
      { name: 'Alan Turing', role: 'Researcher', status: 'Active' },
      { name: 'Grace Hopper', role: 'Admiral', status: 'On leave' },
      { name: 'Katherine Johnson', role: 'Mathematician', status: 'Active' },
      { name: 'Margaret Hamilton', role: 'Engineer', status: 'Inactive' },
      { name: 'Radia Perlman', role: 'Networker', status: 'Active' },
    ],
    pageSize: 5,
    emptyText: 'No data yet',
    loading: false,
  },
  modal: {
    open: true,
    title: 'Delete component',
    size: 'medium',
    closeOnOverlayClick: true,
    closeOnEsc: true,
    footer: 'Close',
    children: 'This action cannot be undone.',
    onClose: () => undefined,
  },
  tooltip: {
    content: 'Explains what this control does',
    placement: 'top',
    delay: 200,
    disabled: false,
    children: 'Hover or focus me',
  },
  tabs: {
    tabs: [
      { id: 'overview', label: 'Overview', content: 'Overview panel' },
      { id: 'props', label: 'Props', content: 'Props panel' },
      { id: 'usage', label: 'Usage', content: 'Usage panel' },
    ],
    value: 'overview',
    variant: 'line',
    onChange: () => undefined,
  },
  progress: {
    value: 40,
    max: 100,
    variant: 'linear',
    showLabel: true,
  },
  'empty-state': {
    title: 'No components yet',
    description: 'Add your first component to see it here.',
    icon: '📦',
    size: 'md',
  },
};

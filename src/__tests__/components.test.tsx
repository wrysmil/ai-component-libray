/** @vitest-environment jsdom */
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Checkbox } from '../components/checkbox/checkbox.js';
import { DataTable } from '../components/data-table/data-table.js';
import { Modal } from '../components/modal/modal.js';
import { Select } from '../components/select/select.js';
import { Tabs } from '../components/tabs/tabs.js';
import { TextInput } from '../components/text-input/text-input.js';
import { Tooltip } from '../components/tooltip/tooltip.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const tabItems = [
  { id: 'overview', label: 'Overview', content: 'Overview panel' },
  { id: 'props', label: 'Props', content: 'Props panel' },
  { id: 'usage', label: 'Usage', content: 'Usage panel' },
];

describe('Tabs', () => {
  it('moves the focus with the arrow keys and selects the tab', () => {
    render(<Tabs tabs={tabItems} />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    const props = screen.getByRole('tab', { name: 'Props' });

    overview.focus();
    fireEvent.keyDown(overview, { key: 'ArrowRight' });

    expect(document.activeElement).toBe(props);
    expect(props.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Props panel');
  });

  it('jumps to the first / last tab with Home and End', () => {
    render(<Tabs tabs={tabItems} />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    const usage = screen.getByRole('tab', { name: 'Usage' });

    overview.focus();
    fireEvent.keyDown(overview, { key: 'End' });
    expect(document.activeElement).toBe(usage);
    expect(usage.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(usage, { key: 'Home' });
    expect(document.activeElement).toBe(overview);
    expect(overview.getAttribute('aria-selected')).toBe('true');
  });

  it('skips disabled tabs', () => {
    render(
      <Tabs
        tabs={[
          { id: 'a', label: 'A', content: 'A panel' },
          { id: 'b', label: 'B', content: 'B panel', disabled: true },
          { id: 'c', label: 'C', content: 'C panel' },
        ]}
      />,
    );

    const a = screen.getByRole('tab', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'C' }));
  });

  it('uses unique ids for every instance', () => {
    render(
      <>
        <Tabs tabs={tabItems} />
        <Tabs tabs={tabItems} />
      </>,
    );

    const ids = screen.getAllByRole('tab').map((tab) => tab.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);

    const panelIds = screen
      .getAllByRole('tab', { hidden: true })
      .map((tab) => tab.getAttribute('aria-controls'));
    expect(new Set(panelIds).size).toBe(panelIds.length);
  });

  it('warns when the component is controlled without an onChange handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Tabs tabs={tabItems} value="overview" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('onChange'));
  });
});

describe('Tooltip', () => {
  it('associates the bubble with the trigger element through aria-describedby', async () => {
    render(
      <Tooltip content="删除当前条目" delay={0}>
        <button type="button">🗑</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button');
    expect(trigger.getAttribute('aria-describedby')).toBeNull();

    fireEvent.focusIn(trigger);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
      expect(tooltip.textContent).toBe('删除当前条目');
    });
  });

  it('closes the bubble with the Escape key', async () => {
    render(
      <Tooltip content="提示" delay={0}>
        <button type="button">触发</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button');
    fireEvent.focusIn(trigger);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });

    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});

describe('Modal', () => {
  function Harness({ onDialogClick }: { onDialogClick?: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          打开弹窗
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="确认删除" onClick={onDialogClick}>
          <button type="button">确定</button>
        </Modal>
      </>
    );
  }

  it('moves the focus into the dialog and gives it back on close', () => {
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: '打开弹窗' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes with the Escape key', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '打开弹窗' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on a backdrop click but not on a click inside the dialog', () => {
    const onDialogClick = vi.fn();
    render(<Harness onDialogClick={onDialogClick} />);
    fireEvent.click(screen.getByRole('button', { name: '打开弹窗' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(onDialogClick).toHaveBeenCalledTimes(1);

    const overlay = dialog.parentElement;
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as HTMLElement);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the keyboard focus inside the dialog', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '打开弹窗' }));

    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: '关闭' });
    const confirm = screen.getByRole('button', { name: '确定' });

    close.focus();
    fireEvent.keyDown(close, { key: 'Tab' });
    expect(document.activeElement).toBe(confirm);

    fireEvent.keyDown(confirm, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(close);
  });
});

describe('controlled inputs', () => {
  it('warns when a TextInput is controlled without an onChange handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<TextInput label="姓名" value="fixed" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('onChange'));
  });

  it('warns when a Select is controlled without an onChange handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Select label="框架" value="react" options={[{ label: 'React', value: 'react' }]} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('onChange'));
  });

  it('warns when a Checkbox is controlled without an onChange handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Checkbox label="同意" checked />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('onChange'));
  });

  it('does not warn when the onChange handler is given', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<TextInput label="姓名" value="fixed" onChange={() => undefined} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('reports the new value of a TextInput', () => {
    const onChange = vi.fn();
    render(<TextInput label="姓名" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('姓名'), { target: { value: 'Ada' } });
    expect(onChange).toHaveBeenCalledWith('Ada');
  });
});

describe('DataTable', () => {
  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'role', title: 'Role', sortable: true },
  ];
  const rows = [
    { id: 'b', name: 'Beta', role: 'Engineer' },
    { id: 'a', name: 'Alpha', role: 'Researcher' },
  ];

  it('sorts ascending and toggles the direction', () => {
    render(<DataTable columns={columns} rows={rows} />);

    const header = screen.getByRole('columnheader', { name: /Name/ });
    expect(header.getAttribute('aria-sort')).toBe('none');

    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    const names = () =>
      screen.getAllByRole('row').slice(1).map((row) => row.textContent?.startsWith('Alpha'));
    expect(names()).toEqual([true, false]);
    expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBe(
      'ascending',
    );

    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(names()).toEqual([false, true]);
    expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBe(
      'descending',
    );
  });

  it('passes the absolute row index to the render callback', () => {
    const renderCell = vi.fn((row: { name: string }) => row.name);
    render(
      <DataTable
        columns={[{ key: 'name', title: 'Name', render: renderCell }]}
        rows={rows}
        pageSize={1}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(renderCell).toHaveBeenLastCalledWith(rows[1], 1);
  });

  it('uses the rowKey callback for the row identity', () => {
    const rowKey = vi.fn((row: { id: string }) => `key-${row.id}`);
    render(<DataTable columns={columns} rows={rows} rowKey={rowKey} />);
    expect(rowKey).toHaveBeenCalled();
    expect(rowKey.mock.calls[0]?.[0]).toHaveProperty('id');
  });
});

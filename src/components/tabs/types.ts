import type { HTMLAttributes, ReactNode } from 'react';

export interface TabItem {
  /** 标签唯一标识。 */
  id: string;
  /** 标签显示文本。 */
  label: string;
  /** 是否禁用该标签。 */
  disabled?: boolean;
  /** 标签对应的内容。 */
  content?: ReactNode;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 标签页定义列表。 */
  tabs: TabItem[];
  /** 受控选中项 id，提供后组件进入受控模式。 */
  value?: string;
  /** 默认选中项 id，未提供时选中第一项。 */
  defaultValue?: string;
  /** 切换选中标签时的回调。 */
  onChange?: (id: string) => void;
  /**
   * 视觉变体。
   * @default "line"
   */
  variant?: 'line' | 'pill';
}

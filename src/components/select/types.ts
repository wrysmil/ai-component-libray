import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  /** 显示文本 */
  label: string;
  /** 选项值 */
  value: string;
  /** 是否禁用该选项 */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'onChange' | 'value' | 'defaultValue' | 'size'
  > {
  /**
   * 选项列表。
   */
  options: SelectOption[];
  /**
   * 受控值，传入后组件为受控模式。
   */
  value?: string;
  /**
   * 初始值（非受控）。
   */
  defaultValue?: string;
  /**
   * 新值回调，参数是选中项的值。
   */
  onChange?: (value: string) => void;
  /**
   * 表单标签，与下拉框通过 id 关联。
   */
  label?: string;
  /**
   * 空值时显示的占位选项，value 为空字符串。
   */
  placeholder?: string;
  /**
   * 是否禁用下拉框。
   * @default false
   */
  disabled?: boolean;
  /**
   * 下拉框尺寸。
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
}

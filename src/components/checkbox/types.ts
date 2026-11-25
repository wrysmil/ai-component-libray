import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'checked' | 'defaultChecked'
  > {
  /**
   * 复选框文本标签，点击标签可切换勾选状态。
   */
  label?: string;
  /**
   * 受控勾选状态，传入后组件为受控模式。
   */
  checked?: boolean;
  /**
   * 初始勾选状态（非受控）。
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * 勾选状态变化回调，参数是新的勾选状态。
   */
  onChange?: (checked: boolean) => void;
  /**
   * 半选状态，通过 DOM property 设置。
   * @default false
   */
  indeterminate?: boolean;
  /**
   * 是否禁用复选框。
   * @default false
   */
  disabled?: boolean;
  /**
   * 表单字段名。
   */
  name?: string;
  /**
   * 表单提交时携带的值。
   * @default "on"
   */
  value?: string;
}

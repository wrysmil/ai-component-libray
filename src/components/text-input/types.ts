import type { InputHTMLAttributes } from 'react';

export interface TextInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'defaultValue' | 'type'
  > {
  /**
   * 表单标签，与输入框通过 id 关联。
   */
  label?: string;
  /**
   * 受控值，传入后组件为受控模式。
   */
  value?: string;
  /**
   * 初始值（非受控）。
   */
  defaultValue?: string;
  /**
   * 值变化回调，参数是新字符串。
   */
  onChange?: (value: string) => void;
  /**
   * 占位提示文本。
   */
  placeholder?: string;
  /**
   * 输入框下方的辅助说明。
   */
  hint?: string;
  /**
   * 错误信息，传入后进入错误态。
   */
  error?: string;
  /**
   * 是否为必填项。
   * @default false
   */
  required?: boolean;
  /**
   * 是否禁用输入框。
   * @default false
   */
  disabled?: boolean;
  /**
   * 输入框类型。
   * @default "text"
   */
  type?: 'text' | 'email' | 'password' | 'search';
}

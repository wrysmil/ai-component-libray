import { useState } from 'react';

import { Modal } from './modal.js';
import type { ModalProps } from './types.js';

/**
 * Minimal runnable example of the Modal component.
 */
export function ModalExample(props: ModalProps) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<NonNullable<ModalProps['size']>>('medium');

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button type="button" onClick={() => setOpen(true)}>
        打开弹窗
      </button>
      <button type="button" onClick={() => setSize('large')}>
        打开大尺寸弹窗
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="确认操作"
        size={size}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)}>
              取消
            </button>
            <button type="button" onClick={() => setOpen(false)}>
              确定
            </button>
          </>
        }
      >
        <p>这是一个模态弹窗，按 Esc 或点击遮罩都可以关闭。</p>
      </Modal>

      <Modal {...props}>Spread props</Modal>
    </div>
  );
}

export default ModalExample;

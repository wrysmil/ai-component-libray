import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'tabs',
  name: 'Tabs',
  title: '标签页',
  category: 'navigation',
  tags: ['tabs', 'tab', 'navigation', 'segmented', 'switcher'],
  keywords: ['tabs', 'tab', '标签页', '选项卡', '分段控件', 'segmented'],
  description: '受控/非受控的标签页导航，支持线型与药丸型两种视觉变体。',
  summary: '标签页导航组件。',
  whenToUse: ['同一区域需要在若干并列视图间切换', '想用分段控件替代多个按钮'],
  whenNotToUse: ['内容是路由地址（请用导航链接）', '只有两个选项且互斥（请用 Select 或 radio）'],
  propsType: 'TabsProps',
  dependencies: [],
} satisfies ComponentMeta;

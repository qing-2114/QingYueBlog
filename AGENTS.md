## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## `my-hello-agent` 项目页构建要求

- 使用可视化动画展示真实的实验进度，参考用户提供的两张执行链路卡片组织流程。
- 流程图采用浅色网格、节点、箭头、流动数据包、当前节点高亮和底部详情栏，保持页面现有的字体、颜色 token、圆角和间距。
- 每个节点与分支必须能对应到源代码或实验记录；明确区分主执行链、工具/迭代回环和结束分支，不虚构实验结果。
- 提供播放/暂停控制；点击节点可查看详情并暂停，节点选择支持 Enter/Space 键盘操作。
- 尊重 `prefers-reduced-motion`，减少动画并默认保持可读状态。
- 兼容桌面端和移动端；宽流程图只在所属卡片内部横向滚动，不造成页面整体溢出。
- 更新项目内容时同步维护 `src/content/blog/my-hello-agent.mdx` 与 `src/data/experiment-flows.ts`，组件逻辑放在 `src/components/ExperimentFlow.astro`。
- 发布前运行 `npm run build`、`git diff --check`，并进行桌面/移动端浏览器交互检查，确认页面错误为 0。
- 保留 Astro 的 `/QingYueBlog/` base path；完成后推送 `origin/master`，等待 GitHub Pages workflow 成功并检查线上项目页。

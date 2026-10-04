# 清月 · 个人博客

记录 AI Agent、机器人与嵌入式实践的个人博客，基于 [Astro](https://docs.astro.build) 构建，部署在 GitHub Pages：

<https://qing-2114.github.io/QingYueBlog/>

## 本地开发

需要 Node.js ≥ 22.12。

```sh
npm ci
npm run dev       # 本地开发服务器
npm run check     # 类型与 frontmatter 检查
npm run build     # 构建到 ./dist
npm run preview   # 预览构建结果
```

站点使用 `/QingYueBlog/` 作为 base path，本地访问地址为 `http://localhost:4321/QingYueBlog/`。

### Windows 与 WSL 共用 node_modules

npm 只会安装执行 `npm install` 的那个平台的原生依赖（rolldown、esbuild、sharp、lightningcss 等）。在 Windows 装好依赖后切到 WSL 构建，会报 `Cannot find module './rolldown-binding.wasi.cjs'` 之类的错误。

`npm run dev` 和 `npm run build` 会先执行 `scripts/ensure-native-deps.mjs`，自动补装当前平台缺少的绑定，不会改动其余依赖，所以两个平台可以共用同一份 `node_modules`。如果直接运行 `astro dev --background` 等命令，先手动执行一次：

```sh
npm run native
```

## 目录结构

```text
src/
├── content/blog/       文章（Markdown / MDX）
├── content/projects/   项目档案
├── data/               项目页实验流程数据
├── components/         组件（含实验流程动画）
├── layouts/            文章布局
├── pages/              路由，含 rss.xml
├── styles/global.css   设计 token 与全局样式
└── assets/             图片与字体
```

## 订阅

- RSS：`/QingYueBlog/rss.xml`
- Sitemap：`/QingYueBlog/sitemap-index.xml`

## 部署

推送到 `master` 后，`.github/workflows/deploy.yml` 会依次运行类型检查和构建，然后发布到 GitHub Pages。

# 安全人的一生（SecLife）

一款“短时间看到一段可能人生”的安全主题人生模拟。安全只是人生中的一种选择，你能掌控的是选择与节奏，无法掌控的是时代与事件。

## 项目价值

- 以“可控 / 不可控”的人生分岔为核心体验
- 短周期体验一段可能的人生轨迹与结局
- 记录关键节点、成就与人生阶段的变化

## 本地运行

**环境要求**

- Node.js 18+
- npm（或 pnpm/yarn 也可）

**安装依赖**

```bash
npm install
```

**启动开发环境**

```bash
npm run dev
```

**构建**

```bash
npm run build
```

**测试**

```bash
npm test
```

## 部署到 GitHub Pages

本项目已配置 GitHub Actions 自动构建并部署到 Pages。

部署地址：`https://gb233.github.io/SecLife/`

说明：

- `vite.config.ts` 已设置 `base: "/SecLife/"`
- Actions 将自动构建 `dist/` 并部署到 Pages

如需手动部署，可执行：

```bash
npm run build
```

然后将 `dist/` 发布到 Pages。

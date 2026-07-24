# Chem3D Learn 演示视频

65 秒、1920×1080、30 fps 的中文网站演示视频。素材来自当前 Chem3D Learn 前端真实页面，Remotion 负责镜头编排、字幕和品牌动效。

## Commands

```bash
npm run capture
npm run lint
npm run stills
npm run dev
npm run render
```

`npm run capture` 默认从 `http://127.0.0.1:5173` 录制；可通过 `CHEM3D_CAPTURE_URL` 指定其他本地地址。

成片输出：`out/chem3d-learn-demo.mp4`。

代表帧输出到 `out/stills/`。如果在 Codex 沙箱中遇到 Chromium 权限限制，请直接在 macOS Terminal 中运行 `npm run stills` 和 `npm run render`。

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

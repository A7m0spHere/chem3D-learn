import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 主包是单 chunk，无静态子 chunk 需预加载；关闭 modulePreload 避免 Vite
    // 在每个页面都预加载 three/r3f（否则首页仍会下载 ~280KB，抵消代码分割收益）。
    // three/r3f 改由进入 3D 模块或悬停预取时按需加载。
    modulePreload: false,
    rollupOptions: {
      output: {
        // 把重型 3D 依赖切成独立 vendor chunk，配合 React.lazy 让首页/考试页等
        // 非 3D 页面不再下载 three.js 与 R3F。
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});

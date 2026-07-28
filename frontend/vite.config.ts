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
    // 3D 页面通过路由 lazy 与显式预取按需加载。这里不再用对象式 manualChunks
    // 强制拆 three/r3f，因为它会吸收共享 React 运行时，反而让首页静态依赖 3D vendor。
    // 关闭 modulePreload，避免 Vite 为当前动态入口主动插入模块预加载。
    modulePreload: false,
  },
});

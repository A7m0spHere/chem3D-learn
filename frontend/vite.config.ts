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
    rollupOptions: {
      output: {
        // 3D 页面通过路由 lazy 与显式预取按需加载。函数式 manualChunks 只按模块 id
        // 把 three 家族归入稳定命名的 "three" chunk；App 代码改动不再使 three chunk
        // 的 hash 失效，体积守卫（scripts/check-bundle-budget.mjs）也以此命名为锚点。
        // 关键：react / react-dom 与 vite 的 __vitePreload 助手必须显式指派到
        // react-vendor——否则 Rollup 会把它们吸收/归组进 manual "three" chunk，
        // 首页入口将静态依赖 3D vendor（react 运行时是吸收，preload-helper 是
        // 共享归组，均已实测验证）。react-reconciler / scheduler / zustand 等
        // 仅被 fiber 使用的依赖不在此指派，由默认归组进 three chunk，首页无需下载。
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](three|three-stdlib|@react-three)[\\/]/.test(id)) {
            return "three";
          }
          if (id.includes("vite/preload-helper") || /[\\/]node_modules[\\/](react-dom|react)[\\/]/.test(id)) {
            return "react-vendor";
          }
        },
      },
    },
    // 关闭 modulePreload，避免 Vite 为当前动态入口主动插入模块预加载。
    modulePreload: false,
  },
});

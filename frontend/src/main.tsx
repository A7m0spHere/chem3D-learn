import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { installPreloadErrorRecovery } from "@/lib/preloadRecovery";
import { appRouter } from "./router";
import "./styles/globals.css";

// 注册在 React 树之外，因此 StrictMode 的开发态重复渲染不会重复绑定监听器。
installPreloadErrorRecovery();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
  </React.StrictMode>,
);

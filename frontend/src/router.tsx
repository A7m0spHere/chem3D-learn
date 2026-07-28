import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import { AboutPage } from "@/pages/AboutPage";
import { ExamPage } from "@/pages/ExamPage";
import { ExamTopicDetailPage } from "@/pages/ExamTopicDetailPage";
import { HomePage } from "@/pages/HomePage";
import { ModulesPage } from "@/pages/ModulesPage";
import { PathsPage } from "@/pages/PathsPage";

const routerBaseName = new URL(document.baseURI).pathname.replace(/\/$/, "") || "/";

export const appRouter = createBrowserRouter([
  {
    element: <App />,
    hydrateFallbackElement: <RouteHydrateFallback />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/modules", element: <ModulesPage /> },
      { path: "/paths", element: <PathsPage /> },
      {
        path: "/module/:id",
        lazy: async () => {
          const { ModuleDetailPage } = await import("@/pages/ModuleDetailPage");
          return { Component: ModuleDetailPage };
        },
      },
      {
        path: "/lab/organic-builder/:seedId",
        lazy: async () => {
          const { OrganicBuilderPage } = await import("@/pages/OrganicBuilderPage");
          return { Component: OrganicBuilderPage };
        },
      },
      { path: "/exam", element: <ExamPage /> },
      { path: "/exam/:id", element: <ExamTopicDetailPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "*", element: <HomePage /> },
    ],
  },
], {
  basename: routerBaseName,
});

function RouteHydrateFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="motion-fade-in rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-text-secondary shadow-sm">
        正在加载 3D 学习空间…
      </div>
    </main>
  );
}

import { useEffect, useRef } from "react";
import { AlertTriangle, Beaker, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  clearPreloadRecoveryGuard,
  PreloadRecoveryError,
  wasPreloadErrorDetected,
} from "@/lib/preloadRecovery";

type RouteErrorContent = {
  description: string;
  title: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

export function isDynamicImportError(error: unknown): boolean {
  if (error instanceof PreloadRecoveryError) return true;

  return /dynamically imported module|importing a module script failed|unable to preload css/i.test(
    getErrorMessage(error),
  );
}

export function getRouteErrorContent(
  error: unknown,
  preloadErrorDetected = wasPreloadErrorDetected(),
): RouteErrorContent {
  if (preloadErrorDetected || isDynamicImportError(error)) {
    return {
      title: "学习页面需要重新加载",
      description: "网站可能刚刚更新，请刷新后重试。刷新会保留当前地址，并重新打开这个学习模块。",
    };
  }

  return {
    title: "页面暂时无法打开",
    description: "加载这个页面时遇到了意外问题。你可以刷新重试，或先返回首页继续浏览。",
  };
}

export function getAppHomeHref(baseUri: string): string {
  return new URL("./", baseUri).pathname;
}

function getDevelopmentDetails(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`.trim();
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

function isDevelopmentBuild(): boolean {
  return Boolean(
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
  );
}

export function RouteErrorPage() {
  const error = useRouteError();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const content = getRouteErrorContent(error);
  const homeHref = getAppHomeHref(document.baseURI);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleRetry = () => {
    // 用户主动重试时清除自动恢复冷却标记；之后是否再次刷新由用户决定，
    // 不会形成无人干预的自动循环。
    clearPreloadRecoveryGuard();
    window.location.reload();
  };

  return (
    <main
      aria-labelledby="route-error-title"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-44 w-44 rounded-full border border-primary/15" />
        <div className="absolute left-[13%] top-[20%] h-3 w-3 rounded-full bg-primary/30" />
        <div className="absolute bottom-[10%] right-[7%] h-64 w-64 rounded-full border border-accent/20" />
        <div className="absolute bottom-[24%] right-[16%] h-4 w-4 rounded-full bg-accent/40" />
      </div>

      <section className="motion-page-enter relative w-full max-w-2xl rounded-3xl border border-border bg-surface px-6 py-10 text-center shadow-panel sm:px-12 sm:py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary-light text-primary-dark shadow-sm">
          <AlertTriangle aria-hidden="true" className="h-8 w-8" />
        </div>

        <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-primary-dark">
          <Beaker aria-hidden="true" className="h-4 w-4" />
          Chem3D Learn
        </div>

        <h1
          className="text-2xl font-bold tracking-tight text-text-primary outline-none sm:text-3xl"
          id="route-error-title"
          ref={headingRef}
          tabIndex={-1}
        >
          {content.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-text-secondary">
          {content.description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="rounded-xl" onClick={handleRetry} size="lg" type="button">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            刷新并重试
          </Button>
          <Button asChild className="rounded-xl" size="lg" variant="secondary">
            <a href={homeHref}>
              <Home aria-hidden="true" className="h-4 w-4" />
              返回首页
            </a>
          </Button>
        </div>

        {isDevelopmentBuild() && (
          <details className="mt-8 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm text-text-secondary">
            <summary className="cursor-pointer font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              开发调试信息
            </summary>
            <p className="mt-2 break-words font-mono text-xs leading-5">
              {getDevelopmentDetails(error)}
            </p>
          </details>
        )}
      </section>
    </main>
  );
}

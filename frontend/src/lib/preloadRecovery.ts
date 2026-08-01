export const PRELOAD_RECOVERY_COOLDOWN_MS = 60_000;
export const PRELOAD_RECOVERY_STORAGE_KEY = "chem3d:preload-recovery-at";

const PRELOAD_RECOVERY_HISTORY_KEY = "__chem3dPreloadRecoveryAt";
const PRELOAD_RECOVERY_WINDOW_KEY = "__chem3dPreloadRecovery";

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;
type HistoryLike = Pick<History, "replaceState" | "state">;
type LocationLike = Pick<Location, "href" | "reload">;

type PreloadRecoveryRuntime = {
  getSessionStorage: () => StorageLike | null;
  history: HistoryLike | null;
  location: LocationLike;
  now: () => number;
};

export type PreloadErrorRecoveryController = {
  clearGuard: () => void;
  didDetectPreloadError: () => boolean;
  handlePreloadError: (event: Event) => void;
};

type WindowWithPreloadRecovery = Window & {
  [PRELOAD_RECOVERY_WINDOW_KEY]?: PreloadErrorRecoveryController;
};

let activeController: PreloadErrorRecoveryController | null = null;

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp >= 0 ? timestamp : null;
}

function readSessionAttempt(runtime: PreloadRecoveryRuntime): number | null {
  try {
    return parseTimestamp(runtime.getSessionStorage()?.getItem(PRELOAD_RECOVERY_STORAGE_KEY));
  } catch {
    return null;
  }
}

function readHistoryAttempt(history: HistoryLike | null): number | null {
  try {
    const state = history?.state;
    if (!state || typeof state !== "object") return null;

    return parseTimestamp((state as Record<string, unknown>)[PRELOAD_RECOVERY_HISTORY_KEY]);
  } catch {
    return null;
  }
}

function writeSessionAttempt(runtime: PreloadRecoveryRuntime, timestamp: number): boolean {
  try {
    const storage = runtime.getSessionStorage();
    if (!storage) return false;

    storage.setItem(PRELOAD_RECOVERY_STORAGE_KEY, String(timestamp));
    return storage.getItem(PRELOAD_RECOVERY_STORAGE_KEY) === String(timestamp);
  } catch {
    return false;
  }
}

function writeHistoryAttempt(runtime: PreloadRecoveryRuntime, timestamp: number): boolean {
  try {
    if (!runtime.history) return false;

    const currentState = runtime.history.state;
    const nextState =
      currentState && typeof currentState === "object"
        ? { ...(currentState as Record<string, unknown>) }
        : {};
    nextState[PRELOAD_RECOVERY_HISTORY_KEY] = timestamp;
    runtime.history.replaceState(nextState, "", runtime.location.href);
    return readHistoryAttempt(runtime.history) === timestamp;
  } catch {
    return false;
  }
}

function clearSessionAttempt(runtime: PreloadRecoveryRuntime) {
  try {
    runtime.getSessionStorage()?.removeItem(PRELOAD_RECOVERY_STORAGE_KEY);
  } catch {
    // 隐私模式或浏览器策略可能禁止 storage；继续清理 history.state。
  }
}

function clearHistoryAttempt(runtime: PreloadRecoveryRuntime) {
  try {
    if (!runtime.history) return;

    const currentState = runtime.history.state;
    if (!currentState || typeof currentState !== "object") return;

    const nextState = { ...(currentState as Record<string, unknown>) };
    delete nextState[PRELOAD_RECOVERY_HISTORY_KEY];
    runtime.history.replaceState(nextState, "", runtime.location.href);
  } catch {
    // history.state 同样可能被浏览器策略限制；手动刷新仍然可以继续。
  }
}

export function createPreloadErrorRecovery(
  runtime: PreloadRecoveryRuntime,
): PreloadErrorRecoveryController {
  let preloadErrorDetected = false;
  let reloadRequested = false;

  return {
    clearGuard: () => {
      reloadRequested = false;
      clearSessionAttempt(runtime);
      clearHistoryAttempt(runtime);
    },
    didDetectPreloadError: () => preloadErrorDetected,
    handlePreloadError: (event) => {
      // Vite 只有在事件未被取消时才继续抛出原始资源错误。
      // 取消后，路由层可以展示本站自己的恢复页面。
      event.preventDefault();
      preloadErrorDetected = true;

      if (reloadRequested) return;

      const now = runtime.now();
      const previousAttempts = [
        readSessionAttempt(runtime),
        readHistoryAttempt(runtime.history),
      ].filter((timestamp): timestamp is number => timestamp !== null);
      const previousAttempt = previousAttempts.length > 0 ? Math.max(...previousAttempts) : null;

      if (previousAttempt !== null && now - previousAttempt < PRELOAD_RECOVERY_COOLDOWN_MS) {
        return;
      }

      // sessionStorage 不可用时回退到 history.state，它能跨当前 URL 的刷新保留，
      // 且不会向地址栏添加恢复参数。两者都不可写时不自动刷新，避免无限循环。
      const persisted =
        writeSessionAttempt(runtime, now) || writeHistoryAttempt(runtime, now);
      if (!persisted) return;

      reloadRequested = true;
      runtime.location.reload();
    },
  };
}

export function installPreloadErrorRecovery(
  browserWindow: Window = window,
): PreloadErrorRecoveryController {
  const recoveryWindow = browserWindow as WindowWithPreloadRecovery;
  const installedController = recoveryWindow[PRELOAD_RECOVERY_WINDOW_KEY];
  if (installedController) {
    activeController = installedController;
    return installedController;
  }

  const controller = createPreloadErrorRecovery({
    getSessionStorage: () => browserWindow.sessionStorage,
    history: browserWindow.history,
    location: browserWindow.location,
    now: () => Date.now(),
  });

  browserWindow.addEventListener("vite:preloadError", controller.handlePreloadError);
  recoveryWindow[PRELOAD_RECOVERY_WINDOW_KEY] = controller;
  activeController = controller;
  return controller;
}

export function clearPreloadRecoveryGuard() {
  activeController?.clearGuard();
}

export function wasPreloadErrorDetected(): boolean {
  return activeController?.didDetectPreloadError() ?? false;
}

export class PreloadRecoveryError extends Error {
  constructor() {
    super("A dynamically imported route module could not be loaded.");
    this.name = "PreloadRecoveryError";
  }
}

export function requireLoadedRouteModule<T>(routeModule: T | undefined): T {
  if (routeModule === undefined) {
    throw new PreloadRecoveryError();
  }

  return routeModule;
}

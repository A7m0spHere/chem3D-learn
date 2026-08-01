import { expect, test } from "@playwright/test";
import {
  createPreloadErrorRecovery,
  installPreloadErrorRecovery,
  PRELOAD_RECOVERY_COOLDOWN_MS,
  PRELOAD_RECOVERY_STORAGE_KEY,
} from "../../src/lib/preloadRecovery";
import { getAppHomeHref, getRouteErrorContent } from "../../src/pages/RouteErrorPage";

type RecoveryHarness = {
  controller: ReturnType<typeof createPreloadErrorRecovery>;
  history: {
    replaceState: (state: unknown) => void;
    state: unknown;
  };
  location: {
    href: string;
    reload: () => void;
  };
  reloads: () => number;
  storageValues: Map<string, string>;
};

function createCancelableEvent() {
  let prevented = false;

  return {
    event: {
      preventDefault: () => {
        prevented = true;
      },
    } as unknown as Event,
    wasPrevented: () => prevented,
  };
}

function createHarness({
  historyState = null,
  now = 1_000,
  storageValues = new Map<string, string>(),
}: {
  historyState?: unknown;
  now?: number;
  storageValues?: Map<string, string>;
} = {}): RecoveryHarness {
  let reloadCount = 0;
  const history = {
    state: historyState,
    replaceState(state: unknown) {
      this.state = state;
    },
  };
  const location = {
    href: "https://example.test/chem3D-learn/module/tetrahedral-ch4?mode=lesson#step-2",
    reload: () => {
      reloadCount += 1;
    },
  };
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    removeItem: (key: string) => storageValues.delete(key),
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  return {
    controller: createPreloadErrorRecovery({
      getSessionStorage: () => storage,
      history,
      location,
      now: () => now,
    }),
    history,
    location,
    reloads: () => reloadCount,
    storageValues,
  };
}

test("第一次 preloadError 只请求一次刷新并保持当前 URL", () => {
  const harness = createHarness();
  const firstEvent = createCancelableEvent();
  const duplicateEvent = createCancelableEvent();
  const originalUrl = harness.location.href;

  harness.controller.handlePreloadError(firstEvent.event);
  harness.controller.handlePreloadError(duplicateEvent.event);

  expect(firstEvent.wasPrevented()).toBe(true);
  expect(duplicateEvent.wasPrevented()).toBe(true);
  expect(harness.reloads()).toBe(1);
  expect(harness.location.href).toBe(originalUrl);
  expect(harness.storageValues.get(PRELOAD_RECOVERY_STORAGE_KEY)).toBe("1000");
});

test("入口重复安装时复用同一控制器且只注册一个监听器", () => {
  const listeners: EventListener[] = [];
  const storageValues = new Map<string, string>();
  const fakeWindow = {
    addEventListener: (type: string, listener: EventListener) => {
      if (type === "vite:preloadError") listeners.push(listener);
    },
    history: {
      replaceState: () => undefined,
      state: null,
    },
    location: {
      href: "https://example.test/chem3D-learn/module/tetrahedral-ch4",
      reload: () => undefined,
    },
    sessionStorage: {
      getItem: (key: string) => storageValues.get(key) ?? null,
      removeItem: (key: string) => storageValues.delete(key),
      setItem: (key: string, value: string) => storageValues.set(key, value),
    },
  } as unknown as Window;

  const firstController = installPreloadErrorRecovery(fakeWindow);
  const secondController = installPreloadErrorRecovery(fakeWindow);

  expect(secondController).toBe(firstController);
  expect(listeners).toHaveLength(1);
});

test("同一冷却期内的新页面实例不会再次自动刷新", () => {
  const sharedStorage = new Map<string, string>();
  const firstPage = createHarness({ storageValues: sharedStorage });
  firstPage.controller.handlePreloadError(createCancelableEvent().event);

  const reloadedPage = createHarness({ now: 1_500, storageValues: sharedStorage });
  const repeatedEvent = createCancelableEvent();
  reloadedPage.controller.handlePreloadError(repeatedEvent.event);

  expect(repeatedEvent.wasPrevented()).toBe(true);
  expect(firstPage.reloads()).toBe(1);
  expect(reloadedPage.reloads()).toBe(0);
});

test("冷却状态过期或被用户清理后允许未来再次恢复", () => {
  const sharedStorage = new Map<string, string>();
  const firstPage = createHarness({ storageValues: sharedStorage });
  firstPage.controller.handlePreloadError(createCancelableEvent().event);

  const expiredPage = createHarness({
    now: 1_000 + PRELOAD_RECOVERY_COOLDOWN_MS,
    storageValues: sharedStorage,
  });
  expiredPage.controller.handlePreloadError(createCancelableEvent().event);
  expect(expiredPage.reloads()).toBe(1);

  expiredPage.controller.clearGuard();
  const manuallyRetriedPage = createHarness({
    now: 1_000 + PRELOAD_RECOVERY_COOLDOWN_MS + 1,
    storageValues: sharedStorage,
  });
  manuallyRetriedPage.controller.handlePreloadError(createCancelableEvent().event);
  expect(manuallyRetriedPage.reloads()).toBe(1);
});

test("sessionStorage 抛错时回退到 history.state，全部不可用时拒绝自动刷新", () => {
  let historyState: unknown = null;
  let fallbackReloads = 0;
  const location = {
    href: "https://example.test/chem3D-learn/module/tetrahedral-ch4",
    reload: () => {
      fallbackReloads += 1;
    },
  };
  const history = {
    get state() {
      return historyState;
    },
    replaceState: (state: unknown) => {
      historyState = state;
    },
  };
  const fallbackController = createPreloadErrorRecovery({
    getSessionStorage: () => {
      throw new Error("blocked");
    },
    history,
    location,
    now: () => 2_000,
  });

  fallbackController.handlePreloadError(createCancelableEvent().event);
  expect(fallbackReloads).toBe(1);

  const reloadedController = createPreloadErrorRecovery({
    getSessionStorage: () => {
      throw new Error("blocked");
    },
    history,
    location,
    now: () => 2_500,
  });
  reloadedController.handlePreloadError(createCancelableEvent().event);
  expect(fallbackReloads).toBe(1);

  let unavailableReloads = 0;
  const unavailableController = createPreloadErrorRecovery({
    getSessionStorage: () => {
      throw new Error("blocked");
    },
    history: null,
    location: {
      href: location.href,
      reload: () => {
        unavailableReloads += 1;
      },
    },
    now: () => 3_000,
  });
  const unavailableEvent = createCancelableEvent();
  unavailableController.handlePreloadError(unavailableEvent.event);

  expect(unavailableEvent.wasPrevented()).toBe(true);
  expect(unavailableReloads).toBe(0);
});

test("错误文案区分动态导入与普通路由错误，并计算 Pages 首页地址", () => {
  const dynamicContent = getRouteErrorContent(
    new TypeError("Failed to fetch dynamically imported module"),
    false,
  );
  const genericContent = getRouteErrorContent(new Error("ordinary route failure"), false);

  expect(dynamicContent.description).toContain("网站可能刚刚更新，请刷新后重试");
  expect(genericContent.title).toBe("页面暂时无法打开");
  expect(genericContent.description).not.toContain("developer");
  expect(getAppHomeHref("https://a7m0sphere.github.io/chem3D-learn/")).toBe(
    "/chem3D-learn/",
  );
  expect(getAppHomeHref("http://127.0.0.1:4173/")).toBe("/");
});

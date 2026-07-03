import { useEffect, useMemo } from "react";

type Disposable = { dispose: () => void };

/**
 * useMemo for three.js resources (geometries, materials). When deps change
 * or the component unmounts, the previous value is disposed — R3F only
 * auto-disposes JSX-declared resources, not ones built in userland code.
 */
export function useDisposable<T extends Disposable>(factory: () => T, deps: readonly unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);

  useEffect(() => () => value.dispose(), [value]);

  return value;
}

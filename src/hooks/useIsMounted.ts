"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Clean, React 18/19-compliant hook to safely detect client-side mounting
 * without triggering hydration mismatch or cascading renders from useEffect + setState.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

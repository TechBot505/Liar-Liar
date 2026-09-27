import { useEffect, useState } from "react";

/**
 * Returns true once the client has mounted. Persisted zustand stores read from
 * localStorage only in the browser, so components gate localStorage-derived UI
 * behind this to avoid SSR/CSR hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether a node is on-screen so deck art can pause its animations when
 * scrolled away (many tiles can share the viewport). Defaults to visible so
 * art still renders if IntersectionObserver is unavailable (SSR / older WebViews).
 */
export function useInView<T extends Element>(): {
  ref: React.RefObject<T | null>;
  inView: boolean;
} {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

import { useEffect, useState, useSyncExternalStore, type RefCallback } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const subscribeToVisibility = (onStoreChange: () => void) => {
  document.addEventListener("visibilitychange", onStoreChange);

  return () => document.removeEventListener("visibilitychange", onStoreChange);
};

const getVisibilitySnapshot = () => document.visibilityState === "visible";
const getServerVisibilitySnapshot = () => false;

interface IntersectionState<T extends Element> {
  element: T;
  threshold: number;
  intersecting: boolean;
}

export function useAmbientMotion<T extends Element>({
  enabled = true,
  threshold = 0,
}: {
  enabled?: boolean;
  threshold?: number;
} = {}): {
  ref: RefCallback<T>;
  active: boolean;
} {
  const [element, setElement] = useState<T | null>(null);
  const [intersection, setIntersection] = useState<IntersectionState<T> | null>(null);
  const documentVisible = useSyncExternalStore(
    subscribeToVisibility,
    getVisibilitySnapshot,
    getServerVisibilitySnapshot,
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") return;

    let observing = true;
    const observer = new IntersectionObserver((entries) => {
      if (!observing) return;

      const entry = entries.find(({ target }) => target === element);
      if (!entry) return;

      setIntersection({
        element,
        threshold,
        intersecting:
          entry.isIntersecting &&
          entry.intersectionRatio >= Math.max(threshold, Number.EPSILON),
      });
    }, { threshold });

    observer.observe(element);

    return () => {
      observing = false;
      observer.disconnect();
    };
  }, [element, threshold]);

  const intersecting =
    intersection?.element === element &&
    intersection.threshold === threshold &&
    intersection.intersecting;

  return {
    ref: setElement,
    active:
      enabled &&
      !prefersReducedMotion &&
      documentVisible &&
      intersecting,
  };
}

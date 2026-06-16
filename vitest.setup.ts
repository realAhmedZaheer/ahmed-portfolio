import "@testing-library/jest-dom/vitest";

// jsdom lacks matchMedia; provide a default (motion enabled) so hooks/components render.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }) as unknown as MediaQueryList;
}

// jsdom lacks IntersectionObserver; provide a no-op so components using it can mount.
if (!("IntersectionObserver" in window)) {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  // @ts-expect-error assigning test stub
  window.IntersectionObserver = IO;
}

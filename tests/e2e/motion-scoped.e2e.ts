import { expect, test, type Locator, type Page } from "@playwright/test";

const AMBIENT_IDS = ["ascii.ambient", "social.ambient", "chart.ambient"] as const;

type MotionState = "active" | "static";

async function installAmbientLifecycleControls(page: Page) {
  await page.addInitScript(() => {
    let visibility: DocumentVisibilityState = "visible";
    let intersecting = true;
    const observers = new Set<{
      callback: IntersectionObserverCallback;
      targets: Set<Element>;
      observer: IntersectionObserver;
    }>();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibility,
    });

    class ControlledIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      private readonly record: {
        callback: IntersectionObserverCallback;
        targets: Set<Element>;
        observer: IntersectionObserver;
      };

      constructor(callback: IntersectionObserverCallback) {
        this.record = {
          callback,
          targets: new Set(),
          observer: this,
        };
        observers.add(this.record);
      }

      observe(target: Element) {
        this.record.targets.add(target);
        queueMicrotask(() => this.notify(target));
      }

      unobserve(target: Element) {
        this.record.targets.delete(target);
      }

      disconnect() {
        this.record.targets.clear();
        observers.delete(this.record);
      }

      takeRecords() {
        return [];
      }

      private notify(target: Element) {
        this.record.callback(
          [{
            target,
            isIntersecting: intersecting,
            intersectionRatio: intersecting ? 1 : 0,
          } as IntersectionObserverEntry],
          this,
        );
      }
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: ControlledIntersectionObserver,
    });

    const controlledWindow = window as typeof window & {
      setMotionIntersection(value: boolean): void;
      setMotionVisibility(value: DocumentVisibilityState): void;
    };

    controlledWindow.setMotionIntersection = (value) => {
      intersecting = value;
      for (const record of observers) {
        for (const target of record.targets) {
          record.callback(
            [{
              target,
              isIntersecting: value,
              intersectionRatio: value ? 1 : 0,
            } as IntersectionObserverEntry],
            record.observer,
          );
        }
      }
    };

    controlledWindow.setMotionVisibility = (value) => {
      visibility = value;
      document.dispatchEvent(new Event("visibilitychange"));
    };
  });
}

async function setIntersection(page: Page, intersecting: boolean) {
  await page.evaluate((value) => {
    (window as typeof window & { setMotionIntersection(value: boolean): void })
      .setMotionIntersection(value);
  }, intersecting);
}

async function setVisibility(page: Page, visibility: DocumentVisibilityState) {
  await page.evaluate((value) => {
    (window as typeof window & {
      setMotionVisibility(value: DocumentVisibilityState): void;
    }).setMotionVisibility(value);
  }, visibility);
}

async function expectOwnerState(owner: Locator, state: MotionState) {
  await expect(owner.first()).toBeAttached();
  await expect.poll(async () => owner.evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("data-motion-state")),
  )).toEqual(Array(await owner.count()).fill(state));
}

async function infiniteAnimationsWithin(owner: Locator) {
  return owner.evaluateAll((owners) => owners.reduce((count, owner) => {
    return count + owner.getAnimations({ subtree: true }).filter((animation) =>
      animation.effect?.getComputedTiming().iterations === Infinity
    ).length;
  }, 0));
}

async function maybeCapture(page: Page, name: string) {
  if (process.env.CAPTURE_MOTION_BASELINE !== "1") return;
  await page.screenshot({
    path: test.info().outputPath(`${name}.png`),
    animations: "allow",
  });
}

async function installTextHistory(page: Page, selector: string) {
  await page.addInitScript((targetSelector) => {
    const sampledWindow = window as typeof window & { motionTextHistory: string[] };
    sampledWindow.motionTextHistory = [];

    const sample = () => {
      for (const element of document.querySelectorAll(targetSelector)) {
        const text = element.textContent ?? "";
        if (text.trim()) sampledWindow.motionTextHistory.push(text);
      }
    };

    new MutationObserver(sample).observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    document.addEventListener("DOMContentLoaded", sample, { once: true });
  }, selector);
}

async function uniqueTextHistory(page: Page, settleMs: number) {
  await page.waitForTimeout(settleMs);
  return page.evaluate(() => [...new Set(
    (window as typeof window & { motionTextHistory: string[] }).motionTextHistory,
  )]);
}

async function installProjectPanelSampler(page: Page) {
  await page.addInitScript(() => {
    const sampledWindow = window as typeof window & {
      projectPanelSamples: Array<{ opacity: number; transform: string; y: number }>;
    };
    sampledWindow.projectPanelSamples = [];

    window.setInterval(() => {
      const label = [...document.querySelectorAll("p")]
        .find((element) => element.textContent?.trim() === "Category");
      const panelItem = label?.parentElement;
      if (!panelItem) return;

      const style = getComputedStyle(panelItem);
      const matrix = style.transform === "none"
        ? new DOMMatrixReadOnly()
        : new DOMMatrixReadOnly(style.transform);
      sampledWindow.projectPanelSamples.push({
        opacity: Number(style.opacity),
        transform: style.transform,
        y: matrix.m42,
      });
    }, 16);
  });
}

async function timelineBeamMetrics(page: Page) {
  return page.getByText("TBD", { exact: true }).evaluate((date) => {
    let owner = date.parentElement;
    while (owner) {
      const beamClip = [...owner.children].find((child) => {
        const style = getComputedStyle(child);
        return style.position === "absolute"
          && style.width === "2px"
          && style.overflow === "hidden";
      }) as HTMLElement | undefined;

      if (beamClip?.firstElementChild instanceof HTMLElement) {
        const beam = beamClip.firstElementChild;
        const style = getComputedStyle(beam);
        return {
          clipHeight: beamClip.getBoundingClientRect().height,
          beamHeight: beam.getBoundingClientRect().height,
          opacity: style.opacity,
          transform: style.transform,
          animations: beam.getAnimations({ subtree: true }).length,
        };
      }
      owner = owner.parentElement;
    }
    throw new Error("Timeline beam was not found from its rendered entry");
  });
}

test.describe("scoped ambient motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await installAmbientLifecycleControls(page);
  });

  test("registers only the three owners and preserves their normal animation", async ({ page }) => {
    const discovered = new Set<string>();

    for (const [route, expectedIds] of [
      ["/", ["ascii.ambient", "social.ambient"]],
      ["/posts?view=chart", ["chart.ambient", "social.ambient"]],
    ] as const) {
      await page.goto(route);
      await maybeCapture(page, route === "/" ? "baseline-home-normal" : "baseline-chart-normal");

      const routeOwners = page.locator("[data-motion-id$='.ambient']");
      await expect.poll(() => routeOwners.count()).toBeGreaterThanOrEqual(expectedIds.length);
      for (const id of await routeOwners.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-motion-id") ?? "")
      )) discovered.add(id);

      for (const id of expectedIds) {
        const owner = page.locator(`[data-motion-id="${id}"]`);
        await expectOwnerState(owner, "active");
        await expect.poll(() => infiniteAnimationsWithin(owner)).toBeGreaterThan(0);
      }
    }

    expect([...discovered].sort()).toEqual([...AMBIENT_IDS].sort());
  });

  test("owners become static for reduced, hidden, and offscreen states, then resume", async ({ page }) => {
    for (const [route, ids] of [
      ["/", ["ascii.ambient", "social.ambient"]],
      ["/posts?view=chart", ["chart.ambient", "social.ambient"]],
    ] as const) {
      await page.goto(route);

      for (const id of ids) await expectOwnerState(page.locator(`[data-motion-id="${id}"]`), "active");

      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const id of ids) {
        const owner = page.locator(`[data-motion-id="${id}"]`);
        await expectOwnerState(owner, "static");
        await expect.poll(() => infiniteAnimationsWithin(owner)).toBe(0);
      }

      await page.emulateMedia({ reducedMotion: "no-preference" });
      for (const id of ids) await expectOwnerState(page.locator(`[data-motion-id="${id}"]`), "active");

      await setVisibility(page, "hidden");
      for (const id of ids) await expectOwnerState(page.locator(`[data-motion-id="${id}"]`), "static");
      await setVisibility(page, "visible");
      for (const id of ids) await expectOwnerState(page.locator(`[data-motion-id="${id}"]`), "active");

      await setIntersection(page, false);
      for (const id of ids) await expectOwnerState(page.locator(`[data-motion-id="${id}"]`), "static");
      await setIntersection(page, true);
      for (const id of ids) await expectOwnerState(page.locator(`[data-motion-id="${id}"]`), "active");
    }
  });

  test("owners fail static when IntersectionObserver is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "IntersectionObserver", {
        configurable: true,
        value: undefined,
      });
    });
    await page.goto("/");

    for (const id of ["ascii.ambient", "social.ambient"]) {
      const owner = page.locator(`[data-motion-id="${id}"]`);
      await expectOwnerState(owner, "static");
      await expect.poll(() => infiniteAnimationsWithin(owner)).toBe(0);
    }
  });
});

test.describe("scoped finite motion", () => {
  test("preserves the hero scramble normally and renders its final text immediately under reduce", async ({ page }) => {
    await installTextHistory(page, 'a[href="/dashboard"] pre');

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.locator('a[href="/dashboard"] pre').first()).toBeAttached();
    expect((await uniqueTextHistory(page, 600)).length).toBeGreaterThan(1);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const reducedOwner = page.locator('[data-motion-id="ascii.ambient"]');
    await expectOwnerState(reducedOwner, "static");
    await expect(page.locator('a[href="/dashboard"] pre')).toHaveCount(1);
    await expect.poll(() => infiniteAnimationsWithin(reducedOwner)).toBe(0);
  });

  test("preserves project ASCII reveal normally and resolves it immediately under reduce", async ({ page }) => {
    await installTextHistory(page, "pre");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/portfolio/unsloth-challenge");
    await expect(page.getByRole("heading", { name: "Unsloth Challenge" })).toBeVisible();
    await expect(page.locator("pre").first()).toBeAttached();
    expect((await uniqueTextHistory(page, 500)).length).toBeGreaterThan(1);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/portfolio/unsloth-challenge");
    await expect(page.getByRole("heading", { name: "Unsloth Challenge" })).toBeVisible();
    await expect(page.locator("pre").first()).toContainText(/\S/);
    expect(await uniqueTextHistory(page, 500)).toHaveLength(1);
  });
});

test.describe("static entrances and semantics", () => {
  test("keeps route and MDX generic entrances static in normal mode", async ({ page }) => {
    await page.addInitScript(() => {
      const observedWindow = window as typeof window & { entranceTransforms: string[] };
      observedWindow.entranceTransforms = [];
      const record = (element: Element) => {
        const transform = (element as HTMLElement).style?.transform;
        if (transform) observedWindow.entranceTransforms.push(transform);
      };
      new MutationObserver((records) => {
        for (const mutation of records) record(mutation.target as Element);
      }).observe(document, { attributes: true, attributeFilter: ["style"], subtree: true });
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/posts/cross-entropy");

    const mdxHeading = page.getByRole("heading", { name: "Derivation: Entropy" });
    await expect(mdxHeading).toBeAttached();
    expect((await mdxHeading.getAttribute("style")) ?? "").not.toMatch(/opacity|transform/);
    expect(await page.evaluate(() =>
      (window as typeof window & { entranceTransforms: string[] }).entranceTransforms
        .some((value) => /translateX\(|200px/.test(value))
    )).toBe(false);
  });

  test("does not conceal semantic prose when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      class NeverIntersectingObserver implements IntersectionObserver {
        readonly root = null;
        readonly rootMargin = "0px";
        readonly thresholds = [0];
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
      }
      Object.defineProperty(window, "IntersectionObserver", {
        configurable: true,
        value: NeverIntersectingObserver,
      });
    });
    await page.goto("/posts/cross-entropy");

    await expect(page.getByRole("heading", { name: "Derivation: Entropy" })).toHaveCSS("opacity", "1");
    const quote = page.locator("blockquote").filter({ hasText: "Quick tangent on" }).first();
    await expect(quote).toBeAttached();
    await expect(quote).toContainText("true entropy");
  });
});

test.describe("portfolio interaction motion", () => {
  test("the preview rail activates from keyboard or the first mobile tap", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.use.isMobile === true;
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const panel = page.getByRole("button", { name: /^Expand / }).first();
    const label = await panel.getAttribute("aria-label");
    expect(label).toMatch(/^Expand .+/);
    const title = label!.replace(/^Expand /, "");
    await expect(panel).toHaveAttribute("aria-expanded", "false");
    const panelElement = await panel.elementHandle();
    expect(panelElement).not.toBeNull();

    if (isMobile) {
      await panel.tap();
    } else {
      await panel.focus();
      await expect(panel).toBeFocused();
      await panel.press("Enter");
    }

    await expect.poll(() => panelElement!.getAttribute("aria-expanded")).toBe("true");
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    const expandedPanel = page.locator('[aria-expanded="true"]').filter({
      has: page.getByRole("heading", { name: title, exact: true }),
    });
    await expect(expandedPanel.getByRole("link", { name: "details" })).toBeVisible();

    const box = await panelElement!.boundingBox();
    expect(box).not.toBeNull();
    if (isMobile) expect(box!.height).toBeCloseTo(360, 0);
    else {
      const movingAnimations = await panelElement!.evaluate((element) =>
        element.getAnimations().filter((animation) => {
          const keyframes = animation.effect instanceof KeyframeEffect
            ? animation.effect.getKeyframes()
            : [];
          return keyframes.some((frame) =>
            frame.width !== undefined ||
            frame.height !== undefined ||
            frame.transform !== undefined
          );
        }).length
      );
      expect(movingAnimations).toBe(0);
    }
  });

  test("the reduced project panel never moves on y while opacity may settle", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await installProjectPanelSampler(page);
    await page.goto("/portfolio/unsloth-challenge");
    await expect(page.getByText("Category", { exact: true })).toBeVisible();
    await page.waitForTimeout(800);

    const samples = await page.evaluate(() => (
      window as typeof window & {
        projectPanelSamples: Array<{ opacity: number; transform: string; y: number }>;
      }
    ).projectPanelSamples);
    expect(samples.length).toBeGreaterThan(2);
    expect(samples.every(({ y }) => Math.abs(y) < 0.01)).toBe(true);
    expect(samples.every(({ opacity }) => opacity >= 0 && opacity <= 1)).toBe(true);
    expect(samples.at(-1)?.opacity).toBe(1);
  });
});

test.describe("reduced interaction recipes", () => {
  test("the command palette reports status, closes on Escape, and returns focus", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/posts");

    const trigger = page.getByRole("button", { name: /search/i });
    await trigger.click();
    const palette = page.getByRole("dialog", { name: "Command palette" });
    const input = page.getByRole("combobox", { name: "Search the log, or type / for commands" });
    await expect(palette).toBeVisible();
    await expect(palette).toHaveCSS("transform", "none");
    await expect(input).toBeFocused();

    await input.fill("/theme");
    await input.press("Enter");
    await expect(page.getByRole("status")).toContainText(/^display:/);

    await input.press("Escape");
    await expect(palette).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("the theme command suggests and selects named displays", async ({ page }) => {
    await page.goto("/posts");
    await page.getByRole("button", { name: /search/i }).click();

    const input = page.getByRole("combobox", {
      name: "Search the log, or type / for commands",
    });
    await input.fill("/theme n");

    const option = page.getByRole("option", { name: /\/theme nier/ });
    await expect(option).toBeVisible();
    await expect(option).toHaveAttribute("aria-selected", "true");
    await input.press("Enter");
    await expect(page.getByRole("status")).toHaveText("display: nier");
  });

  test("the reduced mobile menu exposes links without height animation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.isMobile !== true, "The collapsible navigation is hidden on desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/posts");

    const trigger = page.getByRole("button", { name: "Open Menu" });
    const controls = await trigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    const content = page.locator(`[id="${controls}"]`);
    await trigger.tap();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(content.getByRole("link", { name: "home", exact: true })).toBeVisible();
    await expect(content).toHaveCSS("animation-name", "none");
    expect(await content.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
    expect((await content.boundingBox())?.height).toBeGreaterThan(0);
  });

  test("reduced tooltip and hover-card presentations do not translate or scale", async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.isMobile === true, "These previews are hover-driven on touch layouts");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/posts/cut-cross-entropy");

    const tooltipTrigger = page.getByRole("link", {
      name: "GitHub - Apple ML Cut Cross Entropy",
      exact: true,
    });
    for (const event of ["pointerover", "pointerenter", "mouseover", "mouseenter"]) {
      await tooltipTrigger.dispatchEvent(event);
    }
    const tooltip = page.locator('[data-scope="tooltip"][data-part="content"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("transform", "none");

    const previewTrigger = page.getByRole("link", {
      name: /derivation of cross-entropy loss/i,
    });
    for (const event of ["pointerover", "pointerenter", "mouseover", "mouseenter"]) {
      await previewTrigger.dispatchEvent(event);
    }
    const hoverCard = page.locator(
      '[data-scope="hover-card"][data-part="content"][data-state="open"]',
    );
    await expect(hoverCard).toBeVisible();
    await expect(hoverCard).toHaveCSS("transform", "none");
  });
});

test.describe("prose presentation", () => {
  test("quotes remain readable and default videos are two-thirds width", async ({ page }) => {
    await page.goto("/posts/transformation-of-the-transformer");

    const quote = page.locator("blockquote").filter({
      hasText: "This is not a beginner's guide",
    });
    await expect(quote).toBeVisible();
    const contrast = await quote.evaluate((element) => {
      const channels = (color: string) =>
        color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
      const luminance = (color: string) => {
        const [red, green, blue] = channels(color);
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      };
      const foreground = luminance(getComputedStyle(element).color);
      const background = luminance(getComputedStyle(document.body).backgroundColor);
      return (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);

    const iframe = page.locator('iframe[src*="youtube.com/embed/"]');
    await expect(iframe).toBeVisible();
    const widthRatio = await iframe.evaluate((element) => {
      const wrapper = element.parentElement;
      const container = wrapper?.parentElement;
      return element.getBoundingClientRect().width / container!.getBoundingClientRect().width;
    });
    expect(widthRatio).toBeLessThanOrEqual(0.68);
  });
});

test("the reduced timeline renders a complete beam that does not follow scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/posts/transformation-of-the-transformer");
  await expect(page.getByRole("heading", { name: "Timeline: Papers and Models" })).toBeVisible();
  await expect.poll(async () => (await timelineBeamMetrics(page)).clipHeight).toBeGreaterThan(0);

  const before = await timelineBeamMetrics(page);
  expect(before.beamHeight).toBeCloseTo(before.clipHeight, 0);
  expect(before.opacity).toBe("1");
  expect(before.transform).toBe("none");
  expect(before.animations).toBe(0);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  const after = await timelineBeamMetrics(page);
  expect(after.beamHeight).toBeCloseTo(before.beamHeight, 0);
  expect(after.opacity).toBe(before.opacity);
  expect(after.transform).toBe(before.transform);
  expect(after.animations).toBe(0);
});

test("the normal timeline beam follows scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/posts/transformation-of-the-transformer");
  await expect(page.getByRole("heading", { name: "Timeline: Papers and Models" })).toBeVisible();
  await expect.poll(async () => (await timelineBeamMetrics(page)).clipHeight).toBeGreaterThan(0);

  await page.evaluate(() => window.scrollTo(0, 0));
  const before = await timelineBeamMetrics(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => (await timelineBeamMetrics(page)).beamHeight)
    .toBeGreaterThan(before.beamHeight);
});

test("chart links remain keyboard-operable", async ({ page }) => {
  await page.goto("/posts?view=chart");
  const firstNode = page.locator('svg[aria-label^="Star chart"] [role="link"]').first();
  await firstNode.focus();
  await expect(firstNode).toBeFocused();
  await firstNode.press(" ");
  await expect(page).toHaveURL(/\/posts\/[^?]+$/);
});

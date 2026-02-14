"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Router } from "next/router";
import type { PostHog } from "posthog-js";

type PosthogWindow = Window & {
  posthog?: PostHog;
  __posthog_router_pageview_hooked?: boolean;
};

const AnalyticsContext = createContext<PostHog | null>(null);

export const useAnalytics = () => {
    return useContext(AnalyticsContext);
};

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
    const [posthog, setPosthog] = useState<PostHog | null>(null);

    useEffect(() => {
        // Only init on client
        if (typeof window === "undefined") return;

        const win = window as PosthogWindow;
        const isLocalhost =
            win.location.hostname === "localhost" ||
            win.location.hostname === "127.0.0.1";
        const disableSessionRecording =
            process.env.NODE_ENV === "development" || isLocalhost;

        const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!apiKey) return;

        const uiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
        if (!uiHost) return;

        const ensureRouterPageviews = (ph: PostHog) => {
            if (win.__posthog_router_pageview_hooked) return;
            win.__posthog_router_pageview_hooked = true;

            const handleRouteChange = () => ph.capture("$pageview");
            Router.events.on("routeChangeComplete", handleRouteChange);

            // Initial pageview
            ph.capture("$pageview");
        };

        const ensureSessionRecordingSetting = (ph: PostHog) => {
            if (disableSessionRecording) {
                ph?.stopSessionRecording?.();
                ph?.set_config?.({ disable_session_recording: true });
            }
        };

        // Check if we already have an instance
        if (win.posthog) {
            const existing = win.posthog;
            ensureSessionRecordingSetting(existing);
            ensureRouterPageviews(existing);
            setPosthog(existing);
            return;
        }

        import("posthog-js").then(({ default: ph }) => {
            ph.init(apiKey, {
                api_host: "/ingest",
                ui_host: uiHost,
                loaded: (p) => {
                    if (process.env.NODE_ENV === "development") p.debug();
                    setPosthog(p);
                },
                debug: process.env.NODE_ENV === "development",
                // Disable automatic capturing if desired, though usually good to keep
                capture_pageview: false, // We handle this manually
                disable_session_recording: disableSessionRecording,
            });

            ensureSessionRecordingSetting(ph);
            ensureRouterPageviews(ph);
        });
    }, []);

    return (
        <AnalyticsContext.Provider value={posthog}>
            {children}
        </AnalyticsContext.Provider>
    );
};

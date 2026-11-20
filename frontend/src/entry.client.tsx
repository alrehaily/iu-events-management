import {createRoot, hydrateRoot} from "react-dom/client";
import {createBrowserRouter, matchRoutes, RouterProvider} from "react-router-dom";

import {router} from "./router";
import {App} from "./App";
import {queryClient} from "./utilites/queryClient";
import {i18n} from "@lingui/core";
import {applyDocumentLocale, getClientLocale, getSupportedLocale, loadLocaleMessages} from "./locales.ts";
import type {ThemeColors} from "./utilites/themeColors.ts";
import type {DehydratedState} from "@tanstack/react-query";

declare global {
    interface Window {
        __REHYDRATED_STATE__?: DehydratedState;
        __THEME_COLORS__?: ThemeColors;
    }
}

const dehydratedState = window.__REHYDRATED_STATE__;

async function initClientApp() {
    const appContainer = document.getElementById("app");
    if (!appContainer) return;

    const hasServerMarkup = appContainer.firstElementChild !== null;
    const locale = hasServerMarkup ? getSupportedLocale(document.documentElement.lang) : getClientLocale();
    const messages = await loadLocaleMessages(locale);
    applyDocumentLocale(locale);
    i18n.loadAndActivate({locale, messages});
    const themeColors = window.__THEME_COLORS__
        ?? (await import("./utilites/themeColors.ts")).generateThemeColors();

    // Resolve lazy-loaded routes before hydration
    const matches = matchRoutes(router, window.location)?.filter((m) => m.route.lazy);
    if (matches && matches.length > 0) {
        await Promise.all(
            matches.map(async (m) => {
                if (typeof m.route.lazy === "function") {
                    const routeModule = await m.route.lazy();
                Object.assign(m.route, {...routeModule, lazy: undefined});
            }
            })
        );
    }

    const browserRouter = createBrowserRouter(router);

    const app = (
        <App queryClient={queryClient} locale={locale} themeColors={themeColors} dehydratedState={dehydratedState}>
            <RouterProvider router={browserRouter}/>
        </App>
    );

    if (hasServerMarkup) {
        hydrateRoot(appContainer, app);
    } else {
        createRoot(appContainer).render(app);
    }
}

initClientApp();

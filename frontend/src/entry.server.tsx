import type * as express from "express";
import ReactDOMServer from "react-dom/server";
import {dehydrate, QueryClient} from "@tanstack/react-query";

import {router} from "./router";
import {App} from "./App";
import {AsyncLocalStorage} from "node:async_hooks";
import {createStaticHandler, createStaticRouter, StaticRouterProvider} from "react-router";
import {i18n} from "@lingui/core";
import {getSupportedLocale, loadLocaleMessages, localeDirection, type SupportedLocales} from "./locales.ts";
import {configureSsrRequestContext} from "./utilites/ssrRequestContext.ts";
import {generateThemeColors} from "./utilites/themeColors.ts";

const themeColors = generateThemeColors();
const requestContext = new AsyncLocalStorage<{queryClient: QueryClient; locale: SupportedLocales; token?: string}>();
configureSsrRequestContext(() => requestContext.getStore());

export async function render(params: {
    req: express.Request;
    res: express.Response;
}) {
    const locale = getSupportedLocale(params.req.cookies.locale);

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 60 seconds - prevents immediate refetch on client
                refetchOnWindowFocus: false,
                networkMode: "always",
            },
            mutations: {
                networkMode: 'always',
            }
        },
    });

    return requestContext.run({queryClient, locale, token: params.req.cookies.token}, () =>
        renderRequest(params, locale, queryClient),
    );
}

async function renderRequest(
    params: {req: express.Request; res: express.Response},
    locale: SupportedLocales,
    queryClient: QueryClient,
) {
    const helmetContext = {};

    const {query, dataRoutes} = createStaticHandler(router);
    const remixRequest = createFetchRequest(params.req, params.res);
    const context = await query(remixRequest);

    if (context instanceof Response) {
        throw context;
    }

    const messages = await loadLocaleMessages(locale);
    const routerWithContext = createStaticRouter(dataRoutes, context);
    i18n.loadAndActivate({locale, messages});
    
    const appHtml = ReactDOMServer.renderToString(
        <App
            queryClient={queryClient}
            helmetContext={helmetContext}
            locale={locale}
            themeColors={themeColors}
        >
            <StaticRouterProvider
                router={routerWithContext}
                context={context}
            />
        </App>
    );

    const dehydratedState = dehydrate(queryClient);


    return {
        appHtml,
        locale,
        direction: localeDirection(locale),
        dehydratedState,
        helmetContext,
        themeColors,
        statusCode: context.statusCode,
        renderErrors: Object.values(context.errors ?? {}),
    };
}

export function createFetchRequest(
    req: express.Request,
    res: express.Response
): Request {
    const origin = `${req.protocol}://${req.get("host")}`;
    const url = new URL(req.originalUrl || req.url, origin);
    const controller = new AbortController();
    res.on("close", () => controller.abort());

    const headers = new Headers();

    for (const [key, values] of Object.entries(req.headers)) {
        if (values) {
            if (Array.isArray(values)) {
                for (const value of values) {
                    headers.append(key, value);
                }
            } else {
                headers.set(key, values);
            }
        }
    }

    const init: RequestInit = {
        method: req.method,
        headers,
        signal: controller.signal,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
        init.body = req.body;
    }

    return new Request(url.href, init);
}

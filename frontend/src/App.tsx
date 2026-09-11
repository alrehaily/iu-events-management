import React, {FC, PropsWithChildren, useEffect} from "react";
import {MantineProvider, v8CssVariablesResolver} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {i18n} from "@lingui/core";
import {I18nProvider} from "@lingui/react";
import {ModalsProvider} from "@mantine/modals";
import {DatesProvider} from "@mantine/dates";
import {DehydratedState, HydrationBoundary, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Helmet, HelmetProvider} from "react-helmet-async";
import type {ThemeColors} from "./utilites/themeColors.ts";
import {IU_TYPOGRAPHY} from "./constants/iuTheme.ts";

import "@mantine/core/styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/dropzone/styles.css";
import '@mantine/dates/styles.css';
import "@mantine/charts/styles.css";
import "./styles/global.scss";
import {isSsr} from "./utilites/helpers.ts";
import {StartupChecks} from "./StartupChecks.tsx";
import {ThirdPartyScripts} from "./components/common/ThirdPartyScripts";
import {getConfig} from "./utilites/config.ts";
import {CookieConsentBanner} from "./components/common/CookieConsentBanner";
import {isConsentBannerEnabled} from "./utilites/cookieConsent";

declare global {
    interface Window {
        hievents: Record<string, string>;
    }
}

export const App: FC<
    PropsWithChildren<{
        queryClient: QueryClient;
        locale: string;
        themeColors: ThemeColors;
        helmetContext?: any;
        dehydratedState?: DehydratedState;
    }>
> = (props) => {
    const [isLoadedOnBrowser, setIsLoadedOnBrowser] = React.useState(false);
    useEffect(() => {
        setIsLoadedOnBrowser(!isSsr());
    }, []);

    return (
        <React.StrictMode>
            <div
                className="ssr-loader"
                style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    margin: 0,
                    padding: 0,
                    width: "100vw",
                    height: "100vh",
                    position: "fixed",
                    background: "#fcfdfc",
                    zIndex: 99999,
                    display: isLoadedOnBrowser ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"}}>
                    <img
                        src="/images/IUEvent2.png"
                        alt="الجامعة الإسلامية بالمدينة المنورة"
                        style={{height: 72, width: "auto"}}
                    />
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            border: "3px solid var(--iu-green-200)",
                            borderTop: "3px solid var(--iu-green-900)",
                            borderRadius: "50%",
                            animation: "iu-spin 0.8s linear infinite"
                        }}
                    />
                </div>
            </div>
            <MantineProvider
                cssVariablesResolver={v8CssVariablesResolver}
                theme={{
                    colors: props.themeColors,
                    primaryColor: "primary",
                    fontFamily: IU_TYPOGRAPHY.fontFamily,
                    primaryShade: 8,
                    defaultRadius: "md",
                }}
            >
                <HelmetProvider context={props.helmetContext}>
                    <I18nProvider i18n={i18n}>
                        <DatesProvider settings={{locale: props.locale}}>
                        <QueryClientProvider client={props.queryClient}>
                            <HydrationBoundary state={props.dehydratedState}>
                                <StartupChecks/>
                                <ThirdPartyScripts/>
                                <ModalsProvider>
                                    <Helmet>
                                        <title>{getConfig("VITE_APP_NAME", "منصة إدارة الفعاليات - الجامعة الإسلامية بالمدينة المنورة")}</title>
                                        <link rel="icon"
                                              type="image/png"
                                              href={getConfig("VITE_APP_FAVICON", "/images/IUEvent2.png")}
                                        />
                                    </Helmet>
                                    {props.children}
                                </ModalsProvider>
                                <Notifications pauseResetOnHover="notification"/>
                                {isConsentBannerEnabled() && <CookieConsentBanner/>}
                            </HydrationBoundary>
                        </QueryClientProvider>
                        </DatesProvider>
                    </I18nProvider>
                </HelmetProvider>
            </MantineProvider>
        </React.StrictMode>
    );
};

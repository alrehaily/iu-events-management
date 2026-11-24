import React, {FC, PropsWithChildren, useEffect} from "react";
import {Button, defaultVariantColorsResolver, DirectionProvider, MantineProvider, PasswordInput, v8CssVariablesResolver} from "@mantine/core";
import {Notifications, notifications} from "@mantine/notifications";
import {i18n} from "@lingui/core";
import {t} from "@lingui/macro";
import {I18nProvider} from "@lingui/react";
import {ModalsProvider} from "@mantine/modals";
import {DatesProvider} from "@mantine/dates";
import {DehydratedState, HydrationBoundary, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Helmet, HelmetProvider} from "react-helmet-async";
import type {ThemeColors} from "./utilites/themeColors.ts";
import {IU_COLORS, IU_TYPOGRAPHY} from "./constants/iuTheme.ts";

import "@mantine/core/styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/dropzone/styles.css";
import '@mantine/dates/styles.css';
import "@mantine/charts/styles.css";
import "./styles/global.scss";
import "./styles/iu/management-buttons.css";
import {isSsr} from "./utilites/helpers.ts";
import {ThirdPartyScripts} from "./components/common/ThirdPartyScripts";
import {getConfig} from "./utilites/config.ts";
import {CookieConsentBanner} from "./components/common/CookieConsentBanner";
import {isConsentBannerEnabled} from "./utilites/cookieConsent";
import {IULanguageProvider, useIULanguage} from "./context/IULanguageContext";
import {localeDirection, type SupportedLocales} from "./locales.ts";

declare global {
    interface Window {
        hievents: Record<string, string>;
        __iu_show_notification?: {
            show: typeof notifications.show;
            showSuccess: (message: React.ReactNode) => void;
        };
    }
}

if (typeof window !== "undefined") {
    window.__iu_show_notification = {
        show: (options) => notifications.show(options),
        showSuccess: (message) => notifications.show({
            message,
            color: "primary.8",
            position: "top-center",
        }),
    };
}

type AppProps = PropsWithChildren<{
    queryClient: QueryClient;
    locale: SupportedLocales;
    themeColors: ThemeColors;
    helmetContext?: React.ComponentProps<typeof HelmetProvider>["context"];
    dehydratedState?: DehydratedState;
}>;

const LocalizedProviders = (props: AppProps) => {
    const {locale} = useIULanguage();

    return (
        <MantineProvider
            cssVariablesResolver={v8CssVariablesResolver}
            theme={{
                colors: props.themeColors,
                primaryColor: "primary",
                fontFamily: IU_TYPOGRAPHY.fontFamily,
                primaryShade: 8,
                defaultRadius: "md",
                variantColorResolver: (input) => {
                    const colors = defaultVariantColorsResolver(input);
                    if (input.variant !== "filled") return colors;

                    if (input.color === "white") {
                        return {...colors, color: IU_COLORS.greenPrimary, hover: IU_COLORS.greenLight};
                    }

                    if (!input.color || ["primary", "green", "violet", "grape"].includes(input.color)) {
                        return {
                            ...colors,
                            background: IU_COLORS.greenSecondary,
                            hover: IU_COLORS.green800,
                            color: IU_COLORS.textInverse,
                        };
                    }

                    return colors;
                },
                components: {
                    Button: Button.extend({defaultProps: {variant: "filled"}}),
                    PasswordInput: PasswordInput.extend({
                        defaultProps: {visibilityToggleButtonProps: {"aria-label": t`Toggle password visibility`}},
                    }),
                },
            }}
        >
            <HelmetProvider context={props.helmetContext}>
                <DatesProvider settings={{locale}}>
                    <QueryClientProvider client={props.queryClient}>
                        <HydrationBoundary state={props.dehydratedState}>
                            <ThirdPartyScripts/>
                            <ModalsProvider labels={{confirm: t`Confirm`, cancel: t`Cancel`}}>
                                <Helmet>
                                    <title>{getConfig("VITE_APP_NAME", t`IU Events Management Platform`)}</title>
                                    <link rel="icon" type="image/svg+xml" href={getConfig("VITE_APP_FAVICON_SVG", "/favicon.svg") + "?v=iu-20261124"}/>
                                    <link rel="icon" type="image/png" sizes="32x32" href={getConfig("VITE_APP_FAVICON", "/manifest-icons/favicon-32x32.png") + "?v=iu-20261124"}/>
                                    <link rel="icon" type="image/png" sizes="16x16" href="/manifest-icons/favicon-16x16.png?v=iu-20261124"/>
                                    <link rel="shortcut icon" href="/favicon.ico?v=iu-20261124"/>
                                    <link rel="apple-touch-icon" sizes="180x180" href="/manifest-icons/apple-touch-icon.png?v=iu-20261124"/>
                                </Helmet>
                                {props.children}
                            </ModalsProvider>
                            <Notifications
                                position="top-center"
                                zIndex={1000000}
                                withinPortal={true}
                                pauseResetOnHover="notification"
                            />
                            {isConsentBannerEnabled() && <CookieConsentBanner/>}
                        </HydrationBoundary>
                    </QueryClientProvider>
                </DatesProvider>
            </HelmetProvider>
        </MantineProvider>
    );
};

export const App: FC<AppProps> = (props) => {
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
                        alt=""
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
            <I18nProvider i18n={i18n}>
                <DirectionProvider initialDirection={localeDirection(props.locale)}>
                    <IULanguageProvider>
                        <LocalizedProviders {...props}/>
                    </IULanguageProvider>
                </DirectionProvider>
            </I18nProvider>
        </React.StrictMode>
    );
};

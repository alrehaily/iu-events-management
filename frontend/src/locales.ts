import {i18n, type Messages} from "@lingui/core";
import {arabicMessageOverrides} from "./locales/ar-overrides.ts";
import {arabicManagementMessageOverrides} from "./locales/ar-management-overrides.ts";
import {arabicPolishMessageOverrides} from "./locales/ar-polish-overrides.ts";
import {arabicUiFinalOverrides} from "./locales/ar-ui-final-overrides.ts";
import {arabicDynamicMessageOverrides} from "./locales/ar-dynamic-overrides.ts";
import {arabicSourceOverrides} from "./locales/ar-source-overrides.ts";
import {arabicSourceExtraOverrides} from "./locales/ar-source-overrides-extra.ts";
import {getSsrRequestContext} from "./utilites/ssrRequestContext.ts";

export type SupportedLocales = "ar" | "en";

export const availableLocales: SupportedLocales[] = ["ar", "en"];

export const localeToFlagEmojiMap: Record<SupportedLocales, string> = {
    ar: '🇸🇦',
    en: '🇬🇧',
};

export const localeToNameMap: Record<SupportedLocales, string> = {
    ar: `العربية`,
    en: `English`,
};

export const getLocaleName = (locale: SupportedLocales) => {
    return localeToNameMap[locale] || localeToNameMap.ar;
};

export const getClientLocale = (): SupportedLocales => {
    if (typeof window !== "undefined") {
        const storedLocale = document
            .cookie
            .split(";")
            .find((c) => c.trim().startsWith("locale="))
            ?.split("=")[1];

        if (storedLocale) {
            return getSupportedLocale(storedLocale);
        }

        const localStored = localStorage.getItem("locale");
        if (localStored) {
            return getSupportedLocale(localStored);
        }

        return "ar";
    }

    return getSsrRequestContext()?.locale ?? getSupportedLocale(i18n.locale);
};

const dayjsLocaleLoaders: Record<SupportedLocales, () => Promise<unknown>> = {
    ar: () => import("dayjs/locale/ar"),
    en: () => import("dayjs/locale/en"),
};

const resolveArabicSourceOverrides = (englishMessages: Record<string, unknown>) => {
    const resolved: Record<string, string> = {};

    Object.entries(englishMessages).forEach(([id, sourceMessage]) => {
        if (typeof sourceMessage !== "string") {
            return;
        }

        const translatedMessage = arabicSourceExtraOverrides[sourceMessage] || arabicSourceOverrides[sourceMessage];
        if (translatedMessage) {
            resolved[id] = translatedMessage;
        }
    });

    return resolved;
};

const localeMessages: Partial<Record<SupportedLocales, Promise<Messages>>> = {};

const fetchLocaleMessages = async (locale: SupportedLocales): Promise<Messages> => {
    const [catalog, english] = await Promise.all([
        locale === "ar" ? import("./locales/ar.po") : import("./locales/en.po"),
        locale === "ar" ? import("./locales/en.po") : undefined,
        dayjsLocaleLoaders[locale](),
    ]);

    if (!english) {
        return catalog.messages;
    }

    return {
        ...catalog.messages,
        ...resolveArabicSourceOverrides(english.messages),
        ...arabicMessageOverrides,
        ...arabicManagementMessageOverrides,
        ...arabicPolishMessageOverrides,
        ...arabicUiFinalOverrides,
        ...arabicDynamicMessageOverrides,
    };
};

export const loadLocaleMessages = (locale: SupportedLocales) => {
    const pending = localeMessages[locale] ??= fetchLocaleMessages(locale).catch((error) => {
        delete localeMessages[locale];
        throw error;
    });
    return pending;
};

export const localeDirection = (locale: SupportedLocales) => locale === "ar" ? "rtl" : "ltr";

export const applyDocumentLocale = (locale: SupportedLocales) => {
    document.documentElement.dir = localeDirection(locale);
    document.documentElement.lang = locale;
};

export const getSupportedLocale = (userLocale?: string): SupportedLocales => {
    if (!userLocale) return "ar";
    const normalized = userLocale.toLowerCase();
    if (normalized.startsWith("en")) {
        return "en";
    }
    return "ar";
};

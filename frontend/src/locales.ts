import {i18n} from "@lingui/core";
import {arabicMessageOverrides} from "./locales/ar-overrides.ts";
import {arabicManagementMessageOverrides} from "./locales/ar-management-overrides.ts";
import {arabicPolishMessageOverrides} from "./locales/ar-polish-overrides.ts";
import {arabicUiFinalOverrides} from "./locales/ar-ui-final-overrides.ts";
import {arabicDynamicMessageOverrides} from "./locales/ar-dynamic-overrides.ts";
import {arabicSourceOverrides} from "./locales/ar-source-overrides.ts";
import {arabicSourceExtraOverrides} from "./locales/ar-source-overrides-extra.ts";

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

    return "ar";
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

export async function dynamicActivateLocale(locale: string) {
    try {
        const validLocale: SupportedLocales = locale === "en" ? "en" : "ar";
        const [module, englishModule] = await Promise.all([
            import(`./locales/${validLocale}.po`),
            validLocale === "ar" ? import("./locales/en.po") : Promise.resolve(null),
            dayjsLocaleLoaders[validLocale]?.().catch((error) => console.error("Error loading dayjs locale:", error)),
        ]);

        const sourceResolvedOverrides = validLocale === "ar" && englishModule
            ? resolveArabicSourceOverrides(englishModule.messages as Record<string, unknown>)
            : {};

        const messages = validLocale === "ar"
            ? {
                ...module.messages,
                ...sourceResolvedOverrides,
                ...arabicMessageOverrides,
                ...arabicManagementMessageOverrides,
                ...arabicPolishMessageOverrides,
                ...arabicUiFinalOverrides,
                ...arabicDynamicMessageOverrides,
            }
            : module.messages;

        i18n.load(validLocale, messages);
        i18n.activate(validLocale);
        if (typeof document !== "undefined") {
            document.documentElement.dir = validLocale === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = validLocale;
        }
    } catch (error) {
        console.error("Error loading locale:", error);
    }
}

export const getSupportedLocale = (userLocale?: string): SupportedLocales => {
    if (!userLocale) return "ar";
    const normalized = userLocale.toLowerCase();
    if (normalized.startsWith("en")) {
        return "en";
    }
    return "ar";
};

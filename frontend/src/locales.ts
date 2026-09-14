import {i18n} from "@lingui/core";

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

export async function dynamicActivateLocale(locale: string) {
    try {
        const validLocale: SupportedLocales = locale === "en" ? "en" : "ar";
        const [module] = await Promise.all([
            import(`./locales/${validLocale}.po`),
            dayjsLocaleLoaders[validLocale]?.().catch((error) => console.error("Error loading dayjs locale:", error)),
        ]);
        i18n.load(validLocale, module.messages);
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

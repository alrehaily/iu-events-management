import {i18n} from "@lingui/core";

export type SupportedLocales =
    "ar"
    | "en"
    | "de"
    | "fr"
    | "it"
    | "nl"
    | "pt"
    | "es"
    | "zh-cn"
    | "pt-br"
    | "vi"
    | "zh-hk"
    | "tr"
    | "hu"
    | "pl"
    | "se"
    | "sk"
    | "el";

export const availableLocales = ["ar", "en", "de", "fr", "it", "nl", "pt", "es", "zh-cn", "zh-hk", "pt-br", "vi", "tr", "hu", "pl", "se", "sk", "el"];

export const localeToFlagEmojiMap: Record<SupportedLocales, string> = {
    ar: '🇸🇦',
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    it: '🇮🇹',
    nl: '🇳🇱',
    pt: '🇵🇹',
    es: '🇪🇸',
    "zh-cn": '🇨🇳',
    "zh-hk": '🇭🇰',
    "pt-br": '🇧🇷',
    vi: '🇻🇳',
    tr: '🇹🇷',
    hu: '🇭🇺',
    pl: '🇵🇱',
    se: '🇸🇪',
    sk: '🇸🇰',
    el: '🇬🇷',
};

export const localeToNameMap: Record<SupportedLocales, string> = {
    ar: `العربية`,
    en: `English`,
    de: `German`,
    fr: `French`,
    it: `Italian`,
    nl: `Dutch`,
    pt: `Portuguese`,
    es: `Spanish`,
    "zh-cn": `Chinese`,
    "zh-hk": `Cantonese`,
    "pt-br": `Portuguese (Brazil)`,
    vi: `Vietnamese`,
    tr: `Turkish`,
    hu: `Hungarian`,
    pl: `Polish`,
    se: `Swedish`,
    sk: `Slovak`,
    el: `Greek`,
};

export const getLocaleName = (locale: SupportedLocales) => {
    return localeToNameMap[locale];
}

export const getClientLocale = () => {
    if (typeof window !== "undefined") {
        const storedLocale = document
            .cookie
            .split(";")
            .find((c) => c.includes("locale="))
            ?.split("=")[1];

        if (storedLocale) {
            return getSupportedLocale(storedLocale);
        }

        return "ar";
    }

    return "ar";
};

const dayjsLocaleLoaders: Partial<Record<SupportedLocales, () => Promise<unknown>>> = {
    ar: () => import("dayjs/locale/ar"),
    de: () => import("dayjs/locale/de"),
    fr: () => import("dayjs/locale/fr"),
    it: () => import("dayjs/locale/it"),
    nl: () => import("dayjs/locale/nl"),
    pt: () => import("dayjs/locale/pt"),
    es: () => import("dayjs/locale/es"),
    "zh-cn": () => import("dayjs/locale/zh-cn"),
    "pt-br": () => import("dayjs/locale/pt-br"),
    vi: () => import("dayjs/locale/vi"),
    "zh-hk": () => import("dayjs/locale/zh-hk"),
    tr: () => import("dayjs/locale/tr"),
    hu: () => import("dayjs/locale/hu"),
    sk: () => import("dayjs/locale/sk"),
    el: () => import("dayjs/locale/el"),
};

export async function dynamicActivateLocale(locale: string) {
    try {
        locale = availableLocales.includes(locale) ? locale : "ar";
        const [module] = await Promise.all([
            import(`./locales/${locale}.po`),
            dayjsLocaleLoaders[locale as SupportedLocales]?.().catch((error) => console.error("Error loading dayjs locale:", error)),
        ]);
        i18n.load(locale, module.messages);
        i18n.activate(locale);
        if (typeof document !== "undefined") {
            document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = locale;
        }
    } catch (error) {
        console.error("Error loading locale:", error);
    }
}

export const getSupportedLocale = (userLocale: string) => {
    const normalizedLocale = userLocale.toLowerCase();

    if (availableLocales.includes(normalizedLocale)) {
        return normalizedLocale;
    }

    const mainLanguage = normalizedLocale.split('-')[0];
    const mainLocale = availableLocales.find(locale => locale.startsWith(mainLanguage));
    if (mainLocale) {
        return mainLocale;
    }

    return "ar";
};

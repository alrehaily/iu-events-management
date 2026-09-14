import {Select} from "@mantine/core";
import {dynamicActivateLocale, getClientLocale} from "../../../locales.ts";
import {t} from "@lingui/macro";
import {IconWorld} from "@tabler/icons-react";
import {useLingui} from "@lingui/react";

export const LanguageSwitcher = ({width = 130}: {width?: number | string}) => {
    useLingui();

    const supportedLanguages = [
        {
            value: "ar",
            label: "العربية",
        },
        {
            value: "en",
            label: "English",
        }
    ];

    const currentLocale = getClientLocale();
    const effectiveLocale = supportedLanguages.some(l => l.value === currentLocale) ? currentLocale : "ar";

    return (
        <Select
            leftSection={<IconWorld size={15} style={{color: 'var(--iu-green-secondary, #1b754b)'}}/>}
            w={width}
            size={'xs'}
            required
            data={supportedLanguages}
            value={effectiveLocale}
            placeholder={t`Language`}
            styles={{
                input: {
                    borderRadius: 'var(--iu-radius-md, 12px)',
                    borderColor: 'var(--iu-border, #e5e7eb)',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    color: 'var(--iu-heading, #0f172a)',
                    backgroundColor: 'var(--iu-surface, #ffffff)',
                }
            }}
            onChange={(value) => {
                if (!value) return;
                document.cookie = `locale=${value};path=/;max-age=31536000`;
                dynamicActivateLocale(value).finally(() => {
                    window.location.href = window.location.pathname + window.location.search;
                });
            }}
        />
    );
};

import {Select} from "@mantine/core";
import {useIULanguage} from "../../../context/IULanguageContext";
import {t} from "@lingui/macro";
import {IconWorld} from "@tabler/icons-react";

export const LanguageSwitcher = ({width = 120, variant = 'default'}: {width?: number | string; variant?: 'default' | 'topbar'}) => {
    const {locale, setLanguage} = useIULanguage();

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

    const isTopbar = variant === 'topbar';

    return (
        <Select
            leftSection={<IconWorld size={16} style={{color: isTopbar ? 'rgba(255, 255, 255, 0.95)' : 'var(--iu-green-secondary, #1b754b)'}}/>}
            w={width}
            size={'xs'}
            required
            data={supportedLanguages}
            value={locale}
            aria-label={t`Language`}
            placeholder={t`Language`}
            styles={{
                root: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    margin: 0,
                },
                wrapper: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    margin: 0,
                    width: '100%',
                },
                input: isTopbar ? {
                    height: '36px',
                    minHeight: '36px',
                    lineHeight: '34px',
                    borderRadius: '999px',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                } : {
                    height: '38px',
                    minHeight: '38px',
                    lineHeight: '36px',
                    borderRadius: 'var(--iu-radius-md, 12px)',
                    borderColor: 'var(--iu-border, #e5e7eb)',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    color: 'var(--iu-heading, #0f172a)',
                    backgroundColor: 'var(--iu-surface, #ffffff)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }
            }}
            onChange={(value) => {
                if (value === "ar" || value === "en") setLanguage(value);
            }}
        />
    );
};

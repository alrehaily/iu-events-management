import {Select} from "@mantine/core";
import {useLingui} from "@lingui/react";
import classes from "./SortSelector.module.scss";
import {SortDirectionLabel} from "../../../types.ts";
import {t} from "@lingui/macro";

export interface SortSelectorProps {
    options: Record<string, SortDirectionLabel>,
    onSortSelect: (key: string, sortDirection: string) => void,
    selected: string,
}

const ARABIC_SORT_LABELS: Record<string, string> = {
    'Newest first': 'الأحدث أولاً',
    'Oldest first': 'الأقدم أولاً',
    'Name A-Z': 'الاسم: أ-ي',
    'Name Z-A': 'الاسم: ي-أ',
    'Ascending': 'تصاعدي',
    'Descending': 'تنازلي',
    'Most recent': 'الأحدث',
    'Least recent': 'الأقدم',
    'Newest First': 'الأحدث أولًا',
    'Oldest First': 'الأقدم أولًا',
    'Position ascending': 'الموضع تصاعديًا',
    'Position descending': 'الموضع تنازليًا',
    'Status A-Z': 'الحالة من أ إلى ي',
    'Status Z-A': 'الحالة من ي إلى أ',
    'Buyer Name A-Z': 'اسم المشتري من أ إلى ي',
    'Buyer Name Z-A': 'اسم المشتري من ي إلى أ',
    'Buyer Email A-Z': 'بريد المشتري من أ إلى ي',
    'Buyer Email Z-A': 'بريد المشتري من ي إلى أ',
    'Amount Ascending': 'المبلغ تصاعديًا',
    'Amount Descending': 'المبلغ تنازليًا',
    'Order # Ascending': 'رقم الطلب تصاعديًا',
    'Order # Descending': 'رقم الطلب تنازليًا',
    'Sales Ascending': 'المبيعات تصاعديًا',
    'Sales Descending': 'المبيعات تنازليًا',
    'Revenue Ascending': 'الإيرادات تصاعديًا',
    'Revenue Descending': 'الإيرادات تنازليًا',
    'Code Name A-Z': 'اسم الرمز من أ إلى ي',
    'Code Name Z-A': 'اسم الرمز من ي إلى أ',
    'Usage Count Ascending': 'عدد مرات الاستخدام تصاعديًا',
    'Usage Count Descending': 'عدد مرات الاستخدام تنازليًا',
};

export const SortSelector = ({options, onSortSelect, selected}: SortSelectorProps) => {
    const {i18n} = useLingui();
    const localizeLabel = (label: string) =>
        i18n.locale === 'ar' ? ARABIC_SORT_LABELS[label] || label : label;

    const sortOptions = Object.entries(options).flatMap(([key, {asc, desc}]) => {
        const optionsForThisKey = [];
        if (asc) {
            optionsForThisKey.push({value: `${key}:asc`, label: localizeLabel(asc)});
        }
        if (desc) {
            optionsForThisKey.push({value: `${key}:desc`, label: localizeLabel(desc)});
        }
        return optionsForThisKey;
    });

    return (
        <div className={classes.selectWrapper}>
            <Select
                aria-label={t`Sort by`}
                size={'sm'}
                data={sortOptions}
                className={classes.select}
                value={selected}
                onChange={(value) => {
                    if (value) {
                        const [key, sortDirection] = value.split(':');
                        onSortSelect(key, sortDirection);
                    }
                }}
            />
        </div>
    );
}

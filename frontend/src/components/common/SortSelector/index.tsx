import {Select} from "@mantine/core";
import {useLingui} from "@lingui/react";
import classes from "./SortSelector.module.scss";
import {SortDirectionLabel} from "../../../types.ts";

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

import React from "react";
import {Card} from "../Card";
import classes from './ToolBar.module.scss';
import {t} from "@lingui/macro";
import {useLingui} from "@lingui/react";

interface ToolBarProps {
    children?: React.ReactNode[] | React.ReactNode;
    searchComponent?: () => React.ReactNode;
    filterComponent?: React.ReactNode;
    resultCount?: number;
    resultLabel?: string;
    className?: string;
}

export const ToolBar: React.FC<ToolBarProps> = ({
    searchComponent,
    filterComponent,
    children,
    resultCount,
    resultLabel,
    className,
}) => {
    const {i18n} = useLingui();
    return (
        <Card className={`${classes.toolbar} ${className || ''}`}>
            <div className={classes.rowPrimary}>
                {searchComponent && (
                    <div className={classes.searchSlot}>
                        {searchComponent()}
                    </div>
                )}
                {children && (
                    <div className={classes.actions}>
                        {children}
                    </div>
                )}
            </div>

            {(filterComponent || resultCount !== undefined) && (
                <div className={classes.rowFilters}>
                    {filterComponent && (
                        <div className={classes.filterSlot}>
                            {filterComponent}
                        </div>
                    )}
                    {resultCount !== undefined && (
                        <span className={classes.resultCount}>
                            <bdi>{resultCount.toLocaleString(i18n.locale === 'ar' ? 'ar-SA' : i18n.locale)}</bdi>{' '}
                            {resultLabel || t`results`}
                        </span>
                    )}
                </div>
            )}
        </Card>
    );
};

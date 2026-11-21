import {IconInbox, IconSearchOff, type TablerIcon} from "@tabler/icons-react";
import type {ReactNode} from "react";
import classes from './NoResultsSplash.module.scss';
import {useSearchParams} from "react-router";
import {t} from "@lingui/macro";

interface NoResultsSplashProps {
    heading?: ReactNode,
    children?: ReactNode,
    subHeading?: ReactNode,
    icon?: TablerIcon
}

export const NoResultsSplash = ({
                                    heading = t`'There\'s nothing to show yet'`,
                                    children,
                                    subHeading,
                                    icon: EmptyIcon = IconInbox,
                                }: NoResultsSplashProps) => {
    const [searchParams] = useSearchParams();
    const hasSearchQuery = !!searchParams.get('query');

    const Icon = hasSearchQuery ? IconSearchOff : EmptyIcon;

    return (
        <div className={classes.container}>
            <span className={classes.icon}><Icon size={26} stroke={1.7} aria-hidden/></span>

            {heading && !hasSearchQuery && <h2>{heading}</h2>}

            {hasSearchQuery && (
                <h2>{t`No search results.`}</h2>
            )}

            {(subHeading && !hasSearchQuery) && subHeading}

            {children && children}
        </div>
    )
}

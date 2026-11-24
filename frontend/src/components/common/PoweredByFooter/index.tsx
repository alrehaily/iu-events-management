import {t} from "@lingui/macro";
import classes from "./FloatingPoweredBy.module.scss";
import classNames from "classnames";
import type {ComponentPropsWithoutRef} from "react";
import {useLingui} from "@lingui/react";
import {iHavePurchasedALicence} from "../../../utilites/helpers.ts";

/**
 * (c) Hi.Events Ltd 2025
 *
 * PLEASE NOTE:
 *
 * Hi.Events is licensed under the GNU Affero General Public License (AGPL) version 3.
 *
 * You can find the full license text at: https://github.com/HiEventsDev/hi.events/blob/main/LICENCE
 *
 * In accordance with Section 7(b) of the AGPL, you must retain the "Powered by Hi.Events" notice.
 *
 * If you wish to remove this notice, a commercial license is available at: https://hi.events/licensing
 */
export const PoweredByFooter = ({className, ...props}: ComponentPropsWithoutRef<"div">) => {
    useLingui();
    if (iHavePurchasedALicence()) return null;

    return (
        <div {...props} className={classNames(classes.poweredBy, className)}>
            <div className={classes.poweredByText}>
                {t`Powered by`} <a href="https://hi.events" target="_blank" rel="noopener noreferrer">Hi.Events</a>
            </div>
        </div>
    );
};

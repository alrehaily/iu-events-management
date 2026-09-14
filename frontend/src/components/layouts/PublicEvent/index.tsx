import {useLoaderData} from "react-router";
import EventHomepage from "../EventHomepage";
import {Event} from "../../../types";
import classes from "./PublicEvent.module.scss";

export const PublicEvent = () => {
    const loaderData = useLoaderData();

    const {event, promoCodeValid, promoCode, occurrenceId} = loaderData as {
        event?: Event;
        promoCodeValid?: boolean;
        promoCode?: string;
        occurrenceId?: number | null;
    };

    return (
        <div className={classes.page}>
            <EventHomepage
                event={event}
                promoCodeValid={promoCodeValid}
                promoCode={promoCode}
                initialOccurrenceId={occurrenceId}
            />
        </div>
    );
};

export default PublicEvent;

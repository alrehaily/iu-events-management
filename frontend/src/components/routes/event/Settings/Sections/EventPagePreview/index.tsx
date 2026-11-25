import {useState} from "react";
import {useParams} from "react-router";
import {t} from "@lingui/macro";
import {IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconLock} from "@tabler/icons-react";
import {Card} from "../../../../../common/Card";
import {HeadingWithDescription} from "../../../../../common/Card/CardHeading";
import {LoadingMask} from "../../../../../common/LoadingMask";
import {useGetEvent} from "../../../../../../queries/useGetEvent.ts";
import {useGetEventSettings} from "../../../../../../queries/useGetEventSettings.ts";
import {useGetEventImages} from "../../../../../../queries/useGetEventImages.ts";
import {eventPreviewPath} from "../../../../../../utilites/urlHelper.ts";
import {useIULanguage} from "../../../../../../context/IULanguageContext.tsx";
import classes from "./EventPagePreview.module.scss";

type ViewMode = 'desktop' | 'tablet' | 'mobile';

// Shows the event page as attendees see it. It reloads whenever the event,
// its settings or its cover change, so each save in the sections below shows up here.
export const EventPagePreview = () => {
    const {eventId} = useParams();
    const {locale} = useIULanguage();
    const eventQuery = useGetEvent(eventId);
    const settingsQuery = useGetEventSettings(eventId);
    const imagesQuery = useGetEventImages(eventId);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');

    const cover = imagesQuery.data?.find((image) => image.type === 'EVENT_COVER');
    const iframeSrc = eventPreviewPath(eventId) + '?' + new URLSearchParams({
        locale,
        cover: String(cover?.id ?? ''),
    });
    const reloadKey = [
        iframeSrc,
        eventQuery.dataUpdatedAt,
        settingsQuery.dataUpdatedAt,
        imagesQuery.dataUpdatedAt,
    ].join('|');
    const ready = eventQuery.isFetched && settingsQuery.isFetched && imagesQuery.isFetched;

    const viewButtons: Array<{mode: ViewMode; title: string; icon: typeof IconDeviceDesktop}> = [
        {mode: 'desktop', title: t`Desktop`, icon: IconDeviceDesktop},
        {mode: 'tablet', title: t`Tablet`, icon: IconDeviceTablet},
        {mode: 'mobile', title: t`Mobile`, icon: IconDeviceMobile},
    ];

    return (
        <Card>
            <HeadingWithDescription
                heading={t`Preview Event page`}
                description={t`This is how attendees see your event page. It updates after each save.`}
            />
            <div className={classes.stage}>
                <div className={classes.browser} data-view={viewMode}>
                    <div className={classes.browserHeader}>
                        <div className={classes.windowControls}>
                            <span/>
                            <span/>
                            <span/>
                        </div>
                        <div className={classes.urlBar}>
                            <IconLock size={13}/>
                            <span>iu-events.sa/event/{eventQuery.data?.slug || eventId}</span>
                        </div>
                        <div className={classes.viewModes}>
                            {viewButtons.map(({mode, title, icon: Icon}) => (
                                <button
                                    key={mode}
                                    type="button"
                                    className={classes.viewButton}
                                    data-active={viewMode === mode}
                                    onClick={() => setViewMode(mode)}
                                    title={title}
                                    aria-label={title}
                                >
                                    <Icon size={15}/>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={classes.frame}>
                        {ready ? (
                            <iframe
                                key={reloadKey}
                                src={iframeSrc}
                                sandbox="allow-same-origin allow-scripts"
                                title={t`Event Preview`}
                            />
                        ) : (
                            <LoadingMask/>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

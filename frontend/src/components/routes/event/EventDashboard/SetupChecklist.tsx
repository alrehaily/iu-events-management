import {Button} from "@mantine/core";
import {IconCheck, IconCircle, IconCircleCheck, IconX} from "@tabler/icons-react";
import {t} from "@lingui/macro";
import {useLingui} from "@lingui/react";
import {Event, EventType, Image} from "../../../../types.ts";
import classes from "./SetupChecklist.module.scss";

interface SetupChecklistProps {
    event: Event;
    hasOccurrences: boolean;
    eventImages: Image[] | undefined;
    onPublish: () => void;
    onEditDetails: () => void;
    onSetupSchedule: () => void;
    onCustomizePage: () => void;
    onDismiss: () => void;
    isDismissed: boolean;
    showCongratsHeader?: boolean;
}

export const hasEventDetails = (event: Event): boolean => {
    const description = event.description?.trim() ?? '';

    return description.length > 0 && !!event.event_location;
};

type ActionStyle = 'primary' | 'secondary';

interface Step {
    key: string;
    title: string;
    helperIncomplete: string;
    helperComplete: string;
    complete: boolean;
    actionLabel?: string;
    actionStyle?: ActionStyle;
    onAction?: () => void;
    actionLoading?: boolean;
    // Keep the button after the step is complete, so the organizer can come back and edit.
    keepActionWhenComplete?: boolean;
}

export const SetupChecklist = ({
                                   event,
                                   hasOccurrences,
                                   eventImages,
                                   onPublish,
                                   onEditDetails,
                                   onSetupSchedule,
                                   onCustomizePage,
                                   onDismiss,
                                   isDismissed,
                                   showCongratsHeader = false,
                               }: SetupChecklistProps) => {
    const {i18n} = useLingui();
    const isArabic = i18n.locale === 'ar';

    const hasCoverImage = (eventImages?.length ?? 0) > 0;
    const isRecurring = event.type === EventType.RECURRING;

    const steps: Step[] = [
        ...(isRecurring ? [{
            key: 'schedule',
            title: t`Set up your schedule`,
            helperIncomplete: t`Add dates and times for your recurring event`,
            helperComplete: t`Schedule added`,
            complete: hasOccurrences,
            actionLabel: hasOccurrences ? t`Manage schedule` : t`Set up schedule`,
            actionStyle: 'primary',
            onAction: onSetupSchedule,
        } as Step] : []),
        {
            key: 'publish',
            title: t`Publish your event`,
            helperIncomplete: t`Make it visible so people can buy tickets`,
            helperComplete: event.status === 'PENDING_MANUAL_REVIEW' ? t`Pending review` : t`Live`,
            complete: event.status === 'LIVE' || event.status === 'PENDING_MANUAL_REVIEW',
            actionLabel: t`Publish`,
            actionStyle: isRecurring && !hasOccurrences ? 'secondary' : 'primary',
            onAction: onPublish,
        },
        {
            key: 'details',
            title: t`Add event details`,
            helperIncomplete: t`Add a description and venue so attendees know what to expect`,
            helperComplete: t`Description and venue added`,
            complete: hasEventDetails(event),
            actionLabel: t`Add details`,
            actionStyle: 'secondary',
            onAction: onEditDetails,
            keepActionWhenComplete: true,
        },
        {
            key: 'customize',
            title: t`Customize your event page`,
            helperIncomplete: t`Add a cover image and theme to match your brand`,
            helperComplete: t`Cover image added`,
            complete: hasCoverImage,
            actionLabel: t`Customize page`,
            actionStyle: 'secondary',
            onAction: onCustomizePage,
            keepActionWhenComplete: true,
        },
    ];

    const completedCount = steps.filter((s) => s.complete).length;
    const totalCount = steps.length;

    if (isDismissed) {
        return null;
    }

    const sortedSteps = [...steps].sort((a, b) => Number(a.complete) - Number(b.complete));
    const progressPercent = (completedCount / totalCount) * 100;

    return (
        <div className={`${classes.card} ${showCongratsHeader ? classes.cardCongrats : ''}`}>
            <button
                type="button"
                className={`${classes.dismiss} ${showCongratsHeader ? classes.dismissCongrats : ''}`}
                onClick={onDismiss}
                aria-label={t`Dismiss setup checklist`}
            >
                <IconX size={showCongratsHeader ? 18 : 16}/>
            </button>

            {showCongratsHeader && (
                <div className={classes.congratsHero}>
                    <div className={classes.congratsEmoji} aria-hidden="true">
                        <IconCircleCheck
                            size={68}
                            stroke={1.55}
                            color="var(--iu-icon, #0f172a)"
                        />
                    </div>
                    <div className={classes.congratsEyebrow}>{t`Event created`}</div>
                    <h2 className={classes.congratsTitle}>{event.title}</h2>
                    <p className={classes.congratsSubtitle}>
                        {t`A few quick steps and you're ready to start selling.`}
                    </p>
                </div>
            )}

            <div className={`${classes.header} ${showCongratsHeader ? classes.headerCompact : ''}`}>
                <div className={classes.headerLeft}>
                    {!showCongratsHeader && (
                        <div className={classes.title}>{t`Get your event ready`}</div>
                    )}
                    <div className={classes.subtitle}>
                        {isArabic
                            ? `${completedCount} من ${totalCount} خطوات مكتملة`
                            : t`${completedCount} of ${totalCount} steps complete`}
                    </div>
                </div>
                <div className={classes.headerRight}>
                    <div className={classes.progressTrack}>
                        <div
                            className={classes.progressFill}
                            style={{width: `${progressPercent}%`}}
                        />
                    </div>
                </div>
            </div>

            <div className={classes.body}>
                {sortedSteps.map((step) => (
                    <div key={step.key} className={classes.row}>
                        <div className={classes.rowLeft}>
                            {step.complete ? (
                                <IconCircleCheck size={18} className={classes.iconComplete}/>
                            ) : (
                                <IconCircle size={18} className={classes.iconIncomplete}/>
                            )}
                            <div className={classes.rowText}>
                                <span
                                    className={`${classes.rowTitle} ${step.complete ? classes.rowTitleComplete : classes.rowTitleIncomplete}`}
                                >
                                    {step.title}
                                </span>
                                <span
                                    className={`${classes.rowHelper} ${step.complete ? classes.rowHelperComplete : classes.rowHelperIncomplete}`}
                                >
                                    {step.complete ? step.helperComplete : step.helperIncomplete}
                                </span>
                            </div>
                        </div>
                        <div className={classes.rowRight}>
                            {step.complete && !step.keepActionWhenComplete ? (
                                <IconCheck size={15} className={classes.checkDone}/>
                            ) : step.actionLabel && step.onAction ? (
                                step.actionStyle === 'primary' ? (
                                    <Button
                                        size="xs"
                                        onClick={step.onAction}
                                        loading={step.actionLoading}
                                        className={classes.actionPrimary}
                                    >
                                        {step.actionLabel}
                                    </Button>
                                ) : (
                                    <Button
                                        size="xs"
                                        variant="default"
                                        onClick={step.onAction}
                                        loading={step.actionLoading}
                                        className={classes.actionSecondary}
                                    >
                                        {step.actionLabel}
                                    </Button>
                                )
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SetupChecklist;

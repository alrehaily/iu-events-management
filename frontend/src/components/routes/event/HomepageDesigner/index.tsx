import {useEffect, useState} from "react";
import classes from './HomepageDesigner.module.scss';
import {useParams} from "react-router";
import {useGetEventSettings} from "../../../../queries/useGetEventSettings.ts";
import {useUpdateEventSettings} from "../../../../mutations/useUpdateEventSettings.ts";
import {useFormErrorResponseHandler} from "../../../../hooks/useFormErrorResponseHandler.tsx";
import {EventSettings, HomepageThemeSettings} from "../../../../types.ts";
import {showSuccess} from "../../../../utilites/notifications.tsx";
import {t} from "@lingui/macro";
import {useForm} from "@mantine/form";
import {Accordion, Button, Group, Stack, Switch, Text, Textarea, TextInput} from "@mantine/core";
import {
    IconAdjustments, 
    IconHelp, 
    IconPhoto, 
    IconLock, 
    IconDeviceDesktop, 
    IconDeviceTablet, 
    IconDeviceMobile
} from "@tabler/icons-react";
import {Tooltip} from "../../../common/Tooltip";
import {GET_EVENT_IMAGES_QUERY_KEY, useGetEventImages} from "../../../../queries/useGetEventImages.ts";
import {eventPreviewPath} from "../../../../utilites/urlHelper.ts";
import {LoadingMask} from "../../../common/LoadingMask";
import {ImageUploadDropzone} from "../../../common/ImageUploadDropzone";
import {queryClient} from "../../../../utilites/queryClient.ts";
import {GET_EVENT_PUBLIC_QUERY_KEY} from "../../../../queries/useGetEventPublic.ts";
import {getDefaultThemeSettings, validateThemeSettings} from "../../../../utilites/themeUtils.ts";
import {GET_EVENT_QUERY_KEY, useGetEvent} from "../../../../queries/useGetEvent.ts";
import {useIULanguage} from "../../../../context/IULanguageContext.tsx";
import {useHomepagePreviewFrame} from "../../../../hooks/useHomepagePreview.ts";

interface FormValues {
    homepage_theme_settings: Partial<HomepageThemeSettings>;
    is_certificate_eligible: boolean;
    target_audience: string;
    certificate_info: string;
    requirements_info: string;
    event_highlights: string;
    attendee_notice: string;
}

const HomepageDesigner = () => {
    const {eventId} = useParams();
    const eventSettingsQuery = useGetEventSettings(eventId);
    const eventImagesQuery = useGetEventImages(eventId);
    const eventQuery = useGetEvent(eventId);
    const updateMutation = useUpdateEventSettings();
    const {locale} = useIULanguage();

    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const [accordionValue, setAccordionValue] = useState<string[]>(['images', 'details']);

    const existingCover = eventImagesQuery.data?.find((image) => image.type === 'EVENT_COVER');
    const eventData = eventQuery.data;
    const iframeSrc = eventPreviewPath(eventId) + '?' + new URLSearchParams({
        locale,
        cover: String(existingCover?.id ?? ''),
    });

    const form = useForm<FormValues>({
        initialValues: {
            homepage_theme_settings: getDefaultThemeSettings(),
            is_certificate_eligible: false,
            target_audience: '',
            certificate_info: '',
            requirements_info: '',
            event_highlights: '',
            attendee_notice: '',
        }
    });

    const formErrorHandle = useFormErrorResponseHandler();

    useEffect(() => {
        if (eventSettingsQuery.data && eventData) {
            const settings = eventSettingsQuery.data;
            const themeSettings = validateThemeSettings(settings.homepage_theme_settings);

            form.setValues({
                homepage_theme_settings: themeSettings,
                is_certificate_eligible: Boolean(eventData.is_certificate_eligible),
                target_audience: settings.target_audience || '',
                certificate_info: settings.certificate_info || '',
                requirements_info: settings.requirements_info || '',
                event_highlights: settings.event_highlights || '',
                attendee_notice: settings.attendee_notice || '',
            });
        }
    }, [eventSettingsQuery.data, eventData]);

    const handleSubmit = (values: FormValues) => {
        const validatedTheme = validateThemeSettings(values.homepage_theme_settings);

        const eventSettings: Partial<EventSettings> = {
            homepage_theme_settings: validatedTheme,
            is_certificate_eligible: values.is_certificate_eligible,
            target_audience: values.target_audience,
            certificate_info: values.certificate_info,
            requirements_info: values.requirements_info,
            event_highlights: values.event_highlights,
            attendee_notice: values.attendee_notice,
            homepage_primary_color: validatedTheme.accent,
            homepage_body_background_color: validatedTheme.background,
            homepage_background_type: validatedTheme.background_type,
        };

        updateMutation.mutate(
            {eventSettings, eventId: eventId},
            {
                onSuccess: () => {
                    showSuccess(t`Successfully Updated Homepage Design`);
                    queryClient.invalidateQueries({
                        queryKey: [GET_EVENT_PUBLIC_QUERY_KEY, eventId]
                    });
                    queryClient.invalidateQueries({queryKey: [GET_EVENT_QUERY_KEY, eventId]});
                },
                onError: (error) => {
                    formErrorHandle(form, error);
                },
            }
        );
    };

    const handleImageChange = () => {
        queryClient.invalidateQueries({
            queryKey: [GET_EVENT_IMAGES_QUERY_KEY, eventId]
        });
        queryClient.invalidateQueries({
            queryKey: [GET_EVENT_PUBLIC_QUERY_KEY, eventId]
        });
    };

    const iframeRef = useHomepagePreviewFrame("UPDATE_SETTINGS", {
        ...form.values,
        homepage_theme_settings: validateThemeSettings(form.values.homepage_theme_settings),
    });

    return (
        <div className={classes.container} data-homepage-designer>
            <div className={classes.sidebar}>
                <div className={classes.sticky}>
                    <div className={classes.header}>
                        <h2>{t`Homepage Design`}</h2>
                        <Text c="dimmed" size="sm">{t`Customize cover image and event information.`}</Text>
                    </div>

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Accordion
                            multiple
                            value={accordionValue}
                            onChange={setAccordionValue}
                            variant="contained"
                            className={classes.accordion}
                        >
                            <Accordion.Item value="images" className={classes.accordionItem}>
                                <Accordion.Control icon={<IconPhoto size={20} />}>
                                    <Text fw={500}>{t`Cover Image`}</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap="lg">
                                        <div>
                                            <Group justify={'space-between'} mb="xs">
                                                <Text fw={500} size="sm">{t`Cover Image`}</Text>
                                                <Tooltip
                                                    label={t`We recommend dimensions of 1950px by 650px, a ratio of 3:1, and a maximum file size of 5MB`}>
                                                    <IconHelp size={16} style={{ color: 'var(--mantine-color-gray-6)' }}/>
                                                </Tooltip>
                                            </Group>
                                            <ImageUploadDropzone
                                                imageType="EVENT_COVER"
                                                entityId={eventId}
                                                onUploadSuccess={handleImageChange}
                                                onDeleteSuccess={handleImageChange}
                                                existingImageData={{
                                                    url: existingCover?.url,
                                                    id: existingCover?.id,
                                                }}
                                                helpText={t`Cover image will be displayed at the top of your event page`}
                                                displayMode="compact"
                                            />
                                        </div>
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="details" className={classes.accordionItem}>
                                <Accordion.Control icon={<IconAdjustments size={20} />}>
                                    <Text fw={500}>{t`Event Details`}</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <fieldset disabled={!eventSettingsQuery.data || !eventData || updateMutation.isPending} className={classes.fieldset}>
                                        <Stack gap="md">
                                            <Switch
                                                label={t`Does this event offer a certificate of attendance?`}
                                                description={t`Show the certificate of attendance and accreditation badge on the event page.`}
                                                color="teal"
                                                size="sm"
                                                {...form.getInputProps('is_certificate_eligible', { type: 'checkbox' })}
                                            />
                                            <TextInput
                                                label={t`Target Audience`}
                                                placeholder={t`Students, researchers, and interested community members`}
                                                description={t`Leave this field blank to use the default text.`}
                                                size="sm"
                                                {...form.getInputProps('target_audience')}
                                            />

                                            <TextInput
                                                label={t`Certificate Details`}
                                                placeholder={t`Certificates are issued to attendees who meet the attendance criteria.`}
                                                description={t`Leave this field blank to use the default text.`}
                                                size="sm"
                                                {...form.getInputProps('certificate_info')}
                                            />

                                            <TextInput
                                                label={t`Event Requirements`}
                                                placeholder={t`Register in advance and confirm attendance through the platform.`}
                                                description={t`Leave this field blank to use the default text.`}
                                                size="sm"
                                                {...form.getInputProps('requirements_info')}
                                            />

                                            <Textarea
                                                label={t`Event Highlights (one per line)`}
                                                placeholder={t`Explore core concepts and practical examples.`}
                                                rows={4}
                                                description={t`Leave this field blank to use the default text.`}
                                                size="sm"
                                                {...form.getInputProps('event_highlights')}
                                            />

                                            <Textarea
                                                label={t`Attendee Notes`}
                                                placeholder={t`Please arrive 15 minutes before the event starts.`}
                                                rows={3}
                                                description={t`Leave this field blank to use the default text.`}
                                                size="sm"
                                                {...form.getInputProps('attendee_notice')}
                                            />
                                        </Stack>
                                    </fieldset>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>

                        <Button
                            loading={updateMutation.isPending}
                            disabled={!eventSettingsQuery.data || !eventData}
                            type="submit"
                            fullWidth
                            mt="md"
                        >
                            {t`Save Changes`}
                        </Button>
                    </form>
                </div>
            </div>

            <div className={classes.previewContainer}>
                <div className={classes.browserMockup} data-view={viewMode}>
                    <div className={classes.browserHeader}>
                        <div className={classes.windowControls}>
                            <span />
                            <span />
                            <span />
                        </div>
                        <div className={classes.browserUrlBar}>
                            <IconLock size={13} />
                            <span>iu-events.sa/event/{eventData?.slug || eventId}</span>
                        </div>
                        <div className={classes.viewModeGroup}>
                            <button
                                type="button"
                                className={classes.viewBtn}
                                data-active={viewMode === 'desktop'}
                                onClick={() => setViewMode('desktop')}
                                title={t`Desktop`}
                            >
                                <IconDeviceDesktop size={15} />
                            </button>
                            <button
                                type="button"
                                className={classes.viewBtn}
                                data-active={viewMode === 'tablet'}
                                onClick={() => setViewMode('tablet')}
                                title={t`Tablet`}
                            >
                                <IconDeviceTablet size={15} />
                            </button>
                            <button
                                type="button"
                                className={classes.viewBtn}
                                data-active={viewMode === 'mobile'}
                                onClick={() => setViewMode('mobile')}
                                title={t`Mobile`}
                            >
                                <IconDeviceMobile size={15} />
                            </button>
                        </div>
                    </div>
                    <div className={classes.iframeWrapper}>
                        {eventImagesQuery.isFetched && eventSettingsQuery.isFetched ? (
                            <iframe
                                ref={iframeRef}
                                key={iframeSrc}
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
        </div>
    );
};

export default HomepageDesigner;

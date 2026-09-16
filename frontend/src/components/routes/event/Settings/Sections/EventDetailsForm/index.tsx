import {t} from "@lingui/macro";
import {Accordion, Button, Group, Select, Stack, Switch, Text, Textarea, TextInput} from "@mantine/core";
import {IconAdjustments, IconCalendarRepeat, IconHelp} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {useLingui} from "@lingui/react";
import {NavLink, useParams} from "react-router";
import {useGetEvent} from "../../../../../../queries/useGetEvent.ts";
import {useGetEventSettings} from "../../../../../../queries/useGetEventSettings.ts";
import {useEffect, useMemo} from "react";
import {useUpdateEvent} from "../../../../../../mutations/useUpdateEvent.ts";
import {useUpdateEventSettings} from "../../../../../../mutations/useUpdateEventSettings.ts";
import {EventType} from "../../../../../../types.ts";
import {InputGroup} from "../../../../../common/InputGroup";
import {Card} from "../../../../../common/Card";
import {Callout} from "../../../../../common/Callout";
import {Editor} from "../../../../../common/Editor";
import {utcToTz} from "../../../../../../utilites/dates.ts";
import {showSuccess} from "../../../../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../../../../hooks/useFormErrorResponseHandler.tsx";
import {currenciesMap} from "../../../../../../../data/currencies.ts";
import {timezones} from "../../../../../../../data/timezones.ts";
import {HeadingWithDescription} from "../../../../../common/Card/CardHeading";
import {getEventCategories, getCategoryIcon} from "../../../../../../constants/eventCategories.ts";
import {GET_EVENT_IMAGES_QUERY_KEY, useGetEventImages} from "../../../../../../queries/useGetEventImages.ts";
import {ImageUploadDropzone} from "../../../../../common/ImageUploadDropzone";
import {queryClient} from "../../../../../../utilites/queryClient.ts";
import {GET_EVENT_PUBLIC_QUERY_KEY} from "../../../../../../queries/useGetEventPublic.ts";
import {Tooltip} from "../../../../../common/Tooltip";

const getArabicCurrencyName = (currencyCode: string, fallback: string) => {
    try {
        const formatter = new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'name',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return formatter.formatToParts(0).find((part) => part.type === 'currency')?.value || fallback;
    } catch {
        return fallback;
    }
};

const getArabicTimezoneName = (timezone: string) => {
    try {
        const formatter = new Intl.DateTimeFormat('ar-SA', {
            timeZone: timezone,
            timeZoneName: 'long',
        });
        return formatter.formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value || timezone;
    } catch {
        return timezone;
    }
};

export const EventDetailsForm = () => {
    const {eventId} = useParams();
    const {i18n} = useLingui();
    const eventQuery = useGetEvent(eventId);
    const eventSettingsQuery = useGetEventSettings(eventId);
    const eventImagesQuery = useGetEventImages(eventId);
    const updateMutation = useUpdateEvent();
    const updateSettingsMutation = useUpdateEventSettings();
    const isRecurring = eventQuery.data?.type === EventType.RECURRING;
    const isArabic = i18n.locale === 'ar';

    const existingCover = eventImagesQuery.data?.find((image) => image.type === 'EVENT_COVER');

    const handleImageChange = () => {
        queryClient.invalidateQueries({
            queryKey: [GET_EVENT_IMAGES_QUERY_KEY, eventId]
        });
        queryClient.invalidateQueries({
            queryKey: [GET_EVENT_PUBLIC_QUERY_KEY, eventId]
        });
    };

    const currencyOptions = useMemo(
        () => currenciesMap.map((currency) => ({
            ...currency,
            label: isArabic ? getArabicCurrencyName(currency.value, currency.label) : currency.label,
        })),
        [isArabic],
    );

    const timezoneOptions = useMemo(
        () => timezones.map((timezone) => ({
            value: timezone,
            label: isArabic ? getArabicTimezoneName(timezone) : timezone,
        })),
        [isArabic],
    );

    const form = useForm({
        initialValues: {
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            timezone: '',
            currency: '',
            category: '',
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
        if (eventQuery?.data) {
            const settings = eventSettingsQuery.data;
            form.setValues({
                title: eventQuery.data.title || '',
                description: eventQuery.data.description || '',
                start_date: utcToTz(eventQuery.data.start_date, eventQuery.data.timezone),
                end_date: utcToTz(eventQuery.data.end_date, eventQuery.data.timezone),
                timezone: eventQuery.data.timezone || '',
                currency: eventQuery.data.currency || '',
                category: eventQuery.data.category || '',
                is_certificate_eligible: Boolean(settings?.is_certificate_eligible ?? (eventQuery.data as any).is_certificate_eligible ?? false),
                target_audience: settings?.target_audience || (eventQuery.data as any).target_audience || '',
                certificate_info: settings?.certificate_info || (eventQuery.data as any).certificate_info || '',
                requirements_info: settings?.requirements_info || (eventQuery.data as any).requirements_info || '',
                event_highlights: settings?.event_highlights || (eventQuery.data as any).event_highlights || '',
                attendee_notice: settings?.attendee_notice || (eventQuery.data as any).attendee_notice || '',
            });
        }
    }, [eventQuery.isFetched, eventSettingsQuery.isFetched]);

    const handleSubmit = (values: any) => {
        const {
            is_certificate_eligible,
            target_audience,
            certificate_info,
            requirements_info,
            event_highlights,
            attendee_notice,
            ...eventData
        } = values;

        updateMutation.mutate({
            eventData: {
                ...eventData,
                is_certificate_eligible,
            },
            eventId: eventId,
        });

        updateSettingsMutation.mutate({
            eventSettings: {
                is_certificate_eligible,
                target_audience,
                certificate_info,
                requirements_info,
                event_highlights,
                attendee_notice,
            },
            eventId: eventId,
        }, {
            onSuccess: () => {
                showSuccess(t`Successfully Updated Event`);
                queryClient.invalidateQueries({
                    queryKey: [GET_EVENT_PUBLIC_QUERY_KEY, eventId]
                });
            },
            onError: (error) => {
                formErrorHandle(form, error);
            }
        });
    };

    return (
        <Card>
            <HeadingWithDescription
                heading={t`Event Details`}
                description={isRecurring
                    ? t`Update event name and description`
                    : t`Update event name, description and dates`}
            />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <fieldset disabled={eventQuery.isLoading || updateMutation.isPending}>
                    <TextInput
                        {...form.getInputProps('title')}
                        label={t`Name`}
                        placeholder={t`Summer Music Festival ${new Date().getFullYear()}`}
                        required
                    />

                    <div style={{ marginBlock: '1rem' }}>
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

                    <Select
                        {...form.getInputProps('category')}
                        label={t`Category`}
                        placeholder={t`Select a category`}
                        data={getEventCategories().map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))}
                        renderOption={({ option }) => {
                            const Icon = getCategoryIcon(option.value);
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon size={18} stroke={1.5} color="#0f172a" />
                                    <span>{option.label}</span>
                                </div>
                            );
                        }}
                        leftSection={form.values.category ? (() => {
                            const SelectedIcon = getCategoryIcon(form.values.category);
                            return <SelectedIcon size={18} stroke={1.5} color="#0f172a" />;
                        })() : null}
                        searchable
                        clearable
                    />

                    <Editor
                        label={t`Description`}
                        value={form.values.description || ''}
                        onChange={(value) => form.setFieldValue('description', value)}
                        error={form.errors?.description as string}
                    />

                    <Accordion variant="contained" mt="md" mb="md">
                        <Accordion.Item value="custom-details">
                            <Accordion.Control icon={<IconAdjustments size={18} />}>
                                <Text fw={600} size="sm">{t`تفاصيل ومعلومات إضافية للفعالية (اختياري)`}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap="sm">
                                    <Switch
                                        {...form.getInputProps('is_certificate_eligible', { type: 'checkbox' })}
                                        label={t`هل تتضمن الفعالية شهادة حضور؟`}
                                        description={t`عند تفعيل هذا الخيار، سيتم عرض بطاقة شهادة الحضور وشعار الاعتماد في صفحة الفعالية`}
                                        color="teal"
                                        size="md"
                                        mb="xs"
                                    />
                                    <TextInput
                                        {...form.getInputProps('target_audience')}
                                        label={t`الفئة المستهدفة`}
                                        placeholder={t`كافة المستفيدين، الباحثون، والمهتمون`}
                                        description={t`اترك الحقل فارغاً لاستخدام النص الافتراضي`}
                                    />

                                    <TextInput
                                        {...form.getInputProps('certificate_info')}
                                        label={t`تفاصيل شهادة الحضور`}
                                        placeholder={t`تمنح شهادة وفقاً لمعايير الحضور`}
                                        description={t`اترك الحقل فارغاً لاستخدام النص الافتراضي`}
                                    />

                                    <TextInput
                                        {...form.getInputProps('requirements_info')}
                                        label={t`متطلبات الفعالية`}
                                        placeholder={t`التسجيل المسبق وتأكيد الحضور عبر المنصة`}
                                        description={t`اترك الحقل فارغاً لاستخدام النص الافتراضي`}
                                    />

                                    <Textarea
                                        {...form.getInputProps('event_highlights')}
                                        label={t`محاور الفعالية وأهدافها (محور في كل سطر)`}
                                        placeholder={`اكتساب المفاهيم والأسس العلمية والتطبيقية للموضوع المطروح.\nالتعرف على أفضل الممارسات والتطبيقات الحديثة في المجال.`}
                                        rows={4}
                                        description={t`اترك الحقل فارغاً لاستخدام المحاور الافتراضية`}
                                    />

                                    <Textarea
                                        {...form.getInputProps('attendee_notice')}
                                        label={t`ملاحظات وتنبيهات الحضور`}
                                        placeholder={t`يرجى التكرم بالحضور قبل موعد بدء الفعالية بـ 15 دقيقة...`}
                                        rows={3}
                                        description={t`اترك الحقل فارغاً لاستخدام الملاحظات الافتراضية`}
                                    />
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                    {isRecurring ? (
                        <Callout variant="info" title={t`Dates are managed per occurrence`}>
                            {t`This event's dates and times are set on the occurrence schedule.`}
                            <div style={{marginTop: '0.75rem'}}>
                                <Button
                                    component={NavLink}
                                    to={'/manage/event/' + eventId + '/occurrences'}
                                    leftSection={<IconCalendarRepeat size={16}/>}
                                    variant="light"
                                >
                                    {t`Manage schedule`}
                                </Button>
                            </div>
                        </Callout>
                    ) : (
                        <InputGroup>
                            <TextInput type={'datetime-local'}
                                       {...form.getInputProps('start_date')}
                                       label={t`Start Date`}
                                       required
                            />
                            <TextInput type={'datetime-local'}
                                       {...form.getInputProps('end_date')}
                                       label={t`End Date`}
                            />
                        </InputGroup>
                    )}
                    <InputGroup>
                        <Select
                            searchable
                            data={currencyOptions}
                            {...form.getInputProps('currency')}
                            label={t`Currency`}
                            placeholder={isArabic ? 'اليورو' : 'EUR'}
                            description={t`The currency used for this event's ticket prices.`}
                        />

                        <Select
                            searchable
                            data={timezoneOptions}
                            {...form.getInputProps('timezone')}
                            label={t`Timezone`}
                            placeholder={isArabic ? 'التوقيت العالمي المنسق' : 'UTC'}
                            description={t`The timezone used for this event's dates and times.`}
                        />
                    </InputGroup>
                    <Button loading={updateMutation.isPending || updateSettingsMutation.isPending} type={'submit'}>
                        {t`Save`}
                    </Button>
                </fieldset>
            </form>
        </Card>
    );
}

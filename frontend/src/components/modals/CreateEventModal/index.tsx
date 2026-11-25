import {useLingui} from "@lingui/react";
import {useFormErrorResponseHandler} from "../../../hooks/useFormErrorResponseHandler.tsx";
import {useNavigate} from "react-router";
import {SAUDI_TIMEZONE} from "../../../constants/institution.ts";
import {
    Event,
    EventType,
    GenericModalProps,
    IdParam,
    LocationType,
    Organizer,
    Product,
    ProductPriceType,
    ProductType
} from "../../../types.ts";
import {useEffect, useState} from "react";
import {t} from "@lingui/macro";
import {Anchor, Button, Modal, NumberInput, Portal, SegmentedControl, Select, TextInput} from "@mantine/core";
import {hasLength, useForm} from "@mantine/form";
import {Dropzone, IMAGE_MIME_TYPE} from "@mantine/dropzone";
import {useCreateEvent} from "../../../mutations/useCreateEvent.ts";
import {useCreateProduct} from "../../../mutations/useCreateProduct.ts";
import {useCreateLocation} from "../../../mutations/useCreateLocation.ts";
import {useUpdateEventLocation} from "../../../mutations/useUpdateEventLocation.ts";
import {useUploadEventImage} from "../../../mutations/useUploadEventImage.ts";
import {useUpdateEventStatus} from "../../../mutations/useUpdateEventStatus.ts";
import {eventsClient} from "../../../api/event.client.ts";
import {Editor} from "../../common/Editor";
import {useGetOrganizers} from "../../../queries/useGetOrganizers.ts";
import {
    IconArrowLeft,
    IconArrowRight,
    IconCalendarEvent,
    IconCalendarRepeat,
    IconCheck,
    IconLink,
    IconMapPin,
    IconMapPinFilled,
    IconPalette,
    IconListDetails,
    IconPhoto,
    IconSparkles,
    IconTicket,
    IconUsers,
    IconX
} from "@tabler/icons-react";
import classes from "./CreateEventModal.module.scss";
import {OrganizerCreateForm} from "../../forms/OrganizerForm";
import dayjs from "dayjs";
import {DateTimePicker} from "@mantine/dates";
import {getEventCategories, getCategoryIcon} from "../../../constants/eventCategories.ts";
import {Callout} from "../../common/Callout";
import {getDateTimePickerFormat} from "../../../utilites/dates.ts";
import {showError} from "../../../utilites/notifications.tsx";
import {VenueMapPicker, VenuePoint} from "../../common/VenueMapPicker";

interface CreateEventModalProps extends GenericModalProps {
    organizerId?: IdParam;
}

type Step = 1 | 2 | 3 | 4;

// What happens after the event is saved: publish it, keep it as a draft,
// or keep it as a draft and open the page with more details or design options.
type SaveAction = 'publish' | 'draft' | 'details' | 'design';

const MAX_COVER_SIZE = 5 * 1024 * 1024;

const defaultStartDate = () => dayjs().tz(SAUDI_TIMEZONE).add(1, 'day').hour(21).startOf('hour').format('YYYY-MM-DD HH:mm:ss');

const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const onlineDetailsHtml = (link: string) => {
    const safe = escapeHtml(link);
    return /^https?:\/\//i.test(link) ? `<p><a href="${safe}">${safe}</a></p>` : `<p>${safe}</p>`;
};

export const CreateEventModal = ({onClose, organizerId}: CreateEventModalProps) => {
    useLingui();
    const errorHandler = useFormErrorResponseHandler();
    const navigate = useNavigate();
    const organizersQuery = useGetOrganizers();

    const form = useForm<Partial<Event>>({
        initialValues: {
            title: '',
            status: undefined,
            type: EventType.SINGLE,
            start_date: defaultStartDate(),
            end_date: undefined,
            description: undefined,
            organizer_id: organizerId ? String(organizerId) : undefined,
            category: undefined,
        },
        validate: {
            title: hasLength({max: 150}, t`Event name should be less than 150 characters`),
            end_date: (value, values) => {
                if (values.type === EventType.RECURRING) return;
                if (value && values.start_date && dayjs(value).isBefore(dayjs(values.start_date))) {
                    return t`End date must be after start date`;
                }
            },
            organizer_id: (value) => {
                if (!value) {
                    return t`Organizer is required`;
                }
            },
        },
        validateInputOnChange: true,
    });

    // Location, ticket and cover are optional extras saved right after the event is created.
    const [locationType, setLocationType] = useState<LocationType>(LocationType.InPerson);
    const [onlineLink, setOnlineLink] = useState('');
    const [venueName, setVenueName] = useState('');
    const [venuePoint, setVenuePoint] = useState<VenuePoint | null>(null);
    const [mapOpened, setMapOpened] = useState(false);

    const defaultTicketTitle = t`General Admission`;
    const [ticketTitle, setTicketTitle] = useState(defaultTicketTitle);
    const [ticketPriceType, setTicketPriceType] = useState<ProductPriceType>(ProductPriceType.Free);
    const [ticketPrice, setTicketPrice] = useState<number | string>('');
    const [ticketQuantity, setTicketQuantity] = useState<number | string>('');
    const [ticketPriceError, setTicketPriceError] = useState<string | null>(null);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverError, setCoverError] = useState<string | null>(null);

    const eventMutation = useCreateEvent();
    const productMutation = useCreateProduct();
    const createLocationMutation = useCreateLocation();
    const eventLocationMutation = useUpdateEventLocation();
    const coverMutation = useUploadEventImage();
    const statusMutation = useUpdateEventStatus();
    const [isSaving, setIsSaving] = useState(false);
    const [savingAction, setSavingAction] = useState<SaveAction | null>(null);

    const [showCreateOrganizer, setShowCreateOrganizer] = useState(false);
    const [step, setStep] = useState<Step>(1);
    const steps = [t`Event Details`, t`Date & Location`, t`Ticket`, t`Publish`];

    useEffect(() => {
        if (organizerId) {
            form.setFieldValue('organizer_id', String(organizerId));
        }
    }, [organizerId]);

    useEffect(() => {
        if (organizersQuery.isFetched && organizersQuery.data?.data?.length === 1) {
            form.setFieldValue('organizer_id', String(organizersQuery.data?.data[0].id));
        }
    }, [organizersQuery.isFetched]);

    useEffect(() => {
        if (!coverFile) {
            setCoverPreview(null);
            return;
        }
        const url = URL.createObjectURL(coverFile);
        setCoverPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [coverFile]);

    const goToDateStep = () => {
        const organizerError = form.validateField('organizer_id').hasError;
        const titleError = form.validateField('title').hasError;
        if (!form.values.title?.trim()) {
            form.setFieldError('title', t`Required`);
            return;
        }
        if (!organizerError && !titleError) {
            setStep(2);
        }
    };

    const goToTicketStep = () => {
        if (form.values.type !== EventType.RECURRING && !form.values.start_date) {
            form.setFieldError('start_date', t`Required`);
            return;
        }
        if (!form.validateField('end_date').hasError) {
            setStep(3);
        }
    };

    const goToPublishStep = () => {
        if (ticketPriceType === ProductPriceType.Paid && (ticketPrice === '' || Number(ticketPrice) <= 0)) {
            setTicketPriceError(t`Required`);
            return;
        }
        setTicketPriceError(null);
        setStep(4);
    };

    const skipTicketStep = () => {
        setTicketTitle(defaultTicketTitle);
        setTicketPriceType(ProductPriceType.Free);
        setTicketPrice('');
        setTicketQuantity('');
        setTicketPriceError(null);
        setStep(4);
    };

    const handleCoverDrop = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        if (file.size > MAX_COVER_SIZE) {
            setCoverError(t`File is too large. Maximum size is 5MB.`);
            return;
        }
        setCoverError(null);
        setCoverFile(file);
    };

    const saveLocation = async (eventId: IdParam, organizer: IdParam) => {
        if (locationType === LocationType.Online) {
            if (!onlineLink.trim()) return;
            await eventLocationMutation.mutateAsync({
                eventId,
                eventLocation: {
                    type: LocationType.Online,
                    online_event_connection_details: onlineDetailsHtml(onlineLink.trim()),
                },
            });
            return;
        }

        if (!venueName.trim() && !venuePoint) return;
        const name = venueName.trim() || t`Islamic University of Madinah`;
        const created = await createLocationMutation.mutateAsync({
            organizerId: organizer,
            payload: {
                name,
                structured_address: {venue_name: name, country: 'SA'},
                // The pin's coordinates make the attendee's Google map show this exact point.
                latitude: venuePoint?.lat ?? null,
                longitude: venuePoint?.lng ?? null,
            },
        });
        await eventLocationMutation.mutateAsync({
            eventId,
            eventLocation: {
                type: LocationType.InPerson,
                location_id: Number(created.data.id),
            },
        });
    };

    const saveTicket = async (eventId: IdParam) => {
        const {data: createdEvent} = await eventsClient.findByID(eventId);
        const categoryId = createdEvent.product_categories?.[0]?.id;
        if (!categoryId) {
            throw new Error('Event has no ticket category');
        }

        const isPaid = ticketPriceType === ProductPriceType.Paid;
        const quantity = ticketQuantity === '' ? undefined : Number(ticketQuantity);

        await productMutation.mutateAsync({
            eventId,
            productData: {
                title: ticketTitle.trim() || defaultTicketTitle,
                description: '',
                max_per_order: 1,
                min_per_order: 1,
                sale_start_date: '',
                sale_end_date: '',
                start_collapsed: false,
                hide_before_sale_start_date: false,
                hide_after_sale_end_date: false,
                show_quantity_remaining: false,
                hide_when_sold_out: false,
                is_hidden_without_promo_code: false,
                is_highlighted: false,
                waitlist_enabled: true,
                type: ticketPriceType,
                product_type: ProductType.Ticket,
                tax_and_fee_ids: [],
                addon_product_ids: [],
                is_addon_only: false,
                product_category_id: String(categoryId),
                prices: [{
                    price: isPaid ? Number(ticketPrice) : 0,
                    label: undefined,
                    sale_end_date: undefined,
                    sale_start_date: undefined,
                    initial_quantity_available: quantity,
                }],
            } as Product,
        });
    };

    const handleCreate = async (action: SaveAction) => {
        const publish = action === 'publish';
        if (form.validate().hasErrors) {
            if (form.errors.title || form.errors.organizer_id) {
                setStep(1);
            } else {
                setStep(2);
            }
            return;
        }

        setIsSaving(true);
        setSavingAction(action);

        let eventId: IdParam;
        try {
            const created = await eventMutation.mutateAsync({eventData: form.values});
            eventId = created.data.id;
        } catch (error) {
            errorHandler(form, error);
            setIsSaving(false);
            setSavingAction(null);
            if (form.errors.title || form.errors.description || form.errors.category || form.errors.organizer_id) {
                setStep(1);
            } else if (form.errors.start_date || form.errors.end_date) {
                setStep(2);
            }
            return;
        }

        const extras = await Promise.allSettled([
            saveLocation(eventId, form.values.organizer_id as IdParam),
            saveTicket(eventId),
            coverFile ? coverMutation.mutateAsync({eventId, image: coverFile}) : Promise.resolve(),
        ]);
        const extrasFailed = extras.some((result) => result.status === 'rejected');
        const ticketFailed = extras[1].status === 'rejected';

        if (publish && !ticketFailed) {
            try {
                await statusMutation.mutateAsync({eventId, status: 'LIVE'});
            } catch (error: any) {
                showError(error?.response?.data?.message || t`Event status update failed. Please try again later`);
            }
        }

        if (extrasFailed) {
            showError(t`Some details could not be saved. You can add them from Event Settings.`);
        }

        if (action === 'details') {
            navigate(`/manage/event/${eventId}/settings`);
        } else if (action === 'design') {
            navigate(`/manage/event/${eventId}/homepage-designer`);
        } else {
            navigate(`/manage/event/${eventId}/dashboard?new_event=true`);
        }
    };

    return (
        <Portal>
        <div className={classes.modalOverlay} onClick={onClose}>
            <div className={classes.modalContainer} onClick={(e) => e.stopPropagation()}>
                <button
                    className={classes.closeButton}
                    onClick={onClose}
                    aria-label={t`Close modal`}
                >
                    <IconX size={20}/>
                </button>

                <div className={classes.modalHeader}>
                    <div className={classes.headerContent}>
                        <div className={classes.magicWand}>
                            <IconCalendarEvent size={24} stroke={1.75} color="#ffffff"/>
                        </div>
                        <div>
                            <h1 className={classes.headerTitle}>{t`Create Your Event`}</h1>
                            <p className={classes.headerSubtitle}>{t`Tell us about your event`}</p>
                        </div>
                    </div>
                </div>

                <div className={classes.progress} aria-label={`${step} / ${steps.length}`}>
                    <div className={classes.progressTrack}>
                        <div
                            className={classes.progressFill}
                            style={{width: `${(step / steps.length) * 100}%`}}
                        />
                    </div>
                    <ol className={classes.progressSteps}>
                        {steps.map((label, index) => {
                            const number = index + 1;
                            const state = number < step ? 'done' : number === step ? 'active' : 'upcoming';
                            return (
                                <li key={label} className={classes.progressStep} data-state={state}>
                                    <span className={classes.progressDot}>
                                        {state === 'done' ? <IconCheck size={14} stroke={3}/> : number}
                                    </span>
                                    <span className={classes.progressLabel}>{label}</span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className={classes.modalContent}>
                    <div className={classes.formContainer}>
                        {step === 1 && showCreateOrganizer && (
                            <div className={classes.createOrganizerCard}>
                                <h3 className={classes.createOrganizerHeading}>
                                    <IconUsers size={20}/>
                                    {t`Create Organizer`}
                                </h3>
                                <OrganizerCreateForm
                                    onCancel={() => setShowCreateOrganizer(false)}
                                    onSuccess={(organizer: Organizer) => {
                                        setShowCreateOrganizer(false);
                                        form.setFieldValue('organizer_id', String(organizer.id));
                                    }}/>
                            </div>
                        )}

                        {step === 1 && !showCreateOrganizer && !organizerId && (
                            <>
                                <Select
                                    {...form.getInputProps('organizer_id')}
                                    label={t`Who is organizing this event?`}
                                    required
                                    leftSection={<IconUsers size={18}/>}
                                    placeholder={t`Select organizer`}
                                    data={organizersQuery.data?.data?.map((organizer) => ({
                                        value: String(organizer.id),
                                        label: organizer.name,
                                    }))}
                                    mb={0}
                                />
                                <div className={classes.createOrganizerLink}>
                                    {t`or`} {'  '}
                                    <Anchor href={'#'} variant={'transparent'}
                                            onClick={() => setShowCreateOrganizer(true)}>
                                        {t`create an organizer`}
                                    </Anchor>
                                </div>
                            </>
                        )}

                        <form noValidate onSubmit={(e) => {
                            e.preventDefault();
                            if (step === 1) goToDateStep();
                            else if (step === 2) goToTicketStep();
                            else if (step === 3) goToPublishStep();
                        }}>
                            {step === 1 && (
                                <div className={classes.stepBody} key="details">
                                    <div className={classes.twoColumns}>
                                        <TextInput
                                            {...form.getInputProps('title')}
                                            label={t`Event Name`}
                                            placeholder={t`Summer Music Festival ${new Date().getFullYear()}`}
                                            required
                                            size="md"
                                            leftSection={<IconSparkles size={18}/>}
                                            data-autofocus
                                        />

                                        <Select
                                            {...form.getInputProps('category')}
                                            label={t`Event Category`}
                                            placeholder={t`Select a category`}
                                            data={getEventCategories().map((category) => ({
                                                value: category.id,
                                                label: category.name,
                                            }))}
                                            renderOption={({option}) => {
                                                const Icon = getCategoryIcon(option.value);
                                                return (
                                                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                                        <Icon size={18} stroke={1.5} color="#0f172a"/>
                                                        <span>{option.label}</span>
                                                    </div>
                                                );
                                            }}
                                            leftSection={form.values.category ? (() => {
                                                const SelectedIcon = getCategoryIcon(form.values.category);
                                                return <SelectedIcon size={18} stroke={1.5} color="#0f172a"/>;
                                            })() : null}
                                            size="md"
                                            searchable
                                            comboboxProps={{zIndex: 1100}}
                                        />
                                    </div>

                                    <div className={classes.editorField}>
                                        <Editor
                                            label={t`Event Description`}
                                            description={t`Tell people what to expect at your event`}
                                            value={form.values.description || ''}
                                            onChange={(value) => form.setFieldValue('description', value)}
                                            error={form.errors.description as string}
                                            editorType="simple"
                                            maxLength={2000}
                                            size="md"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className={classes.stepBody} key="dates">
                                    <SegmentedControl
                                        fullWidth
                                        size="sm"
                                        value={form.values.type || EventType.SINGLE}
                                        onChange={(value) => {
                                            form.setFieldValue('type', value as EventType);
                                            if (value === EventType.RECURRING) {
                                                form.setFieldValue('start_date', undefined);
                                                form.setFieldValue('end_date', undefined);
                                            } else {
                                                form.setFieldValue('start_date', defaultStartDate());
                                            }
                                        }}
                                        data={[
                                            {
                                                value: EventType.SINGLE,
                                                label: (
                                                    <span className={classes.segmentLabel}>
                                                        <IconCalendarEvent size={16}/>
                                                        {t`Single Event`}
                                                    </span>
                                                ),
                                            },
                                            {
                                                value: EventType.RECURRING,
                                                label: (
                                                    <span className={classes.segmentLabel}>
                                                        <IconCalendarRepeat size={16}/>
                                                        {t`Recurring Event`}
                                                    </span>
                                                ),
                                            },
                                        ]}
                                    />

                                    {form.values.type === EventType.RECURRING ? (
                                        <Callout
                                            icon={<IconCalendarRepeat size={22} className={classes.recurringNoticeIcon}/>}
                                            title={t`Occurrences can be configured after creation`}
                                            children={t`You'll be able to set up dates, schedules, and recurrence rules in the next step.`}
                                            className={classes.recurringNotice}
                                        />
                                    ) : (
                                        <div className={classes.dateTimeGrid}>
                                            <DateTimePicker
                                                label={t`Start Date & Time`}
                                                {...form.getInputProps('start_date')}
                                                required
                                                size="md"
                                                placeholder={t`Select start date and time`}
                                                valueFormat={getDateTimePickerFormat()}
                                                clearable
                                                dropdownType="modal"
                                                modalProps={{zIndex: 1100}}
                                                timePickerProps={{
                                                    format: '12h',
                                                    withDropdown: true,
                                                }}
                                                onChange={(value) => {
                                                    form.setFieldValue('start_date', value ?? undefined);

                                                    if (form.values.end_date && value && dayjs(form.values.end_date).isBefore(dayjs(value))) {
                                                        form.setFieldValue('end_date', dayjs(value).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));
                                                    }
                                                }}
                                            />
                                            <DateTimePicker
                                                label={t`End Date & Time (optional)`}
                                                {...form.getInputProps('end_date')}
                                                size="md"
                                                placeholder={t`Select end date and time`}
                                                valueFormat={getDateTimePickerFormat()}
                                                clearable
                                                dropdownType="modal"
                                                modalProps={{zIndex: 1100}}
                                                timePickerProps={{
                                                    format: '12h',
                                                    withDropdown: true,
                                                }}
                                                minDate={form.values.start_date ?? undefined}
                                                onFocus={() => {
                                                    if (!form.values.end_date && form.values.start_date) {
                                                        form.setFieldValue('end_date', dayjs(form.values.start_date).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'));
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className={classes.sectionDivider}/>

                                    <div className={classes.fieldGroup}>
                                        <div className={classes.fieldGroupHeader}>
                                            <span className={classes.fieldGroupLabel}>{t`Location (optional)`}</span>
                                            <SegmentedControl
                                                size="xs"
                                                value={locationType}
                                                onChange={(value) => setLocationType(value as LocationType)}
                                                data={[
                                                    {label: t`In Person`, value: LocationType.InPerson},
                                                    {label: t`Online`, value: LocationType.Online},
                                                ]}
                                            />
                                        </div>
                                        {locationType === LocationType.InPerson ? (
                                            <div className={classes.venueRow}>
                                                <TextInput
                                                    value={venueName}
                                                    onChange={(e) => setVenueName(e.currentTarget.value)}
                                                    placeholder={t`Venue Name`}
                                                    aria-label={t`Venue Name`}
                                                    size="md"
                                                    maxLength={255}
                                                    leftSection={<IconMapPin size={18}/>}
                                                    className={classes.venueInput}
                                                />
                                                <Button
                                                    type="button"
                                                    size="md"
                                                    variant={venuePoint ? 'light' : 'default'}
                                                    color={venuePoint ? 'green' : undefined}
                                                    leftSection={venuePoint
                                                        ? <IconMapPinFilled size={18}/>
                                                        : <IconMapPin size={18}/>}
                                                    onClick={() => setMapOpened(true)}
                                                    className={classes.mapButton}
                                                >
                                                    {venuePoint ? t`Pinned on map` : t`Pin on map`}
                                                </Button>
                                            </div>
                                        ) : (
                                            <TextInput
                                                value={onlineLink}
                                                onChange={(e) => setOnlineLink(e.currentTarget.value)}
                                                placeholder="https://"
                                                aria-label={t`Meeting link`}
                                                size="md"
                                                dir="ltr"
                                                leftSection={<IconLink size={18}/>}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className={classes.stepBody} key="ticket">
                                    <TextInput
                                        value={ticketTitle}
                                        onChange={(e) => setTicketTitle(e.currentTarget.value)}
                                        label={t`Ticket Name`}
                                        size="md"
                                        maxLength={255}
                                        leftSection={<IconTicket size={18}/>}
                                        data-autofocus
                                    />

                                    <SegmentedControl
                                        fullWidth
                                        size="sm"
                                        value={ticketPriceType}
                                        onChange={(value) => {
                                            setTicketPriceType(value as ProductPriceType);
                                            setTicketPriceError(null);
                                        }}
                                        data={[
                                            {label: t`Free`, value: ProductPriceType.Free},
                                            {label: t`Paid`, value: ProductPriceType.Paid},
                                        ]}
                                    />

                                    <div className={ticketPriceType === ProductPriceType.Paid ? classes.twoColumns : undefined}>
                                        {ticketPriceType === ProductPriceType.Paid && (
                                            <NumberInput
                                                value={ticketPrice}
                                                onChange={(value) => {
                                                    setTicketPrice(value);
                                                    setTicketPriceError(null);
                                                }}
                                                label={t`Price`}
                                                required
                                                min={0}
                                                decimalScale={2}
                                                fixedDecimalScale
                                                size="md"
                                                placeholder="0.00"
                                                error={ticketPriceError}
                                            />
                                        )}
                                        <NumberInput
                                            value={ticketQuantity}
                                            onChange={setTicketQuantity}
                                            label={t`Number of Seats`}
                                            min={1}
                                            allowDecimal={false}
                                            size="md"
                                            placeholder={t`Unlimited`}
                                        />
                                    </div>

                                    <p className={classes.stepHint}>
                                        {t`If you skip, a free ticket with unlimited seats will be created.`}
                                    </p>
                                </div>
                            )}

                            {step === 4 && (
                                <div className={classes.stepBody} key="publish">
                                    <div className={classes.fieldGroup}>
                                        <span className={classes.fieldGroupLabel}>{t`Cover Image (optional)`}</span>
                                        {coverPreview ? (
                                            <div className={classes.coverPreview}>
                                                <img src={coverPreview} alt=""/>
                                                <Button
                                                    size="xs"
                                                    variant="white"
                                                    color="red"
                                                    className={classes.coverRemove}
                                                    leftSection={<IconX size={14}/>}
                                                    onClick={() => setCoverFile(null)}
                                                >
                                                    {t`Remove`}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropzone
                                                onDrop={handleCoverDrop}
                                                onReject={() => setCoverError(t`File is too large. Maximum size is 5MB.`)}
                                                accept={IMAGE_MIME_TYPE}
                                                maxSize={MAX_COVER_SIZE}
                                                multiple={false}
                                                className={classes.coverDropzone}
                                            >
                                                <div className={classes.coverDropzoneInner}>
                                                    <IconPhoto size={32} stroke={1.5}/>
                                                    <span>{t`Click or drag an image here`}</span>
                                                    <small>{t`We recommend dimensions of 1950px by 650px, a ratio of 3:1, and a maximum file size of 5MB`}</small>
                                                </div>
                                            </Dropzone>
                                        )}
                                        {coverError && <span className={classes.fieldError}>{coverError}</span>}
                                        {!coverFile && (
                                            <span className={classes.stepHint}>
                                                {t`If you skip this, a default cover will be used.`}
                                            </span>
                                        )}
                                    </div>

                                    <div className={classes.moreOptions}>
                                        <span className={classes.moreOptionsHint}>
                                            {t`Want to add more? We'll save the event as a draft and take you there.`}
                                        </span>
                                        <div className={classes.moreOptionsButtons}>
                                            <Button
                                                type="button"
                                                variant="default"
                                                leftSection={<IconListDetails size={18}/>}
                                                loading={savingAction === 'details'}
                                                disabled={isSaving && savingAction !== 'details'}
                                                onClick={() => handleCreate('details')}
                                            >
                                                {t`More event details`}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                leftSection={<IconPalette size={18}/>}
                                                loading={savingAction === 'design'}
                                                disabled={isSaving && savingAction !== 'design'}
                                                onClick={() => handleCreate('design')}
                                            >
                                                {t`Images & design`}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={classes.actions}>
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="lg"
                                        className={classes.backButton}
                                        disabled={isSaving}
                                        onClick={() => setStep((step - 1) as Step)}
                                        leftSection={<IconArrowRight size={18} className={classes.directionalIcon}/>}
                                    >
                                        {t`Go back`}
                                    </Button>
                                )}

                                {step === 3 && (
                                    <Button
                                        type="button"
                                        variant="subtle"
                                        size="lg"
                                        className={classes.skipButton}
                                        onClick={skipTicketStep}
                                    >
                                        {t`Skip`}
                                    </Button>
                                )}

                                {step < 4 ? (
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className={classes.createButton}
                                        rightSection={<IconArrowLeft size={18} className={classes.directionalIcon}/>}
                                    >
                                        {t`Continue`}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="lg"
                                            className={classes.draftButton}
                                            loading={savingAction === 'draft'}
                                            disabled={isSaving && savingAction !== 'draft'}
                                            onClick={() => handleCreate('draft')}
                                        >
                                            {t`Save as Draft`}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="lg"
                                            className={classes.createButton}
                                            loading={savingAction === 'publish'}
                                            disabled={isSaving && savingAction !== 'publish'}
                                            onClick={() => handleCreate('publish')}
                                            leftSection={<IconCalendarEvent size={20}/>}
                                        >
                                            {t`Publish Event`}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            opened={mapOpened}
            onClose={() => setMapOpened(false)}
            title={t`Venue Location Map`}
            size="lg"
            zIndex={1200}
            centered
        >
            <VenueMapPicker point={venuePoint} onSelect={setVenuePoint}/>
            <div className={classes.mapModalActions}>
                {venuePoint && (
                    <Button variant="subtle" color="red" onClick={() => setVenuePoint(null)}>
                        {t`Remove`}
                    </Button>
                )}
                <Button onClick={() => setMapOpened(false)} disabled={!venuePoint}>
                    {t`Done`}
                </Button>
            </div>
        </Modal>
        </Portal>
    );
}

import {SAUDI_TIMEZONE} from "../../../constants/institution.ts";
import {useEffect, useState} from "react";
import {t} from "@lingui/macro";
import {useIULanguage} from "../../../context/IULanguageContext";
import {formatDateWithLocale, isValidDate} from "../../../utilites/dates.ts";
import {Link} from "react-router";
import SelectProducts from "../../routes/product-widget/SelectProducts";
import {EventDocumentHead} from "../../common/EventDocumentHead";
import {eventCoverImage} from "../../../utilites/urlHelper.ts";
import {Event, EventOccurrence, EventSettings} from "../../../types.ts";
import {EventNotAvailable} from "./EventNotAvailable";
import {
    IconArrowLeft,
    IconArrowRight,
    IconCalendar,
    IconCertificate,
    IconClock,
    IconExternalLink,
    IconMapPin,
    IconReceipt,
    IconTag,
    IconUsers,
} from "@tabler/icons-react";
import {Modal} from "@mantine/core";
import {IUNavbar} from "../../iu/IUNavbar";
import {IUFooter} from "../../iu/IUFooter";
import {IUHero} from "../../iu/IUHero";
import {ContactOrganizerModal} from "../../common/ContactOrganizerModal";
import {buildEventLocationDisplay, getEventLocationDisplay, summariseEventLocations} from "../../../utilites/effectiveLocation.ts";
import {StatusToggle} from "../../common/StatusToggle";
import {useOrganizerTrackingPixels} from "../../../hooks/useOrganizerTrackingPixels";
import {trackPixelEvent, hasActivePixels} from "../../../utilites/trackingPixels";
import {formatCurrency} from "../../../utilites/currency.ts";
import {UserGeneratedContent} from "../../common/UserGeneratedContent";
import {IU_COLORS} from "../../../constants/iuTheme.ts";
import "../../../styles/iu/common.css";
import "../../../styles/iu/event-details.css";

interface EventHomepageProps {
    event?: Event;
    preview?: boolean;
    promoCodeValid?: boolean;
    promoCode?: string;
    initialOccurrenceId?: number | null;
}

export const EventHomepage = ({...loaderData}: EventHomepageProps) => {
    const {event, promoCodeValid, promoCode, initialOccurrenceId, preview = false} = loaderData;
    const {dir, locale, getCategoryLabel} = useIULanguage();
    const BackArrow = dir === "rtl" ? IconArrowRight : IconArrowLeft;
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [ticketsModalOpen, setTicketsModalOpen] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrence | undefined>();
    const {pixelsReady} = useOrganizerTrackingPixels(
        preview ? undefined : event?.organizer?.settings?.tracking_pixels
    );

    useEffect(() => {
        if (!preview && event && pixelsReady && hasActivePixels()) {
            trackPixelEvent({
                eventName: 'ViewContent',
                contentName: event.title,
                contentId: event.id,
            });
        }
    }, [event?.id, pixelsReady, preview]);

    if (!event) {
        return <EventNotAvailable/>;
    }

    const coverImageData = eventCoverImage(event);
    const coverImage = coverImageData?.url || null;
    const organizer = event.organizer;
    const locationSummary = summariseEventLocations(event);
    const location = selectedOccurrence
        ? getEventLocationDisplay(event, selectedOccurrence)
        : locationSummary.kind === 'single'
            ? buildEventLocationDisplay(event, locationSummary.eventLocation, locationSummary.isEventDefault)
            : null;
    const venue = location?.venueName ?? location?.short ?? location?.full;
    const mapQuery = location?.full ?? venue;
    const mapUrl = location?.mapsUrl ?? (mapQuery ? `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}` : null);
    const locationLabel = location?.isOnline ? t`Online` : venue
        ?? (locationSummary.kind === 'varied' ? t`Varies by date` : t`Not specified`);
    const formatLabel = location ? (location.isOnline ? t`Online` : t`In person`) : locationLabel;

    const products = event.products?.length ? event.products : event.product_categories?.flatMap(category => category.products ?? []) ?? [];
    const prices = products
        .filter(product => product.is_available !== false && !product.is_sold_out)
        .flatMap(product => product.prices?.length
            ? product.prices.filter(price => price.is_available !== false && !price.is_sold_out).map(price => Number(price.price))
            : product.price == null ? [] : [Number(product.price)])
        .filter(Number.isFinite);
    const minimum = prices.length ? Math.min(...prices) : null;
    const priceLabel = minimum === null
        ? t`Not specified`
        : prices.every(price => price === 0) ? t`Free` : t`From ${formatCurrency(minimum, event.currency, locale)}`;

    const start = selectedOccurrence?.start_date ?? event.next_occurrence_start_date ?? event.start_date;
    const formattedStart = start && isValidDate(start) ? start : null;
    const isCertificateEligible = Boolean(event.settings?.is_certificate_eligible ?? event.is_certificate_eligible ?? false);
    const details = event.settings;
    const legacyDetails = event as Event & Partial<EventSettings>;
    const rawHighlights = details?.event_highlights || legacyDetails.event_highlights;
    const topics = rawHighlights?.split('\n').map(topic => topic.trim()).filter(Boolean) ?? [];

    return (
        <div className="iu-page iu-event-details-page" dir={dir} inert={preview || undefined}>
            {!preview && event?.status && event?.id && (
                <StatusToggle
                    entityType="event"
                    entityId={event.id}
                    currentStatus={event.status as 'DRAFT' | 'LIVE' | 'PENDING_MANUAL_REVIEW'}
                    entityName={event.title}
                    onSuccess={() => {
                        if (typeof window !== "undefined") {
                            setTimeout(() => window.location.reload(), 1000);
                        }
                    }}
                />
            )}

            {event && <EventDocumentHead event={event}/>}

            {/* IU Navbar */}
            <IUNavbar />

            {/* IU Green Hero Backdrop (Pure green background without content) */}
            <IUHero />

            {/* Main Page Content */}
            <main className="iu-event-main-wrapper">
                <div className="iu-event-card-container">
                    
                    {/* Top Banner Section (Full Event Cover Image without dark blue background) */}
                    <section className="iu-event-banner-header">
                        {/* Date Badge (Top Right) */}
                        {formattedStart && <div className="iu-event-top-date-badge">
                            <IconCalendar size={18} className="icon" />
                            <span className="day">{formatDateWithLocale(formattedStart, "dayOfMonth", SAUDI_TIMEZONE, locale)}</span>
                            <span className="month">{formatDateWithLocale(formattedStart, "monthShort", SAUDI_TIMEZONE, locale)}</span>
                        </div>}

                        {/* Full Cover Image */}
                        {coverImage ? (
                            <img
                                src={coverImage}
                                alt={event.title}
                                className="iu-event-banner-img"
                            />
                        ) : (
                            <div className="iu-banner-fallback-box">
                                <h2 className="iu-banner-fallback-title">
                                    {event.title}
                                </h2>
                            </div>
                        )}
                    </section>

                    {/* White Card Body */}
                    <div className="iu-event-white-body">
                        <div className="iu-event-content-grid">
                            
                            {/* Main Details Column (Right in RTL) */}
                            <div className="iu-event-main-col">
                                <h1 className="iu-event-main-title">{event.title}</h1>
                                
                                {/* Meta Badges Row */}
                                <div className="iu-event-pills-row">
                                    <span className="iu-meta-pill">{priceLabel}</span>
                                    <span className="iu-meta-pill">{formatLabel}</span>
                                    {isCertificateEligible && (
                                        <span className="iu-meta-pill iu-meta-pill-cert">
                                            {t`Attendance certificate`}
                                        </span>
                                    )}
                                </div>

                                {/* About Section */}
                                <h3 className="iu-section-title">{t`About the event`}</h3>
                                {event.description ? (
                                    <UserGeneratedContent
                                        className="iu-event-desc"
                                        html={event.description}
                                    />
                                ) : <p className="iu-event-desc">{t`No description provided`}</p>}

                                {/* Info Cards Grid (Matching screenshot layout) */}
                                <div className="iu-info-cards-3col">
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">{t`Event time`}</span>
                                            <IconClock size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{formattedStart ? formatDateWithLocale(formattedStart, "fullDateTime", SAUDI_TIMEZONE, locale) : t`Not specified`}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">{t`Location`}</span>
                                            <IconMapPin size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{locationLabel}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">{t`Event category`}</span>
                                            <IconTag size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{event.category ? getCategoryLabel(event.category) : t`Not specified`}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">{t`Entry requirements`}</span>
                                            <IconReceipt size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{details?.requirements_info || legacyDetails.requirements_info || t`Not specified`}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">{t`Intended audience`}</span>
                                            <IconUsers size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{details?.target_audience || legacyDetails.target_audience || t`Not specified`}</p>
                                    </div>
                                    {isCertificateEligible && (
                                        <div className="iu-card-item">
                                            <div className="iu-card-header">
                                                <span className="iu-card-title">{t`Attendance certificate`}</span>
                                                <IconCertificate size={18} className="iu-card-icon" />
                                            </div>
                                            <p className="iu-card-value">{details?.certificate_info || legacyDetails.certificate_info || t`Available`}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Event Highlights / Topics */}
                                {topics.length > 0 && <h3 className="iu-section-title">{t`Event highlights`}</h3>}
                                <div className="iu-topics-list">
                                    {topics.map((topic: string, idx: number) => (
                                        <div key={idx} className="iu-topic-box">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar Column (Left in RTL) */}
                            <aside className="iu-event-sidebar-col">
                                {/* Back to events text link (Corner left) */}
                                <div className="iu-back-link-wrapper">
                                    <Link to="/events" className="iu-back-text-link">
                                        <BackArrow className="iu-back-arrow" size={16} aria-hidden />
                                        <span>{t`Back to events`}</span>
                                    </Link>
                                </div>

                                {/* Price banner */}
                                <div className="iu-sidebar-price-text">
                                    {priceLabel}
                                </div>

                                {/* Register Button */}
                                <button
                                    onClick={() => setTicketsModalOpen(true)}
                                    className="iu-btn-register-main"
                                >
                                    {t`Register now`}
                                </button>

                                {/* Map Card */}
                                {mapUrl && mapQuery && !location?.isOnline && <div className="iu-sidebar-map-wrapper">
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="iu-map-open-link"
                                    >
                                        {t`Open in Maps`} <IconExternalLink size={11} />
                                    </a>
                                    {!preview && <iframe
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                        title={t`Event location map`}
                                        loading="lazy"
                                    />}
                                </div>}
                            </aside>

                        </div>
                    </div>

                </div>
            </main>

            {/* Registration / Tickets Modal */}
            <Modal
                opened={!preview && ticketsModalOpen}
                onClose={() => setTicketsModalOpen(false)}
                title={t`Event registration`}
                size="lg"
                centered
                radius="lg"
                styles={{
                    header: {
                        fontWeight: 700,
                        borderBottom: "1px solid #f1f5f9",
                        paddingBottom: 12,
                    },
                    body: {
                        paddingTop: 16,
                    }
                }}
            >
                <div id="tickets">
                    <SelectProducts
                        colors={{
                            background: "transparent",
                            primary: IU_COLORS.greenPrimary,
                            primaryText: "#0f172a",
                            secondary: IU_COLORS.greenSecondary,
                            secondaryText: "#ffffff",
                            bodyBackground: "#ffffff",
                        }}
                        continueButtonText={t`Register for the event`}
                        padding={"0px"}
                        event={event}
                        promoCodeValid={promoCodeValid}
                        promoCode={promoCode}
                        showPoweredBy={false}
                        requireAttendeeAuth
                        widgetMode={preview ? "preview" : undefined}
                        initialOccurrenceId={initialOccurrenceId}
                        onSelectedOccurrenceChange={setSelectedOccurrence}
                    />
                </div>
            </Modal>

            {/* Contact Modal */}
            {!preview && organizer && <ContactOrganizerModal
                opened={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                organizer={organizer}
            />}

            {/* IU Footer */}
            <IUFooter />
        </div>
    );
};

export default EventHomepage;

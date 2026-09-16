import {useCallback, useEffect, useState} from "react";
import {Link} from "react-router";
import SelectProducts from "../../routes/product-widget/SelectProducts";
import {EventDocumentHead} from "../../common/EventDocumentHead";
import {eventCoverImage} from "../../../utilites/urlHelper.ts";
import {Event, EventOccurrence} from "../../../types.ts";
import {EventNotAvailable} from "./EventNotAvailable";
import {
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
import {buildEventLocationDisplay, summariseEventLocations} from "../../../utilites/effectiveLocation.ts";
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
    promoCodeValid?: boolean;
    promoCode?: string;
    initialOccurrenceId?: number | null;
}

export const EventHomepage = ({...loaderData}: EventHomepageProps) => {
    const {event, promoCodeValid, promoCode, initialOccurrenceId} = loaderData;
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [ticketsModalOpen, setTicketsModalOpen] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrence | undefined>();
    const [selectedCart, setSelectedCart] = useState({quantity: 0, total: 0});
    const [continueButtonNode, setContinueButtonNode] = useState<HTMLButtonElement | null>(null);

    const handleCartChange = useCallback(
        (cart: {quantity: number; total: number}) => setSelectedCart(cart),
        [],
    );

    const {pixelsReady} = useOrganizerTrackingPixels(
        event?.organizer?.settings?.tracking_pixels
    );

    useEffect(() => {
        if (event && pixelsReady && hasActivePixels()) {
            trackPixelEvent({
                eventName: 'ViewContent',
                contentName: event.title,
                contentId: event.id,
            });
        }
    }, [event?.id, pixelsReady]);

    if (!event) {
        return <EventNotAvailable/>;
    }

    const coverImageData = eventCoverImage(event);
    const coverImage = coverImageData?.url || null;
    const organizer = event.organizer;
    const locationSummary = summariseEventLocations(event);
    const singleLocationDisplay = locationSummary.kind === 'single'
        ? buildEventLocationDisplay(event, locationSummary.eventLocation, locationSummary.isEventDefault)
        : null;
    const isOnlineEvent = singleLocationDisplay?.isOnline === true;
    const venueName = singleLocationDisplay?.venueName ?? (isOnlineEvent ? "عبر الإنترنت" : (event.event_location?.location?.name || "الجامعة الإسلامية بالمدينة المنورة"));
    const mapUrl = singleLocationDisplay?.mapsUrl ?? `https://maps.google.com/?q=${encodeURIComponent(venueName + " المدينة المنورة")}`;

    const products = event.products || event.product_categories?.flatMap(c => c.products || []) || [];
    
    // Price calculation
    let isFree = true;
    let minPrice: number | null = null;
    if (products.length > 0) {
        const prices = products.map(p => Number(p.price || 0));
        isFree = prices.every(p => p === 0);
        minPrice = Math.min(...prices);
    }

    // Date calculations for Badge
    const startDateObj = event.start_date ? new Date(event.start_date) : null;
    const heroDay = startDateObj ? startDateObj.getDate() : "16";
    const heroMonth = startDateObj ? startDateObj.toLocaleDateString("ar-SA", {month: "long"}) : "سبتمبر";
    const heroTime = startDateObj ? startDateObj.toLocaleTimeString("ar-SA", {hour: "2-digit", minute: "2-digit"}) : "09:00 م";

    // Timing Format badge (e.g. مسائي or صباحي)
    const isEvening = startDateObj ? startDateObj.getHours() >= 12 : true;
    const timingBadgeText = isEvening ? "مسائي" : "صباحي";

    const isCertificateEligible = Boolean(event.settings?.is_certificate_eligible ?? event.is_certificate_eligible ?? false);

    // Topics list
    const defaultHighlights = [
        "جلسات علمية ومحاضرات متخصصة",
        "نقاشات مفتوحة مع الباحثين والخبراء",
        "فرص للتعارف وبناء شراكات بحثية",
        "مساحات نقاش قصيرة بعد كل محور"
    ];
    const rawHighlights = event.settings?.event_highlights || (event as any).event_highlights;
    const topics = rawHighlights
        ? rawHighlights.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : defaultHighlights;

    return (
        <div className="iu-page iu-event-details-page" dir="rtl">
            {event?.status && event?.id && (
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
                        <div className="iu-event-top-date-badge">
                            <IconCalendar size={18} className="icon" />
                            <span className="day">{heroDay}</span>
                            <span className="month">{heroMonth}</span>
                        </div>

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
                                    <span className="iu-meta-pill">{timingBadgeText}</span>
                                    <span className="iu-meta-pill">
                                        {isFree ? "فعالية مجانية" : `مدفوعة (${formatCurrency(minPrice || 0, event.currency)})`}
                                    </span>
                                    <span className="iu-meta-pill">
                                        {isOnlineEvent ? "عن بُعد" : "حضوري"}
                                    </span>
                                    {isCertificateEligible && (
                                        <span className="iu-meta-pill iu-meta-pill-cert">
                                            شهادة حضور معتمدة
                                        </span>
                                    )}
                                </div>

                                {/* About Section */}
                                <h3 className="iu-section-title">عن الفعالية</h3>
                                {event.description ? (
                                    <UserGeneratedContent
                                        className="iu-event-desc"
                                        html={event.description}
                                    />
                                ) : (
                                    <div className="iu-event-desc">
                                        <p>
                                            مؤتمر علمي دولي يناقش أحدث الأبحاث في اللغة العربية والعلوم التطبيقية، مع محاور متخصصة وجلسات معرفية متنوعة.
                                        </p>
                                        <p>
                                            يضم المؤتمر جلسات علمية ومحاور متخصصة وفرصاً للتواصل مع الباحثين والخبراء. يُنصح بالاطلاع على محاور المؤتمر وتجهيز أسئلتك لضمان أقصى استفادة من النقاشات.
                                        </p>
                                    </div>
                                )}

                                {/* Info Cards Grid (Matching screenshot layout) */}
                                <div className="iu-info-cards-3col">
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">توقيت الفعالية</span>
                                            <IconClock size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{heroDay} {heroMonth} - {heroTime}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">الموقع</span>
                                            <IconMapPin size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{isOnlineEvent ? "عبر الإنترنت" : venueName}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">تصنيف الفعالية</span>
                                            <IconTag size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{(event as any).format || event.category || "WORKSHOP"}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">شروط القبول</span>
                                            <IconReceipt size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{event.settings?.requirements_info || (event as any).requirements_info || "مخصصة للباحثين وأعضاء هيئة التدريس"}</p>
                                    </div>
                                    <div className="iu-card-item">
                                        <div className="iu-card-header">
                                            <span className="iu-card-title">الفئة المستهدفة</span>
                                            <IconUsers size={18} className="iu-card-icon" />
                                        </div>
                                        <p className="iu-card-value">{event.settings?.target_audience || (event as any).target_audience || "أعضاء هيئة التدريس والباحثون"}</p>
                                    </div>
                                    {isCertificateEligible && (
                                        <div className="iu-card-item">
                                            <div className="iu-card-header">
                                                <span className="iu-card-title">شهادة حضور</span>
                                                <IconCertificate size={18} className="iu-card-icon" />
                                            </div>
                                            <p className="iu-card-value">{event.settings?.certificate_info || (event as any).certificate_info || "متاحة"}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Event Highlights / Topics */}
                                <h3 className="iu-section-title">محاور المؤتمر</h3>
                                <p className="iu-topics-intro">
                                    يناقش المؤتمر موضوعات بحثية وتطبيقية تجمع بين اللغة العربية والعلوم التطبيقية، مع جلسات معرفية ومحاور متخصصة وفرص للتواصل الأكاديمي.
                                </p>
                                <p className="iu-topics-subintro">
                                    هذا محتوى تجريبي لإظهار شكل الصفحة عند إضافة تفاصيل أكثر، يمكن لاحقاً إدراج جدول الجلسات، أسماء المتحدثين، أو روابط ملخصات الأبحاث.
                                </p>
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
                                    <Link to="/events" className="iu-back-text-link" dir="rtl">
                                        <span>الرجوع للفعاليات</span>
                                        <span className="iu-back-arrow">←</span>
                                    </Link>
                                </div>

                                {/* Price banner */}
                                <div className="iu-sidebar-price-text">
                                    {isFree ? "السعر: مجاني" : `السعر: ${formatCurrency(minPrice || 0, event.currency)}`}
                                </div>

                                {/* Register Button */}
                                <button
                                    onClick={() => setTicketsModalOpen(true)}
                                    className="iu-btn-register-main"
                                >
                                    سجل الآن
                                </button>

                                {/* Map Card */}
                                <div className="iu-sidebar-map-wrapper">
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="iu-map-open-link"
                                    >
                                        Open in Maps <IconExternalLink size={11} />
                                    </a>
                                    <iframe
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(isOnlineEvent ? "الجامعة الإسلامية بالمدينة المنورة" : venueName + " المدينة المنورة")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                        title="Event Location Map"
                                        loading="lazy"
                                    />
                                </div>
                            </aside>

                        </div>
                    </div>

                </div>
            </main>

            {/* Registration / Tickets Modal */}
            <Modal
                opened={ticketsModalOpen}
                onClose={() => setTicketsModalOpen(false)}
                title="تسجيل وحجز التذاكر"
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
                        continueButtonText="التسجيل في الفعالية"
                        padding={"0px"}
                        event={event}
                        promoCodeValid={promoCodeValid}
                        promoCode={promoCode}
                        showPoweredBy={false}
                        initialOccurrenceId={initialOccurrenceId}
                        onSelectedOccurrenceChange={setSelectedOccurrence}
                        onCartChange={handleCartChange}
                        continueButtonRef={setContinueButtonNode}
                    />
                </div>
            </Modal>

            {/* Contact Modal */}
            <ContactOrganizerModal
                opened={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                organizer={organizer}
            />

            {/* IU Footer */}
            <IUFooter />
        </div>
    );
};

export default EventHomepage;

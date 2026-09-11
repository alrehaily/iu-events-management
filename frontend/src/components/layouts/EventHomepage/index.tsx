import {useCallback, useEffect, useRef, useState} from "react";
import {Link} from "react-router";
import SelectProducts from "../../routes/product-widget/SelectProducts";
import {EventDocumentHead} from "../../common/EventDocumentHead";
import {eventCoverImage, imageUrl} from "../../../utilites/urlHelper.ts";
import {Event, EventOccurrence} from "../../../types.ts";
import {EventNotAvailable} from "./EventNotAvailable";
import {
    IconCalendar,
    IconMail,
    IconMapPin,
    IconTicket
} from "@tabler/icons-react";
import {IUNavbar} from "../../iu/IUNavbar";
import {IUFooter} from "../../iu/IUFooter";
import {ContactOrganizerModal} from "../../common/ContactOrganizerModal";
import {buildEventLocationDisplay, summariseEventLocations} from "../../../utilites/effectiveLocation.ts";
import {StatusToggle} from "../../common/StatusToggle";
import {useOrganizerTrackingPixels} from "../../../hooks/useOrganizerTrackingPixels";
import {trackPixelEvent, hasActivePixels} from "../../../utilites/trackingPixels";
import {EventDateRange} from "../../common/EventDateRange";
import {formatCurrency} from "../../../utilites/currency.ts";
import {UserGeneratedContent} from "../../common/UserGeneratedContent";
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
    const [selectedOccurrence, setSelectedOccurrence] = useState<EventOccurrence | undefined>();
    const [selectedCart, setSelectedCart] = useState({quantity: 0, total: 0});
    const [continueButtonNode, setContinueButtonNode] = useState<HTMLButtonElement | null>(null);
    const [continueButtonInView, setContinueButtonInView] = useState(false);
    const ticketsSectionRef = useRef<HTMLDivElement>(null);

    const handleCartChange = useCallback(
        (cart: {quantity: number; total: number}) => setSelectedCart(cart),
        [],
    );

    useEffect(() => {
        if (!continueButtonNode) {
            setContinueButtonInView(false);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setContinueButtonInView(entry.isIntersecting),
            {threshold: 0.5},
        );
        observer.observe(continueButtonNode);

        return () => observer.disconnect();
    }, [continueButtonNode]);

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
    const coverImage = coverImageData?.url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80";
    const organizer = event.organizer!;
    const organizerLogo = imageUrl('ORGANIZER_LOGO', organizer?.images);
    const locationSummary = summariseEventLocations(event);
    const singleLocationDisplay = locationSummary.kind === 'single'
        ? buildEventLocationDisplay(event, locationSummary.eventLocation, locationSummary.isEventDefault)
        : null;
    const isOnlineEvent = singleLocationDisplay?.isOnline === true;
    const venueName = singleLocationDisplay?.venueName ?? (isOnlineEvent ? "عبر الإنترنت" : (event.event_location?.location?.name || "مقر الفعالية"));
    const formattedAddress = singleLocationDisplay?.full ?? singleLocationDisplay?.short ?? null;
    const mapUrl = singleLocationDisplay?.mapsUrl ?? null;

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
    const heroDay = startDateObj ? startDateObj.getDate() : "--";
    const heroMonth = startDateObj ? startDateObj.toLocaleDateString("ar-SA", {month: "short"}) : "قريباً";
    const heroTime = startDateObj ? startDateObj.toLocaleTimeString("ar-SA", {hour: "2-digit", minute: "2-digit"}) : "يُحدد لاحقاً";

    const continueButtonText = event.settings?.continue_button_text || "متابعة الحجز";
    const showFloatingCheckoutButton = selectedCart.quantity > 0 && !!continueButtonNode && !continueButtonInView;

    const eventTypeLabel = (event as any).format || (isOnlineEvent ? "عن بُعد" : "دورة / فعالية");

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

            <main className="iu-main">
                {/* Hero Section */}
                <section className="iu-event-hero">
                    <div className="container">
                        <div className="iu-event-heroGrid">
                            <div className="iu-event-heroText">
                                <span className="iu-event-typeBadge">
                                    {eventTypeLabel}
                                </span>
                                <h1>{event.title}</h1>
                                <p>
                                    {event.description
                                        ? event.description.replace(/<[^>]*>/g, '').slice(0, 160) + '...'
                                        : "فعالية مميزة تنظمها الجامعة الإسلامية بالمدينة المنورة لتعزيز المعرفة وتطوير المهارات."}
                                </p>
                                <div className="iu-event-heroMeta">
                                    <span>
                                        <IconCalendar size={16} />
                                        <EventDateRange event={event} occurrence={selectedOccurrence}/>
                                    </span>
                                    <span>
                                        <IconMapPin size={16} />
                                        {isOnlineEvent ? "عبر الإنترنت" : venueName}
                                    </span>
                                </div>
                            </div>

                            <div className="iu-event-heroImage">
                                <img
                                    src={coverImage}
                                    alt={event.title}
                                />
                                <div className="iu-event-dateBadge">
                                    <span className="day">{heroDay}</span>
                                    <span className="month">{heroMonth}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Event Details Section */}
                <section className="iu-event-detailsSection">
                    <div className="container">
                        <div className="iu-event-detailsGrid">
                            {/* Main Details Column */}
                            <div className="iu-event-detailsMain">
                                <div className="iu-event-summaryTop">
                                    <Link to="/events" className="btn outline backBtn" style={{padding: "8px 18px", fontSize: 13, textDecoration: "none"}}>
                                        ← رجوع للفعاليات
                                    </Link>
                                    <div className="iu-event-logoBadge">
                                        IU
                                    </div>
                                </div>

                                <h2 className="iu-event-summaryTitle">{event.title}</h2>
                                <div className="iu-event-meta">
                                    <span className="iu-meta-pill">{isFree ? "فعالية مجانية" : `مدفوعة (${formatCurrency(minPrice || 0, event.currency)})`}</span>
                                    <span className="iu-meta-pill">{isOnlineEvent ? "عن بُعد" : "حضورياً بالجامعة"}</span>
                                    <span className="iu-meta-pill">متاح لجميع الطلاب والمنسوبين</span>
                                    {(event as any).is_certificate_eligible && (
                                        <span className="iu-meta-pill" style={{background: "#e8f5e9", color: "#2e7d32", borderColor: "#a5d6a7"}}>
                                            شهادة حضور معتمدة
                                        </span>
                                    )}
                                </div>

                                <h3 className="iu-event-sectionTitle">عن الفعالية</h3>
                                {event.description ? (
                                    <UserGeneratedContent
                                        className="iu-event-description"
                                        html={event.description}
                                    />
                                ) : (
                                    <p className="iu-event-description">
                                        تسعى هذه الفعالية لتقديم محتوى معرفي وتطبيقي متميز يسهم في إثراء المعرفة الأكاديمية والمهنية للحضور، بمشاركة نخبة من المتحدثين والخبراء.
                                    </p>
                                )}

                                {/* 6 Info Cards Grid */}
                                <div className="iu-event-infoGrid">
                                    <div className="iu-info-card">
                                        <h4>📅 الموعد</h4>
                                        <p><EventDateRange event={event} occurrence={selectedOccurrence}/></p>
                                    </div>
                                    <div className="iu-info-card">
                                        <h4>🕒 الوقت</h4>
                                        <p>{heroTime}</p>
                                    </div>
                                    <div className="iu-info-card">
                                        <h4>🏷️ التصنيف</h4>
                                        <p>{(event as any).format || "تقني / تعليمي"}</p>
                                    </div>
                                    <div className="iu-info-card">
                                        <h4>👥 الفئة المستهدفة</h4>
                                        <p>الطلاب، الباحثون، والمهتمون بالتقنية</p>
                                    </div>
                                    <div className="iu-info-card">
                                        <h4>✅ شهادة حضور</h4>
                                        <p>{(event as any).is_certificate_eligible ? "تمنح شهادة حضور معتمدة فور إتمام الحضور" : "تمنح شهادة وفقاً لمعايير الحضور"}</p>
                                    </div>
                                    <div className="iu-info-card">
                                        <h4>🧾 المتطلبات</h4>
                                        <p>التسجيل المسبق وتأكيد الحضور عبر المنصة</p>
                                    </div>
                                </div>

                                {/* Learning Outcomes / Highlights */}
                                <div className="iu-event-subSection">
                                    <h3 className="iu-event-sectionTitle">محاور الفعالية وأهدافها</h3>
                                    <ul className="iu-event-checklist">
                                        <li>اكتساب المفاهيم والأسس العلمية والتطبيقية للموضوع المطروح.</li>
                                        <li>التعرف على أفضل الممارسات والتطبيقات الحديثة في المجال.</li>
                                        <li>التفاعل المباشر مع الخبراء والأساتذة المختصين وطرح الاستفسارات.</li>
                                        <li>الحصول على مواد علمية وروابط مساعدة لإثراء التجربة التعليمية.</li>
                                    </ul>
                                </div>

                                {/* Instructions / Notes */}
                                <div className="iu-event-subSection">
                                    <h3 className="iu-event-sectionTitle">ملاحظات وتنبيهات الحضور</h3>
                                    <p className="iu-event-description">
                                        يرجى التكرم بالحضور قبل موعد بدء الفعالية بـ 15 دقيقة لإنهاء إجراءات التحقق من التذكرة وتسجيل الدخول. في حال الفعاليات الحضورية، يرجى إبراز رمز الاستجابة السريعة (QR Code) الموجود على تذكرتك لمسؤولي الاستقبال.
                                    </p>
                                </div>
                            </div>

                            {/* Sidebar Column */}
                            <aside className="iu-event-detailsSide">
                                <div className="iu-event-sideCard">
                                    <div className="iu-event-priceBanner">
                                        {isFree ? "السعر: مجاني" : `السعر يبدأ من: ${formatCurrency(minPrice || 0, event.currency)}`}
                                    </div>

                                    {/* Action button if scrolled */}
                                    <div className="iu-event-ticketsBox" ref={ticketsSectionRef} id="tickets">
                                        <h4 style={{margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#111"}}>
                                            تسجيل وحجز التذاكر
                                        </h4>
                                        <SelectProducts
                                            colors={{
                                                background: "transparent",
                                                primary: "#084b2f",
                                                primaryText: "#ffffff",
                                                secondary: "#1b754b",
                                                secondaryText: "#ffffff",
                                                bodyBackground: "#ffffff",
                                            }}
                                            continueButtonText={continueButtonText}
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

                                    {/* Location Display */}
                                    <div style={{background: "#f8fafc", borderRadius: 14, padding: "16px 18px", marginTop: 16, border: "1px solid #e2e8f0"}}>
                                        <div style={{display: "flex", alignItems: "flex-start", gap: 10}}>
                                            <IconMapPin size={20} style={{color: "#084b2f", flexShrink: 0, marginTop: 2}} />
                                            <div>
                                                <div style={{fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4}}>
                                                    {isOnlineEvent ? "فعالية عن بُعد" : venueName}
                                                </div>
                                                {formattedAddress && (
                                                    <div style={{fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 8}}>
                                                        {formattedAddress}
                                                    </div>
                                                )}
                                                {mapUrl && (
                                                    <a
                                                        href={mapUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn outline"
                                                        style={{padding: "4px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"}}
                                                    >
                                                        <IconMapPin size={13} />
                                                        فتح الموقع في Google Maps ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organizer Info Box */}
                                    {organizer && (
                                        <div className="iu-organizer-box">
                                            {organizerLogo ? (
                                                <img
                                                    src={organizerLogo}
                                                    alt={organizer.name}
                                                    className="iu-organizer-avatar"
                                                />
                                            ) : (
                                                <div className="iu-organizer-avatar">
                                                    {organizer.name ? organizer.name.charAt(0).toUpperCase() : "IU"}
                                                </div>
                                            )}
                                            <div className="iu-organizer-info" style={{flex: 1}}>
                                                <h4>{organizer.name || "الجامعة الإسلامية بالمدينة المنورة"}</h4>
                                                <p>الجهة المنظمة للفعالية</p>
                                                <button
                                                    onClick={() => setContactModalOpen(true)}
                                                    className="btn outline"
                                                    style={{marginTop: 8, padding: "4px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6}}
                                                >
                                                    <IconMail size={14} />
                                                    تواصل مع المنظم
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating Checkout Button for Mobile / Scrolled View */}
            {showFloatingCheckoutButton && (
                <div style={{position: "fixed", bottom: 24, left: 24, right: 24, zIndex: 100, display: "flex", justifyContent: "center"}}>
                    <button
                        className="btn solid"
                        style={{
                            padding: "14px 28px",
                            fontSize: 16,
                            borderRadius: 999,
                            boxShadow: "0 12px 32px rgba(8, 75, 47, 0.35)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10
                        }}
                        onClick={() => continueButtonNode?.click()}
                    >
                        <IconTicket size={20}/>
                        {selectedCart.total > 0
                            ? `${continueButtonText} (${formatCurrency(selectedCart.total, event.currency)})`
                            : continueButtonText}
                    </button>
                </div>
            )}

            {/* Contact Modal */}
            <ContactOrganizerModal
                opened={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                organizer={organizer}
            />

            {/* IU Footer (includes PoweredByFooter for AGPL compliance) */}
            <IUFooter />
        </div>
    );
};

export default EventHomepage;

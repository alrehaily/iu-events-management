import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { dynamicActivateLocale, getClientLocale, SupportedLocales } from "../locales";

export interface IULanguageContextType {
  locale: SupportedLocales;
  isArabic: boolean;
  isEnglish: boolean;
  dir: "rtl" | "ltr";
  toggleLanguage: () => void;
  setLanguage: (lang: SupportedLocales) => void;
  t: (key: string, defaultText?: string) => string;
  getCategoryLabel: (categoryId: string) => string;
  formatDate: (dateStr?: string | null) => string;
}

const IU_TRANSLATIONS: Record<SupportedLocales, Record<string, string>> = {
  ar: {
    // Navigation
    nav_home: "الرئيسية",
    nav_events: "الفعاليات",
    nav_about: "عن المنصة",
    nav_my_registrations: "تسجيلاتي",
    nav_login: "تسجيل الدخول",
    nav_logout: "تسجيل خروج",
    nav_organizer_dashboard: "لوحة المنظم",
    brand_title: "الجامعة الإسلامية بالمدينة المنورة",

    // Footer
    footer_desc: "المنصة الرقمية الموحدة لتنظيم وحجز وتوثيق فعاليات الجامعة الإسلامية بالمدينة المنورة ودعم الحراك المعرفي والثقافي.",
    footer_quick_links: "روابط سريعة",
    footer_support: "الدعم والمساعدة",
    footer_contact: "قنوات التواصل",
    footer_contact_address: "طريق الأمير نايف بن عبدالعزيز، المدينة المنورة",
    footer_contact_email: "البريد: events@iu.edu.sa",
    footer_privacy: "سياسة الخصوصية",
    footer_terms: "شروط الاستخدام",
    footer_faqs: "الأسئلة الشائعة",
    footer_copyright: "جميع الحقوق محفوظة © الجامعة الإسلامية بالمدينة المنورة",

    // Home
    home_hero_title: "منصة إدارة الفعاليات",
    home_hero_desc: "المنصة الرقمية الموحدة لتنظيم وتنسيق الفعاليات في الجامعة الإسلامية بالمدينة المنورة، ودعم الأنشطة الأكاديمية والثقافية والمجتمعية بكفاءة واحترافية.",
    home_about_title: "من نحن",
    home_about_desc: "نحن منصة رقمية تابعة للجامعة الإسلامية بالمدينة المنورة، تهدف إلى تنظيم وإدارة الفعاليات الجامعية، وتسهيل الوصول إلى الأنشطة العلمية والثقافية، مع توفير تجربة استخدام سهلة وموحدة لكافة منسوبي الجامعة والزوار والمشاركين.",
    home_about_more: "المزيد عن المنصة",
    pillar_booking_title: "حجز فوري",
    pillar_booking_desc: "تذاكر رقمية فورية لكافة المسجلين والمشاركين",
    pillar_events_title: "فعاليات معتمدة",
    pillar_events_desc: "تنظيم أكاديمي وثقافي تحت مظلة الجامعة",
    pillar_checkin_title: "دخول مباشر",
    pillar_checkin_desc: "تسجيل حضور سريع عبر رمز الاستجابة السريعة (QR)",
    pillar_cert_title: "شهادات معتمدة",
    pillar_cert_desc: "إصدار شهادات حضور رسمية وموثقة إلكترونياً",
    home_upcoming_title: "أبرز الفعاليات القادمة",
    home_upcoming_desc: "استكشف أحدث الفعاليات والمؤتمرات وورش العمل المقامة في رحاب الجامعة الإسلامية وسجل حضورك بسهولة.",
    home_view_all_events: "عرض كافة الفعاليات",
    services_heading: "الخدمات الرقمية للمنصة",
    service_registration_title: "تسجيل فوري في الفعاليات",
    service_registration_desc: "احجز مقعدك في الفعاليات وورش العمل بنقرة واحدة واحصل على تذكرتك فوراً.",
    service_search_title: "استعراض وبحث متقدم",
    service_search_desc: "تصفح التقويم الجامعي الموحد حسب التصنيف وموعد الانعقاد ونوع الحضور.",
    service_qr_title: "تحضير سريع بالـ QR",
    service_qr_desc: "إثبات الحضور عند بوابات القاعات بمسح الرمز المباشر بكل يسر وسهولة.",
    service_certificates_title: "شهادات حضور معتمدة",
    service_certificates_desc: "إصدار وتوثيق شهادات الحضور فور انتهاء الفعالية وتأكيد الحضور.",
    empty_events: "لا توجد فعاليات معلنة حالياً. ترقبوا الإعلان عن الفعاليات القادمة قريباً.",

    // Events Catalog & Search Bar
    catalog_hero_title: "دليل الفعاليات الجامعية",
    catalog_hero_desc: "تصفح المؤتمرات، المحاضرات، ورش العمل والندوات العلمية المقامة في الجامعة الإسلامية.",
    search_placeholder: "ابحث عن فعالية، ندوة، مؤتمر أو ورشة عمل...",
    search_clear: "مسح البحث",
    filter_category: "التصنيف",
    filter_all_categories: "كل التصنيفات",
    cat_education: "تعليمي وأكاديمي",
    cat_workshop: "ورش عمل وتدريب",
    cat_tech: "تقنية ومعلوماتية",
    cat_business: "ريادة أعمال ومشاريع",
    cat_social: "أنشطة مجتمعية",
    cat_art: "فعاليات ثقافية ومعارض",
    cat_other: "عام / أخرى",
    status_all: "الكل",
    status_available: "متاح للتسجيل",
    status_upcoming: "قادمة",
    status_ended: "منتهية",
    format_in_person: "حضوري",
    format_online: "عن بُعد",
    events_available_title: "كل الفعاليات المتاحة",
    events_count_suffix: "فعالية",
    loading_events: "جاري تحميل الفعاليات...",
    no_events_title: "لم يتم العثور على فعاليات تطابق بحثك",
    no_events_desc: "جرّب تعديل كلمات البحث أو تصفية التصنيفات للوصول للنتائج المطلوبة.",
    pagination_page: "الصفحة",
    pagination_of: "من",
    pagination_next: "التالي",
    pagination_prev: "السابق",

    // Event Card
    badge_available: "متاح للتسجيل",
    badge_full: "اكتمل العدد",
    badge_closed: "التسجيل مغلق",
    view_details: "تفاصيل الفعالية",
    default_location: "الجامعة الإسلامية بالمدينة المنورة",

    // About Page
    about_hero_title: "عن منصة إدارة الفعاليات",
    about_hero_desc: "منصة رقمية موحدة لتنظيم الفعاليات في الجامعة الإسلامية بالمدينة المنورة، تُسهّل الوصول للأنشطة والبرامج العلمية والثقافية، وتدعم التسجيل والمتابعة والتوثيق الأكاديمي.",
    about_why_title: "لماذا أنشأنا المنصة؟",
    about_why_desc: "هدفنا هو توحيد رحلة الفعالية الجامعية من الإعلان والتسجيل وحتى التقييم وإصدار الشهادات المعتمدة، مع توفير لوحة عرض متكاملة لجميع الفعاليات والمؤتمرات والندوات، وربطها بمواعيدها وأماكنها واشتراطاتها بكل سهولة وشفافية.",
    about_mission_title: "رسالتنا",
    about_mission_desc: "تمكين المجتمع والباحثين والزوار وكافة الفئات المستفيدة من الوصول السريع للفعاليات، والارتقاء بجودة التنظيم والتنسيق عبر تجربة رقمية شاملة وموثوقة.",
    about_vision_title: "رؤيتنا",
    about_vision_desc: "أن تكون المنصة المرجع الرقمي الرائد لجميع فعاليات وبرامج الجامعة الإسلامية بالمدينة المنورة، ونموذجاً يحتذى به في إدارة الفعاليات الأكاديمية الذكية.",
    about_values_title: "قيمنا الجوهرية",
    val_academic: "الريادة الأكاديمية",
    val_academic_desc: "دعم الفعاليات النوعية التي تُثري المحتوى العلمي والبحثي والفكري.",
    val_innovation: "الابتكار الرقمي",
    val_innovation_desc: "توظيف أحدث الحلول التقنية في إدارة الحشود، التذاكر، والشهادات المؤتمتة.",
    val_reliability: "الشفافية والموثوقية",
    val_reliability_desc: "توفير بيانات دقيقة ومحدثة عن مواعيد الفعاليات ومقاعد الحضور المتاحة.",
    val_community: "المسؤولية المجتمعية",
    val_community_desc: "فتح آفاق المشاركة لكافة أطياف المجتمع المحلي والدولي والاستفادة من أنشطة الجامعة.",
    about_cta_title: "هل ترغب بتنظيم فعالية داخل الجامعة؟",
    about_cta_desc: "نوفر لك كمنظم أو جهة أكاديمية كافة الأدوات لإدارة الحجوزات، توليد الباركود، رصد الحضور، وإصدار الشهادات بكل احترافية.",
    about_cta_btn: "ابدأ الآن كمنظم",
    about_what_we_offer: "ماذا تقدم المنصة؟",
    feat_calendar_title: "تقويم موحد",
    feat_calendar_desc: "استعراض كافة البرامج والفعاليات في مكان واحد مع مواعيد دقيقة وأماكن الانعقاد.",
    feat_reg_title: "تسجيل فوري وميسر",
    feat_reg_desc: "خطوات بسيطة وسريعة لتسجيل الحضور وتأكيد المقعد بدون تعقيد.",
    feat_info_title: "تفاصيل ومعلومات شاملة",
    feat_info_desc: "معلومات دقيقة حول المتحدثين، الفئات المستهدفة، شروط الحضور، والخرائط الجغرافية.",
    feat_cert_title: "شهادات حضور موثقة",
    feat_cert_desc: "إصدار شهادات إلكترونية رسمية معتمدة مرتبطة بالتحضير الفعلي للمستفيدين.",
    about_audience_title: "لمن صُممت المنصة؟",
    aud_community: "كافة فئات المجتمع والمهتمين بالأنشطة والفعاليات داخل وخارج الجامعة.",
    aud_faculty: "أعضاء هيئة التدريس والباحثين ومنسوبي الكليات والمعاهد.",
    aud_guests: "الضيوف والزوار والمهتمون بالفعاليات والمؤتمرات الدولية.",
    aud_deans: "العمادات والجهات المنظمة والمراكز البحثية داخل الجامعة.",
    about_cta_banner_title: "جاهز لاستكشاف فعاليات الجامعة؟",
    about_cta_banner_desc: "تصفّح أحدث الفعاليات والأنشطة الأكاديمية وسجّل حضورك الآن بكل سهولة.",
    about_browse_events: "استعراض الفعاليات",

    // My Registrations Page
    my_reg_hero_title: "تذاكري وحجوزاتي",
    my_reg_hero_desc: "استعرض فعالياتك المسجلة، رموز الدخول المباشر (QR)، وتحقق من الشهادات المعتمدة وحالة الحضور.",
    tab_all: "الكل",
    tab_active: "الحجوزات النشطة",
    tab_cancelled: "الملغية",
    order_number: "رقم الطلب:",
    ticket_code: "رمز التذكرة:",
    booking_confirmed: "حجز مؤكد ✓",
    booking_cancelled: "حجز ملغى",
    checked_in_badge: "تم تسجيل الحضور في القاعة",
    awaiting_checkin: "بانتظار تسجيل الحضور عند الوصول",
    cert_btn: "شهادة الحضور",
    view_ticket_qr: "عرض التذكرة / QR",
    cancel_booking_btn: "إلغاء هذا الحجز والتذاكر",
    confirm_cancel_msg: "هل أنت متأكد من رغبتك في إلغاء هذا التسجيل والتذكرة؟",
    cancel_success_msg: "تم إلغاء التسجيل بنجاح.",
    no_registrations_title: "لا توجد حجوزات مسجلة حالياً",
    no_registrations_desc: "استكشف الفعاليات المتاحة في الجامعة الإسلامية وسجل حضورك الآن.",
    browse_catalog_btn: "تصفح دليل الفعاليات",
    login_required_title: "يرجى تسجيل الدخول لعرض تذاكرك وحجوزاتك",
    login_required_desc: "قم بتسجيل الدخول إلى حسابك للوصول التلقائي إلى كافة تذاكر الفعاليات، رموز الدخول (QR)، والشهادات المعتمدة.",

    // Attendee Register Page
    reg_intro_title: "انضم إلى منصة فعاليات الجامعة الإسلامية",
    reg_intro_text: "أنشئ حسابك الآن للتسجيل بضغطة زر في الفعاليات والأنشطة الأكاديمية والتقنية، وحفظ تذاكرك وإصدار شهادات الحضور المعتمدة.",
    reg_tag_cert: "شهادات حضور معتمدة",
    reg_tag_instant: "تسجيل بنقرة واحدة",
    reg_tag_record: "سجل فعاليات متكامل",
    reg_card_title: "إنشاء حساب مستفيد جديد",
    reg_card_desc: "مخصص لجميع المستفيدين والزوار والمشاركين الراغبين بحضور فعاليات الجامعة.",
    reg_first_name: "الاسم الأول",
    reg_last_name: "اسم العائلة",
    reg_email: "البريد الإلكتروني (جامعي أو شخصي)",
    reg_password: "كلمة المرور (8 خانات على الأقل)",
    reg_confirm_password: "تأكيد كلمة المرور",
    reg_submit: "إنشاء الحساب ومتابعة الفعاليات",
    reg_loading: "جاري إنشاء الحساب...",
    reg_have_account: "لديك حساب بالفعل؟ تسجيل الدخول",
    reg_err_match: "كلمتا المرور غير متطابقتين.",
    reg_err_length: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
    reg_footer_note: "الجامعة الإسلامية بالمدينة المنورة — نحو تجربة جامعية رقمية متكاملة",
  },
  en: {
    // Navigation
    nav_home: "Home",
    nav_events: "Events",
    nav_about: "About Us",
    nav_my_registrations: "My Bookings",
    nav_login: "Log In",
    nav_logout: "Log Out",
    nav_organizer_dashboard: "Organizer Dashboard",
    brand_title: "Islamic University of Madinah",

    // Footer
    footer_desc: "The unified digital platform for organizing, booking, and documenting Islamic University events in Madinah, supporting scholarly and cultural vitality.",
    footer_quick_links: "Quick Links",
    footer_support: "Help & Support",
    footer_contact: "Contact Us",
    footer_contact_address: "Prince Naif Bin Abdulaziz Rd, Madinah, KSA",
    footer_contact_email: "Email: events@iu.edu.sa",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Use",
    footer_faqs: "FAQs",
    footer_copyright: "All rights reserved © Islamic University of Madinah",

    // Home
    home_hero_title: "Event Management Platform",
    home_hero_desc: "The accredited digital gateway for organizing and attending university events at the Islamic University of Madinah, fostering academic and community excellence.",
    home_about_title: "About Us",
    home_about_desc: "We are the official digital event platform of the Islamic University of Madinah, committed to managing university events, streamlining access to lectures and conferences, and delivering a seamless experience for faculty, students, and guests.",
    home_about_more: "More About the Platform",
    pillar_booking_title: "Instant Booking",
    pillar_booking_desc: "Immediate digital tickets issued for all registered attendees",
    pillar_events_title: "Accredited Events",
    pillar_events_desc: "Academic and cultural programs under university supervision",
    pillar_checkin_title: "Direct Entry",
    pillar_checkin_desc: "Fast automated hall check-in via secure QR codes",
    pillar_cert_title: "Verified Certificates",
    pillar_cert_desc: "Official attendance certificates verified electronically upon completion",
    home_upcoming_title: "Featured Upcoming Events",
    home_upcoming_desc: "Discover the latest seminars, conferences, and workshops at the Islamic University and secure your place with ease.",
    home_view_all_events: "View All Events",
    services_heading: "Digital Platform Services",
    service_registration_title: "Instant Event Registration",
    service_registration_desc: "Reserve your seat in seminars and workshops with one click and receive your digital ticket instantly.",
    service_search_title: "Advanced Search & Discovery",
    service_search_desc: "Browse the unified university calendar filtered by category, date, and attendance mode.",
    service_qr_title: "Fast QR Check-in",
    service_qr_desc: "Validate entry at auditorium doors by scanning live QR passes swiftly and smoothly.",
    service_certificates_title: "Accredited Certificates",
    service_certificates_desc: "Automatic verification and issuance of attendance certificates upon event completion.",
    empty_events: "No events currently announced. Stay tuned for upcoming events soon.",

    // Events Catalog & Search Bar
    catalog_hero_title: "University Events Catalog",
    catalog_hero_desc: "Explore conferences, lectures, workshops, and scientific symposiums at the Islamic University.",
    search_placeholder: "Search for an event, seminar, conference, or workshop...",
    search_clear: "Clear search",
    filter_category: "Category",
    filter_all_categories: "All Categories",
    cat_education: "Educational & Academic",
    cat_workshop: "Workshops & Training",
    cat_tech: "Technology & IT",
    cat_business: "Business & Entrepreneurship",
    cat_social: "Community & Social",
    cat_art: "Culture & Exhibitions",
    cat_other: "General & Other",
    status_all: "All",
    status_available: "Open for Registration",
    status_upcoming: "Upcoming",
    status_ended: "Ended",
    format_in_person: "In-person",
    format_online: "Online",
    events_available_title: "All Available Events",
    events_count_suffix: "events",
    loading_events: "Loading events...",
    no_events_title: "No events found matching your search",
    no_events_desc: "Try adjusting your search terms or category filters to find what you are looking for.",
    pagination_page: "Page",
    pagination_of: "of",
    pagination_next: "Next",
    pagination_prev: "Previous",

    // Event Card
    badge_available: "Available",
    badge_full: "Full Capacity",
    badge_closed: "Registration Closed",
    view_details: "View Details",
    default_location: "Islamic University of Madinah",

    // About Page
    about_hero_title: "About the Event Platform",
    about_hero_desc: "A unified digital platform dedicated to organizing events at the Islamic University of Madinah, facilitating access to academic, research, and cultural programs.",
    about_why_title: "Why Did We Build the Platform?",
    about_why_desc: "Our vision is to unify the university event journey from announcement and registration to real-time check-in and accredited certificate delivery, offering complete transparency and convenience.",
    about_mission_title: "Our Mission",
    about_mission_desc: "Empowering students, researchers, and visitors with swift access to university events while elevating organization quality through a dependable digital experience.",
    about_vision_title: "Our Vision",
    about_vision_desc: "To be the leading digital benchmark for all events and programs at the Islamic University of Madinah, pioneering smart academic event administration.",
    about_values_title: "Our Core Values",
    val_academic: "Academic Excellence",
    val_academic_desc: "Supporting distinguished events that enrich scholarly, research, and intellectual discourse.",
    val_innovation: "Digital Innovation",
    val_innovation_desc: "Deploying modern technological solutions in crowd flow, ticketing, and automated certification.",
    val_reliability: "Transparency & Reliability",
    val_reliability_desc: "Providing accurate, real-time data on schedules, venues, and seat availability.",
    val_community: "Community Engagement",
    val_community_desc: "Welcoming active participation from local and international communities to benefit from university programs.",
    about_cta_title: "Want to Organize an Event at the University?",
    about_cta_desc: "We provide organizers and academic departments with comprehensive tools to handle registration, generate QR tickets, monitor attendance, and issue certificates.",
    about_cta_btn: "Get Started as Organizer",
    about_what_we_offer: "What Does the Platform Offer?",
    feat_calendar_title: "Unified Calendar",
    feat_calendar_desc: "Browse all programs and events in one place with exact schedules and hall venues.",
    feat_reg_title: "Instant & Easy Registration",
    feat_reg_desc: "Fast and simple steps to reserve your seat and confirm attendance effortlessly.",
    feat_info_title: "Comprehensive Details",
    feat_info_desc: "Accurate information about speakers, target audiences, entry criteria, and campus maps.",
    feat_cert_title: "Verified Attendance Certificates",
    feat_cert_desc: "Official electronic certificates certified upon verified attendance check-in.",
    about_audience_title: "Who is this Platform For?",
    aud_community: "All members of the general public interested in academic and cultural university events.",
    aud_faculty: "Faculty members, researchers, and staff across colleges and academic institutes.",
    aud_guests: "Dignitaries, international visitors, and attendees of global conferences.",
    aud_deans: "Deanships, organizing committees, and specialized research centers.",
    about_cta_banner_title: "Ready to Explore University Events?",
    about_cta_banner_desc: "Browse the latest academic and cultural programs and secure your attendance now.",
    about_browse_events: "Explore Events",

    // My Registrations Page
    my_reg_hero_title: "My Tickets & Bookings",
    my_reg_hero_desc: "Review your registered events, access direct QR entrance codes, verify attendance status, and download accredited certificates.",
    tab_all: "All",
    tab_active: "Active Bookings",
    tab_cancelled: "Cancelled",
    order_number: "Order #:",
    ticket_code: "Ticket Code:",
    booking_confirmed: "Confirmed Booking ✓",
    booking_cancelled: "Cancelled Booking",
    checked_in_badge: "Checked in at Venue",
    awaiting_checkin: "Awaiting Check-in Upon Arrival",
    cert_btn: "Attendance Certificate",
    view_ticket_qr: "View Ticket / QR",
    cancel_booking_btn: "Cancel This Booking & Tickets",
    confirm_cancel_msg: "Are you sure you want to cancel this registration and ticket?",
    cancel_success_msg: "Registration cancelled successfully.",
    no_registrations_title: "No Bookings Registered Currently",
    no_registrations_desc: "Explore upcoming events at the Islamic University and secure your ticket today.",
    browse_catalog_btn: "Browse Events Catalog",
    login_required_title: "Please Log In to View Your Tickets & Bookings",
    login_required_desc: "Sign in to your account to automatically access all your event tickets, QR entrance codes, and accredited certificates.",

    // Attendee Register Page
    reg_intro_title: "Join the Islamic University Events Platform",
    reg_intro_text: "Create your account now for one-click registration in academic and technological events, save your tickets, and receive certified attendance credentials.",
    reg_tag_cert: "Accredited Certificates",
    reg_tag_instant: "One-Click Registration",
    reg_tag_record: "Unified Event History",
    reg_card_title: "Create a New Attendee Account",
    reg_card_desc: "For students, faculty, researchers, and visitors attending university events.",
    reg_first_name: "First Name",
    reg_last_name: "Last Name",
    reg_email: "Email (University or Personal)",
    reg_password: "Password (at least 8 characters)",
    reg_confirm_password: "Confirm Password",
    reg_submit: "Create Account & Explore Events",
    reg_loading: "Creating account...",
    reg_have_account: "Already have an account? Log in",
    reg_policy_note: "All accounts are governed by the IT and privacy policies of the Islamic University of Madinah.",
    reg_err_match: "Passwords do not match.",
    reg_err_length: "Password must be at least 8 characters.",
    reg_footer_note: "Islamic University of Madinah — Towards an Integrated Digital University Experience",
  }
};

const IULanguageContext = createContext<IULanguageContextType>({
  locale: "ar",
  isArabic: true,
  isEnglish: false,
  dir: "rtl",
  toggleLanguage: () => { },
  setLanguage: () => { },
  t: (key: string, defaultText?: string) => defaultText || key,
  getCategoryLabel: (id: string) => id,
  formatDate: (d?: string | null) => d || "",
});

export const IULanguageProvider: React.FC<{ children: ReactNode; initialLocale?: SupportedLocales }> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<SupportedLocales>(() => {
    return initialLocale || getClientLocale();
  });

  const applyLocale = useCallback((newLocale: SupportedLocales) => {
    setLocaleState(newLocale);
    if (typeof document !== "undefined") {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      localStorage.setItem("locale", newLocale);
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLocale;
      window.dispatchEvent(new Event("iu_locale_changed"));
    }
    dynamicActivateLocale(newLocale);
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = locale === "ar" ? "en" : "ar";
    applyLocale(next);
  }, [locale, applyLocale]);

  const setLanguage = useCallback((lang: SupportedLocales) => {
    applyLocale(lang);
  }, [applyLocale]);

  useEffect(() => {
    // Initial sync
    if (typeof document !== "undefined") {
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback((key: string, defaultText?: string): string => {
    const dict = IU_TRANSLATIONS[locale] || IU_TRANSLATIONS.ar;
    if (dict[key]) return dict[key];
    if (IU_TRANSLATIONS.ar[key]) return IU_TRANSLATIONS.ar[key];
    return defaultText || key;
  }, [locale]);

  const getCategoryLabel = useCallback((categoryId: string): string => {
    const map: Record<string, string> = {
      EDUCATION: t("cat_education", "تعليمي وأكاديمي"),
      WORKSHOP: t("cat_workshop", "ورش عمل وتدريب"),
      TECH: t("cat_tech", "تقنية ومعلوماتية"),
      BUSINESS: t("cat_business", "ريادة أعمال ومشاريع"),
      SOCIAL: t("cat_social", "أنشطة مجتمعية"),
      ART: t("cat_art", "فعاليات ثقافية ومعارض"),
      OTHER: t("cat_other", "عام / أخرى"),
      "": t("filter_all_categories", "كل التصنيفات"),
    };
    return map[categoryId] || categoryId || t("filter_category", "التصنيف");
  }, [t]);

  const formatDate = useCallback((dateStr?: string | null): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }, [locale]);

  const isArabic = locale === "ar";
  const isEnglish = locale === "en";
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <IULanguageContext.Provider
      value={{
        locale,
        isArabic,
        isEnglish,
        dir,
        toggleLanguage,
        setLanguage,
        t,
        getCategoryLabel,
        formatDate,
      }}
    >
      {children}
    </IULanguageContext.Provider>
  );
};

export const useIULanguage = () => useContext(IULanguageContext);
export default IULanguageContext;

import {Link, Navigate, Outlet, useLocation} from "react-router";
import classes from "./Auth.module.scss";
import {useGetMe} from "../../../queries/useGetMe.ts";
import {LanguageSwitcher} from "../../common/LanguageSwitcher";
import {useCallback, useEffect, useRef} from "react";
import {showInfo} from "../../../utilites/notifications.tsx";
import {captureUtmData} from "../../../utilites/utm.ts";
import "../../../styles/iu/common.css";

import {useIULanguage} from "../../../context/IULanguageContext";

const tickerFeaturesAr = [
    "استعراض وحجز الفعاليات بسهولة",
    "شهادات حضور فورية ومعتمدة",
    "تذاكر رقمية مع رمز التحقق السريع QR",
    "متابعة كافة أنشطة ومؤتمرات الجامعة",
    "إدارة مرنة لجميع تسجيلاتك",
    "إشعارات وتحديثات المواعيد أولاً بأول",
    "تأكيد فوري لحجوزات المقاعد",
    "تكامل الهوية المؤسسية للجامعة",
];

const tickerFeaturesEn = [
    "Seamless event discovery & booking",
    "Instant accredited certificates",
    "Digital tickets with live QR check-in",
    "Official university activities & forums",
    "Full control over your registrations",
    "Real-time alerts & schedule updates",
    "Instant guaranteed seat confirmation",
    "Accredited Islamic University identity",
];

const FeaturePanel = () => {
    const {dir, isArabic} = useIULanguage();
    const features = isArabic ? tickerFeaturesAr : tickerFeaturesEn;
    const tickerLoop = [...features, ...features];

    return (
        <div className={classes.rightPanel} dir={dir}>
            <div className={classes.noise}/>
            <div className={classes.rings}/>

            <div className={classes.panelInner}>
                <h1 className={classes.heroTitle}>
                    <span className={classes.heroBold}>
                        {isArabic ? "بوابتكم لكافة فعاليات الجامعة." : "Your Gateway to University Events."}
                    </span>
                    <span className={classes.heroLight}>
                        {isArabic ? "الجامعة الإسلامية بالمدينة المنورة" : "Islamic University of Madinah"}
                    </span>
                </h1>

                <div className={classes.ticketScene} aria-hidden="true">
                    <div className={classes.ticketGhost}/>
                    <div className={classes.ticket}>
                        <div className={classes.ticketInner}>
                            <div className={classes.ticketMain}>
                                <div className={classes.ticketTop}>
                                    <span>{isArabic ? "تذكرة دخول معتمدة" : "Accredited Event Pass"}</span>
                                    <span>№ 000482</span>
                                </div>
                                <div className={classes.ticketTitle}>
                                    {isArabic ? "المؤتمر التقني السنوي للذكاء الاصطناعي" : "Annual Tech & AI Conference"}
                                </div>
                                <div className={classes.ticketMeta}>
                                    {isArabic ? "المدينة المنورة · قاعة الملك سعود · 9:00 ص" : "Madinah · King Saud Hall · 9:00 AM"}
                                </div>
                                <div className={classes.ticketFields}>
                                    <div className={classes.ticketField}>
                                        <span>{isArabic ? "البوابة" : "Gate"}</span>
                                        <strong>1</strong>
                                    </div>
                                    <div className={classes.ticketField}>
                                        <span>{isArabic ? "القاعة" : "Hall"}</span>
                                        <strong>{isArabic ? "المدرج الرئيسي" : "Auditorium"}</strong>
                                    </div>
                                    <div className={classes.ticketField}>
                                        <span>{isArabic ? "الحالة" : "Status"}</span>
                                        <strong>{isArabic ? "مؤكد ✓" : "Confirmed ✓"}</strong>
                                    </div>
                                </div>
                                <div className={classes.barcode}/>
                            </div>
                            <div className={classes.ticketStub}>
                                <span className={classes.stubLabel}>{isArabic ? "فعاليات الجامعة" : "IU Events"}</span>
                                <svg className={classes.stubQr} viewBox="0 0 25 25">
                                    <path fillRule="evenodd" d="M0 0h7v7H0zm1 1v5h5V1z"/>
                                    <rect x="2" y="2" width="3" height="3"/>
                                    <path fillRule="evenodd" d="M18 0h7v7h-7zm1 1v5h5V1z"/>
                                    <rect x="20" y="2" width="3" height="3"/>
                                    <path fillRule="evenodd" d="M0 18h7v7H0zm1 1v5h5v-5z"/>
                                    <rect x="2" y="20" width="3" height="3"/>
                                    <rect x="9" y="0" width="2" height="2"/>
                                    <rect x="13" y="2" width="2" height="2"/>
                                    <rect x="10" y="5" width="2" height="2"/>
                                    <rect x="15" y="5" width="2" height="2"/>
                                    <rect x="0" y="9" width="2" height="2"/>
                                    <rect x="4" y="10" width="2" height="2"/>
                                    <rect x="8" y="9" width="3" height="3"/>
                                    <rect x="13" y="10" width="2" height="2"/>
                                    <rect x="17" y="9" width="2" height="2"/>
                                    <rect x="21" y="10" width="2" height="2"/>
                                    <rect x="2" y="14" width="2" height="2"/>
                                    <rect x="7" y="13" width="2" height="2"/>
                                    <rect x="11" y="14" width="2" height="2"/>
                                    <rect x="15" y="13" width="3" height="3"/>
                                    <rect x="20" y="14" width="2" height="2"/>
                                    <rect x="9" y="18" width="2" height="2"/>
                                    <rect x="13" y="19" width="2" height="2"/>
                                    <rect x="18" y="18" width="2" height="2"/>
                                    <rect x="22" y="19" width="2" height="2"/>
                                    <rect x="10" y="22" width="3" height="2"/>
                                    <rect x="16" y="22" width="2" height="2"/>
                                </svg>
                                <span className={classes.stubSeat}>{isArabic ? "معتمد ✓" : "Verified ✓"}</span>
                            </div>
                        </div>
                    </div>
                    <div className={classes.stamp}>{isArabic ? "الجامعة الإسلامية" : "Islamic University"}</div>
                </div>
            </div>

            <div className={classes.ticker} aria-hidden="true">
                <div className={classes.tickerTrack}>
                    {tickerLoop.map((item, i) => (
                        <span key={i} className={classes.tickerItem}>
                            {item}
                            <span className={classes.tickerDot}/>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AuthLayout = () => {
    const me = useGetMe();
    const location = useLocation();
    const {dir, isArabic, locale} = useIULanguage();
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        captureUtmData();
    }, []);

    const handleLogoClick = useCallback(() => {
        clickCountRef.current += 1;
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);

        if (clickCountRef.current >= 5) {
            clickCountRef.current = 0;
            showInfo(isArabic ? `منصة فعاليات الجامعة الإسلامية بالمدينة المنورة` : `Islamic University Events Platform`);
        }
    }, [isArabic]);

    if (me.isSuccess) {
        return <Navigate to={'/manage/events'} />
    }

    const isAttendeeAuth = location.pathname === '/auth/login' || location.pathname === '/register' || location.pathname === '/login';
    if (isAttendeeAuth && typeof window !== "undefined" && localStorage.getItem("iu_attendee_token")) {
        return <Navigate to={'/'} />
    }

    return (
        <div className={classes.authLayout} dir={dir}>
            <div className={classes.splitLayout}>
                <div className={classes.leftPanel}>
                    <main className={classes.container}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
                            <Link to="/" className={classes.logo} onClick={handleLogoClick} style={{cursor: 'pointer', display: 'flex'}}>
                                <img
                                    src="/images/IUEvent2.png"
                                    alt={isArabic ? "شعار الجامعة الإسلامية بالمدينة المنورة" : "Islamic University of Madinah logo"}
                                    style={{height: 48, width: "auto"}}
                                />
                            </Link>
                            <Link to="/" style={{fontSize: 13, color: "var(--iu-green-800, #105f3c)", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6}}>
                                {isArabic ? "العودة للرئيسية ←" : "Back to Home →"}
                            </Link>
                        </div>
                        <div className={classes.formArea} key={`${location.pathname}_${locale}`}>
                            <div className={classes.wrapper}>
                                <Outlet />
                            </div>
                        </div>
                        <div className={classes.panelFooter}>
                            <div className={classes.languageSwitcher}>
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </main>
                </div>

                <FeaturePanel />
            </div>
        </div>
    );
};

export default AuthLayout;

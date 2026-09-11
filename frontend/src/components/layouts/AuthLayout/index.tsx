import {Link, Navigate, Outlet} from "react-router";
import classes from "./Auth.module.scss";
import {useGetMe} from "../../../queries/useGetMe.ts";
import {PoweredByFooter} from "../../common/PoweredByFooter";
import {LanguageSwitcher} from "../../common/LanguageSwitcher";
import {useCallback, useEffect, useRef} from "react";
import {isHiEvents} from "../../../utilites/helpers.ts";
import {showInfo} from "../../../utilites/notifications.tsx";
import {captureUtmData} from "../../../utilites/utm.ts";

const tickerFeatures = [
    "إصدار تذاكر وحجوزات ذكية",
    "شهادات حضور معتمدة وموثقة",
    "التحقق السريع عبر رمز QR",
    "إدارة السعة والقاعات الجامعية",
    "تحليلات وتقارير الحضور الفورية",
    "تكامل الهوية المؤسسية للجامعة",
    "بوابة مخصصة لمنظمي الكليات",
    "تواصل آلي عبر البريد الإلكتروني",
];

const FeaturePanel = () => {
    const tickerLoop = [...tickerFeatures, ...tickerFeatures];

    return (
        <div className={classes.rightPanel} dir="rtl">
            <div className={classes.noise}/>
            <div className={classes.rings}/>

            <div className={classes.panelInner}>
                <h1 className={classes.heroTitle}>
                    <span className={classes.heroBold}>إدارة احترافية لفعاليات الجامعة.</span>
                    <span className={classes.heroLight}>الجامعة الإسلامية بالمدينة المنورة</span>
                </h1>

                <div className={classes.ticketScene} aria-hidden="true">
                    <div className={classes.ticketGhost}/>
                    <div className={classes.ticket}>
                        <div className={classes.ticketInner}>
                            <div className={classes.ticketMain}>
                                <div className={classes.ticketTop}>
                                    <span>تذكرة دخول معتمدة</span>
                                    <span>№ 000482</span>
                                </div>
                                <div className={classes.ticketTitle}>المؤتمر التقني السنوي للذكاء الاصطناعي</div>
                                <div className={classes.ticketMeta}>المدينة المنورة · قاعة الملك سعود · 9:00 ص</div>
                                <div className={classes.ticketFields}>
                                    <div className={classes.ticketField}>
                                        <span>البوابة</span>
                                        <strong>1</strong>
                                    </div>
                                    <div className={classes.ticketField}>
                                        <span>القاعة</span>
                                        <strong>المدرج الرئيسي</strong>
                                    </div>
                                    <div className={classes.ticketField}>
                                        <span>الحالة</span>
                                        <strong>مؤكد ✓</strong>
                                    </div>
                                </div>
                                <div className={classes.barcode}/>
                            </div>
                            <div className={classes.ticketStub}>
                                <span className={classes.stubLabel}>IU Event</span>
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
                                <span className={classes.stubSeat}>معتمد ✓</span>
                            </div>
                        </div>
                    </div>
                    <div className={classes.stamp}>الجامعة الإسلامية</div>
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
            showInfo(`HiEvents v${__APP_VERSION__}`);
        }
    }, []);

    if (me.isSuccess) {
        return <Navigate to={'/manage/events'} />
    }

    return (
        <div className={classes.authLayout} dir="rtl">
            <div className={classes.splitLayout}>
                <div className={classes.leftPanel}>
                    <main className={classes.container}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
                            <div className={classes.logo} onClick={handleLogoClick} style={{cursor: 'pointer'}}>
                                <img
                                    src="/images/IUEvent2.png"
                                    alt="شعار الجامعة الإسلامية بالمدينة المنورة"
                                    style={{height: 48, width: "auto"}}
                                />
                            </div>
                            <Link to="/login" style={{fontSize: 13, color: "var(--iu-green-900)", fontWeight: 700, textDecoration: "none"}}>
                                بوابة الطلاب والمشاركين ←
                            </Link>
                        </div>
                        <div className={classes.formArea}>
                            <div className={classes.wrapper}>
                                <Outlet />
                            </div>
                        </div>
                        <div className={classes.panelFooter}>
                            {/*
                             * (c) Hi.Events Ltd 2025
                             *
                             * PLEASE NOTE:
                             *
                             * Hi.Events is licensed under the GNU Affero General Public License (AGPL) version 3.
                             *
                             * You can find the full license text at: https://github.com/HiEventsDev/hi.events/blob/main/LICENCE
                             *
                             * In accordance with Section 7(b) of the AGPL, we ask that you retain the "Powered by Hi.Events" notice.
                             *
                             * If you wish to remove this notice, a commercial license is available at: https://hi.events/licensing
                             */}
                            {!isHiEvents() && <PoweredByFooter />}
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

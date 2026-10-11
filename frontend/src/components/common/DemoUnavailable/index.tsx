import {useLocation, useNavigate, useParams} from "react-router";
import {IconArrowLeft, IconHome} from "@tabler/icons-react";
import {
    DEMO_DISABLED_DESCRIPTION,
    DEMO_DISABLED_DESCRIPTION_AR,
    DEMO_DISABLED_TITLE,
    DEMO_DISABLED_TITLE_AR,
} from "../../../utilites/demoGates.ts";
import classes from "./DemoUnavailable.module.scss";

export const DemoUnavailable = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {eventId, eventSlug, organizerId} = useParams();
    const isDashboard = location.pathname.startsWith('/manage') || location.pathname.startsWith('/admin');

    const getBackTarget = (): {path: string; label: string} => {
        if (eventId && location.pathname.includes(`/manage/event/${eventId}`)) {
            return {
                path: `/manage/event/${eventId}/dashboard`,
                label: "العودة للوحة تحكم الفعالية",
            };
        }
        if (organizerId && location.pathname.includes(`/manage/organizer`)) {
            return {
                path: `/manage/organizer/${organizerId}/dashboard`,
                label: "العودة للوحة تحكم المنظم",
            };
        }
        if (location.pathname.startsWith('/admin')) {
            return {
                path: '/admin',
                label: "العودة للوحة الإدارة",
            };
        }
        if (location.pathname.startsWith('/manage')) {
            return {
                path: '/manage/events',
                label: "العودة لقائمة الفعاليات",
            };
        }
        if (eventId && (location.pathname.startsWith('/checkout') || location.pathname.includes('/register') || location.pathname.startsWith('/event/'))) {
            return {
                path: eventSlug ? `/event/${eventId}/${eventSlug}` : `/event/${eventId}`,
                label: "العودة للفعالية",
            };
        }
        return {
            path: '/events',
            label: "العودة لدليل الفعاليات",
        };
    };

    const backTarget = getBackTarget();

    return (
        <div className={`${classes.container} ${!isDashboard ? classes.standalone : ''}`} dir="rtl">
            {!isDashboard && (
                <div className={classes.logoWrapper}>
                    <img
                        src="/images/IUEvent2.png"
                        alt="فعاليات الجامعة الإسلامية"
                        className={classes.logo}
                    />
                </div>
            )}
            <div className={classes.card}>
                <div className={classes.errorCode}>
                    404
                </div>
                <h2 className={classes.title}>
                    {DEMO_DISABLED_TITLE_AR}
                </h2>
                <div className={classes.titleEn}>
                    {DEMO_DISABLED_TITLE}
                </div>
                <p className={classes.description}>
                    <span className={classes.descAr}>
                        {DEMO_DISABLED_DESCRIPTION_AR}
                    </span>
                    <span className={classes.descEn}>
                        {DEMO_DISABLED_DESCRIPTION}
                    </span>
                </p>
                <div className={classes.actions}>
                    <button
                        type="button"
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate(backTarget.path);
                            }
                        }}
                        className={classes.primaryBtn}
                    >
                        <IconArrowLeft size={16} />
                        {backTarget.label}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className={classes.secondaryBtn}
                    >
                        <IconHome size={16} />
                        الصفحة الرئيسية
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoUnavailable;

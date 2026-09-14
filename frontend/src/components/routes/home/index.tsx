import React from "react";
import { Link } from "react-router";
import { IconTicket, IconSchool, IconQrcode, IconCertificate, IconSearch } from "@tabler/icons-react";
import classes from "./Home.module.scss";
import { IUHero } from "../../iu/IUHero";
import { IUEventCard } from "../../iu/IUEventCard";
import { useGetEventsPublic } from "../../../queries/useGetEventsPublic";
import { useIULanguage } from "../../../context/IULanguageContext";
import { useScrollReveal } from "../../../hooks/useScrollReveal";

export const IUHomePage: React.FC = () => {
  const { t, dir } = useIULanguage();
  const { data: eventsData, isLoading } = useGetEventsPublic({
    perPage: 6,
    additionalParams: {
      events_status: "upcoming"
    }
  });

  const events = eventsData?.data || [];

  // Observe elements on mount and when events change
  useScrollReveal([events.length, isLoading]);

  return (
    <div>
      {/* 1. Hero Section */}
      <IUHero
        title={t("home_hero_title", "منصة إدارة الفعاليات")}
        description={t("home_hero_desc", "المنصة الرقمية الموحدة لتنظيم وتنسيق الفعاليات في الجامعة الإسلامية بالمدينة المنورة، ودعم الأنشطة الأكاديمية والثقافية والمجتمعية بكفاءة واحترافية.")}
      />

      {/* 2. About Us / Pillars */}
      <section className={classes.stats}>
        <div className="container">
          <div className={`${classes.statsTop} iu-reveal`}>
            <div className={classes.statsTopText}>
              <h2>{t("home_about_title", "من نحن")}</h2>
              <p>
                {t("home_about_desc", "نحن منصة رقمية تابعة للجامعة الإسلامية بالمدينة المنورة، تهدف إلى تنظيم وإدارة الفعاليات الجامعية، وتسهيل الوصول إلى الأنشطة العلمية والثقافية، مع توفير تجربة استخدام سهلة وموحدة لكافة منسوبي الجامعة والزوار والمشاركين.")}
              </p>
            </div>
            <Link to="/about" className={`btn outline iu-interactive-pill ${classes.aboutMoreBtn}`}>
              {t("home_about_more", "المزيد عن المنصة")}
            </Link>
          </div>

          <div className={classes.statsGrid}>
            <div className={`${classes.statCard} iu-reveal iu-stagger-1 iu-hover-lift`}>
              <div className={classes.statIcon}>
                <IconTicket size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <div className={classes.statValue}>{t("pillar_booking_title", "حجز فوري")}</div>
              <div className={classes.statLabel}>{t("pillar_booking_desc", "تذاكر رقمية فورية لكافة المسجلين والمشاركين")}</div>
            </div>

            <div className={`${classes.statCard} iu-reveal iu-stagger-2 iu-hover-lift`}>
              <div className={classes.statIcon}>
                <IconSchool size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <div className={classes.statValue}>{t("pillar_events_title", "فعاليات معتمدة")}</div>
              <div className={classes.statLabel}>{t("pillar_events_desc", "تنظيم أكاديمي وثقافي تحت مظلة الجامعة")}</div>
            </div>

            <div className={`${classes.statCard} iu-reveal iu-stagger-3 iu-hover-lift`}>
              <div className={classes.statIcon}>
                <IconQrcode size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <div className={classes.statValue}>{t("pillar_checkin_title", "تحقق ذكي")}</div>
              <div className={classes.statLabel}>{t("pillar_checkin_desc", "تسجيل حضور مباشر عبر رمز QR")}</div>
            </div>

            <div className={`${classes.statCard} iu-reveal iu-stagger-4 iu-hover-lift`}>
              <div className={classes.statIcon}>
                <IconCertificate size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <div className={classes.statValue}>{t("pillar_cert_title", "شهادات موثقة")}</div>
              <div className={classes.statLabel}>{t("pillar_cert_desc", "إصدار وتحقق إلكتروني من استحقاق الحضور")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services */}
      <section className={classes.section} id="services">
        <div className="container">
          <div className={`${classes.sectionHead} iu-reveal`}>
            <h2>{t("services_heading", "الخدمات الرقمية للمنصة")}</h2>
          </div>

          <div className={classes.servicesGrid}>
            <div className={`${classes.serviceCard} iu-reveal iu-stagger-1 iu-hover-lift`}>
              <div className={classes.serviceIcon}>
                <IconTicket size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <h4>{t("service_registration_title", "تسجيل فوري في الفعاليات")}</h4>
              <p>{t("service_registration_desc", "احجز مقعدك في الفعاليات وورش العمل بنقرة واحدة واحصل على تذكرتك فوراً.")}</p>
            </div>

            <div className={`${classes.serviceCard} iu-reveal iu-stagger-2 iu-hover-lift`}>
              <div className={classes.serviceIcon}>
                <IconSearch size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <h4>{t("service_search_title", "استعراض وبحث متقدم")}</h4>
              <p>{t("service_search_desc", "تصفح التقويم الجامعي الموحد حسب التصنيف وموعد الانعقاد ونوع الحضور.")}</p>
            </div>

            <div className={`${classes.serviceCard} iu-reveal iu-stagger-3 iu-hover-lift`}>
              <div className={classes.serviceIcon}>
                <IconQrcode size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <h4>{t("service_qr_title", "تحضير سريع بالـ QR")}</h4>
              <p>{t("service_qr_desc", "إثبات الحضور عند بوابات القاعات بمسح الرمز المباشر بكل يسر وسهولة.")}</p>
            </div>

            <div className={`${classes.serviceCard} iu-reveal iu-stagger-4 iu-hover-lift`}>
              <div className={classes.serviceIcon}>
                <IconCertificate size={32} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              </div>
              <h4>{t("service_certificates_title", "شهادات حضور معتمدة")}</h4>
              <p>{t("service_certificates_desc", "إصدار وتوثيق شهادات الحضور فور انتهاء الفعالية وتأكيد الحضور.")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Events */}
      <section className={`${classes.section} ${classes.sectionLight}`}>
        <div className="container">
          <div className={`${classes.sectionHead} iu-reveal`}>
            <h2>{t("home_upcoming_title", "الفعاليات القادمة والمتاحة للتسجيل")}</h2>
            <Link to="/events" className={classes.moreLink}>
              {t("home_view_all_events", "عرض كل الفعاليات")} {dir === "rtl" ? "‹" : "›"}
            </Link>
          </div>

          {isLoading ? (
            <div className={classes.emptyEvents}>
              <p>{t("loading_events", "جاري تحميل أحدث فعاليات الجامعة الإسلامية...")}</p>
            </div>
          ) : events.length > 0 ? (
            <div className={classes.eventsGrid}>
              {events.map((event, idx) => (
                <div key={event.id} className={`iu-reveal iu-stagger-${Math.min(idx + 1, 9)}`}>
                  <IUEventCard event={event} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className={classes.emptyEvents}>
              <p>{t("empty_events", "لا توجد فعاليات معلنة حالياً. ترقبوا الإعلان عن الفعاليات القادمة قريباً.")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default IUHomePage;

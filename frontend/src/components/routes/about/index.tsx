import React from "react";
import { Link } from "react-router";
import {
  IconTarget,
  IconEye,
  IconCalendar,
  IconBolt,
  IconMapPin,
  IconCertificate,
  IconSchool,
  IconUsers,
  IconWorld,
  IconBuildingCommunity
} from "@tabler/icons-react";
import classes from "./About.module.scss";
import { IUHero } from "../../iu/IUHero";
import { useIULanguage } from "../../../context/IULanguageContext";
import { useScrollReveal } from "../../../hooks/useScrollReveal";

export const IUAboutPage: React.FC = () => {
  const { t } = useIULanguage();

  useScrollReveal([]);

  return (
    <div>
      {/* 1. Hero */}
      <IUHero
        title={t("about_hero_title", "عن منصة إدارة الفعاليات")}
        description={t("about_hero_desc", "منصة رقمية موحدة لتنظيم الفعاليات في الجامعة الإسلامية بالمدينة المنورة، تُسهّل الوصول للأنشطة والبرامج العلمية والثقافية، وتدعم التسجيل والمتابعة والتوثيق الأكاديمي.")}
      />

      {/* 2. Intro */}
      <section className={classes.section}>
        <div className="container">
          <div className={`${classes.sectionHead} iu-reveal`}>
            <h2>{t("about_why_title", "لماذا أنشأنا المنصة؟")}</h2>
            <p>
              {t("about_why_desc", "هدفنا هو توحيد رحلة الفعالية الجامعية من الإعلان والتسجيل وحتى التقييم وإصدار الشهادات المعتمدة، مع توفير لوحة عرض متكاملة لجميع الفعاليات والمؤتمرات والندوات، وربطها بمواعيدها وأماكنها واشتراطاتها بكل سهولة وشفافية.")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className={`${classes.section} ${classes.sectionLight}`}>
        <div className="container">
          <div className={classes.split}>
            <div className={`${classes.missionCard} iu-reveal iu-stagger-1 iu-hover-lift`}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconTarget size={24} color="var(--iu-icon, #0f172a)" />
                {t("about_mission_title", "رسالتنا")}
              </h3>
              <p>
                {t("about_mission_desc", "تمكين المجتمع والباحثين والزوار وكافة الفئات المستفيدة من الوصول السريع للفعاليات، والارتقاء بجودة التنظيم والتنسيق عبر تجربة رقمية شاملة وموثوقة.")}
              </p>
            </div>
            <div className={`${classes.missionCard} iu-reveal iu-stagger-2 iu-hover-lift`}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconEye size={24} color="var(--iu-icon, #0f172a)" />
                {t("about_vision_title", "رؤيتنا")}
              </h3>
              <p>
                {t("about_vision_desc", "أن تكون المنصة المرجع الرقمي الرائد لجميع فعاليات وبرامج الجامعة الإسلامية بالمدينة المنورة، ونموذجاً يحتذى به في إدارة الفعاليات الأكاديمية الذكية.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features */}
      <section className={classes.section}>
        <div className="container">
          <h2 className={`${classes.sectionTitle} iu-reveal`}>
            {t("about_what_we_offer", "ماذا تقدم المنصة؟")}
          </h2>
          <div className={classes.featureGrid}>
            <div className={`${classes.featureCard} iu-reveal iu-stagger-1 iu-hover-lift`}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconCalendar size={20} color="var(--iu-icon, #0f172a)" />
                {t("feat_calendar_title", "تقويم موحد")}
              </h4>
              <p>{t("feat_calendar_desc", "استعراض كافة البرامج والفعاليات في مكان واحد مع مواعيد دقيقة وأماكن الانعقاد.")}</p>
            </div>
            <div className={`${classes.featureCard} iu-reveal iu-stagger-2 iu-hover-lift`}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconBolt size={20} color="var(--iu-icon, #0f172a)" />
                {t("feat_reg_title", "تسجيل فوري وميسر")}
              </h4>
              <p>{t("feat_reg_desc", "خطوات بسيطة وسريعة لتسجيل الحضور وتأكيد المقعد بدون تعقيد.")}</p>
            </div>
            <div className={`${classes.featureCard} iu-reveal iu-stagger-3 iu-hover-lift`}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconMapPin size={20} color="var(--iu-icon, #0f172a)" />
                {t("feat_info_title", "تفاصيل ومعلومات شاملة")}
              </h4>
              <p>{t("feat_info_desc", "معلومات دقيقة حول المتحدثين، الفئات المستهدفة، شروط الحضور، والخرائط الجغرافية.")}</p>
            </div>
            <div className={`${classes.featureCard} iu-reveal iu-stagger-4 iu-hover-lift`}>
              <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconCertificate size={20} color="var(--iu-icon, #0f172a)" />
                {t("feat_cert_title", "شهادات حضور موثقة")}
              </h4>
              <p>{t("feat_cert_desc", "إصدار شهادات إلكترونية رسمية معتمدة مرتبطة بالتحضير الفعلي للمستفيدين.")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Target Audience */}
      <section className={`${classes.section} ${classes.sectionLight}`}>
        <div className="container">
          <h2 className={`${classes.sectionTitle} iu-reveal`}>
            {t("about_audience_title", "لمن صُممت المنصة؟")}
          </h2>
          <div className={classes.audienceList}>
            <div className={`${classes.audienceItem} iu-reveal iu-stagger-1 iu-hover-lift`}>
              <IconSchool size={22} color="var(--iu-icon, #0f172a)" />
              <span>{t("aud_community", "كافة فئات المجتمع والمهتمين بالأنشطة والفعاليات داخل وخارج الجامعة.")}</span>
            </div>
            <div className={`${classes.audienceItem} iu-reveal iu-stagger-2 iu-hover-lift`}>
              <IconUsers size={22} color="var(--iu-icon, #0f172a)" />
              <span>{t("aud_faculty", "أعضاء هيئة التدريس والباحثين ومنسوبي الكليات والمعاهد.")}</span>
            </div>
            <div className={`${classes.audienceItem} iu-reveal iu-stagger-3 iu-hover-lift`}>
              <IconWorld size={22} color="var(--iu-icon, #0f172a)" />
              <span>{t("aud_guests", "الضيوف والزوار والمهتمون بالفعاليات والمؤتمرات الدولية.")}</span>
            </div>
            <div className={`${classes.audienceItem} iu-reveal iu-stagger-4 iu-hover-lift`}>
              <IconBuildingCommunity size={22} color="var(--iu-icon, #0f172a)" />
              <span>{t("aud_deans", "العمادات والجهات المنظمة والمراكز البحثية داخل الجامعة.")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className={classes.section}>
        <div className="container">
          <div className={`${classes.cta} iu-reveal`}>
            <div className={classes.ctaText}>
              <h2>{t("about_cta_banner_title", "جاهز لاستكشاف فعاليات الجامعة؟")}</h2>
              <p>{t("about_cta_banner_desc", "تصفّح أحدث الفعاليات والأنشطة الأكاديمية وسجّل حضورك الآن بكل سهولة.")}</p>
            </div>
            <Link
              to="/events"
              className="btn solid iu-interactive-pill"
              style={{ background: "#ffffff", color: "var(--iu-green-primary)" }}
            >
              {t("about_browse_events", "استعراض الفعاليات")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IUAboutPage;

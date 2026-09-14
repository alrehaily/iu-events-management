import React from "react";
import {Link} from "react-router";
import classes from "./IUFooter.module.scss";
import {useIULanguage} from "../../../context/IULanguageContext";

export const IUFooter: React.FC = () => {
  const {t} = useIULanguage();

  return (
    <footer className={classes.footer}>
      <div className="container">
        <div className={classes.footerGrid}>
          <div className={classes.footerCol}>
            <h4>{t("brand_title", "الجامعة الإسلامية بالمدينة المنورة")}</h4>
            <p>
              {t("footer_desc", "منصة رقمية متكاملة لإدارة وتنظيم الفعاليات والمؤتمرات والأنشطة الأكاديمية والمجتمعية، وتسهيل إجراءات التسجيل وحضور الفعاليات وتوثيق الشهادات المعتمدة لكافة المستفيدين.")}
            </p>
          </div>

          <div className={classes.footerCol}>
            <h4>{t("footer_quick_links", "روابط سريعة")}</h4>
            <Link to="/">{t("nav_home", "الرئيسية")}</Link>
            <Link to="/events">{t("nav_events", "دليل الفعاليات")}</Link>
            <Link to="/about">{t("nav_about", "عن المنصة")}</Link>
            <Link to="/my-registrations">{t("nav_my_registrations", "تسجيلاتي")}</Link>
            <Link to="/manage/login">{t("nav_organizer_dashboard", "بوابة المنظمين والمسؤولين")}</Link>
          </div>

          <div className={classes.footerCol}>
            <h4>{t("footer_support", "الدعم والمساعدة")}</h4>
            <Link to="/about#services">{t("home_about_more", "الخدمات المتاحة")}</Link>
            <Link to="/about">{t("footer_faqs", "الأسئلة الشائعة")}</Link>
            <a href="https://iu.edu.sa" target="_blank" rel="noopener noreferrer">
              {t("brand_title", "بوابة الجامعة الرسمية")}
            </a>
          </div>

          <div className={classes.footerCol}>
            <h4>{t("footer_contact", "قنوات التواصل")}</h4>
            <a href="https://x.com/iu_edu" target="_blank" rel="noopener noreferrer">
              X / Twitter
            </a>
            <a href="https://www.youtube.com/@iu_edu" target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            <a href="https://www.instagram.com/iu_edu_sa" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://www.linkedin.com/school/iu_edu/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div className={classes.footerBottom}>
          <div>
            © {new Date().getFullYear()} {t("footer_copyright", "جميع الحقوق محفوظة © الجامعة الإسلامية بالمدينة المنورة")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default IUFooter;

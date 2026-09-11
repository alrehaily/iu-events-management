import React from "react";
import {Link} from "react-router";
import classes from "./IUFooter.module.scss";
import {PoweredByFooter} from "../../common/PoweredByFooter";

export const IUFooter: React.FC = () => {
  return (
    <footer className={classes.footer}>
      <div className="container">
        <div className={classes.footerGrid}>
          <div className={classes.footerCol}>
            <h4>الجامعة الإسلامية بالمدينة المنورة</h4>
            <p>
              منصة رقمية متكاملة لإدارة وتنظيم الفعاليات والمؤتمرات والأنشطة الأكاديمية والطلابية، وتسهيل إجراءات التسجيل وحضور الفعاليات وتوثيق الشهادات المعتمدة.
            </p>
          </div>

          <div className={classes.footerCol}>
            <h4>روابط سريعة</h4>
            <Link to="/">الرئيسية</Link>
            <Link to="/events">دليل الفعاليات</Link>
            <Link to="/about">عن المنصة</Link>
            <Link to="/my-registrations">تسجيلاتي</Link>
          </div>

          <div className={classes.footerCol}>
            <h4>الدعم والمساعدة</h4>
            <Link to="/about#services">الخدمات المتاحة</Link>
            <Link to="/about">الأسئلة الشائعة</Link>
            <a href="https://iu.edu.sa" target="_blank" rel="noopener noreferrer">
              بوابة الجامعة الرسمية
            </a>
            <Link to="/manage/auth/login">بوابة المنظمين</Link>
          </div>

          <div className={classes.footerCol}>
            <h4>قنوات التواصل</h4>
            <a href="https://x.com/iu_edu" target="_blank" rel="noopener noreferrer">
              X / تويتر
            </a>
            <a href="https://www.youtube.com/@iu_edu" target="_blank" rel="noopener noreferrer">
              يوتيوب
            </a>
            <a href="https://www.instagram.com/iu_edu_sa" target="_blank" rel="noopener noreferrer">
              انستغرام
            </a>
            <a href="https://www.linkedin.com/school/iu_edu/" target="_blank" rel="noopener noreferrer">
              لينكدإن
            </a>
          </div>
        </div>

        <div className={classes.footerBottom}>
          <div>
            © {new Date().getFullYear()} الجامعة الإسلامية بالمدينة المنورة — جميع الحقوق محفوظة
          </div>
          <div className={classes.attribution}>
            <PoweredByFooter />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default IUFooter;

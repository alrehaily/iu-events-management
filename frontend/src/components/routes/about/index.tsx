import React from "react";
import {Link} from "react-router";
import classes from "./About.module.scss";
import {IUHero} from "../../iu/IUHero";

export const IUAboutPage: React.FC = () => {
  return (
    <div>
      {/* 1. Hero */}
      <IUHero
        title="عن منصة إدارة الفعاليات"
        description="منصة رقمية موحدة لتنظيم الفعاليات في الجامعة الإسلامية بالمدينة المنورة، تُسهّل الوصول للأنشطة والبرامج العلمية والثقافية، وتدعم التسجيل والمتابعة والتوثيق الأكاديمي."
      />

      {/* 2. Intro */}
      <section className={classes.section}>
        <div className="container">
          <div className={classes.sectionHead}>
            <h2>لماذا أنشأنا المنصة؟</h2>
            <p>
              هدفنا هو توحيد رحلة الفعالية الجامعية من الإعلان والتسجيل وحتى التقييم وإصدار الشهادات المعتمدة، مع توفير لوحة عرض متكاملة لجميع الفعاليات والمؤتمرات والندوات، وربطها بمواعيدها وأماكنها واشتراطاتها بكل سهولة وشفافية.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className={`${classes.section} ${classes.sectionLight}`}>
        <div className="container">
          <div className={classes.split}>
            <div className={classes.missionCard}>
              <h3>🎯 رسالتنا</h3>
              <p>
                تمكين المجتمع الجامعي من الطلاب والباحثين والزوار من الوصول السريع للفعاليات، والارتقاء بجودة التنظيم والتنسيق عبر تجربة رقمية شاملة وموثوقة.
              </p>
            </div>
            <div className={classes.missionCard}>
              <h3>🌟 رؤيتنا</h3>
              <p>
                أن تكون المنصة المرجع الرقمي الرائد لجميع فعاليات وبرامج الجامعة الإسلامية بالمدينة المنورة، ونموذجاً يحتذى به في إدارة الفعاليات الأكاديمية الذكية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features */}
      <section className={classes.section}>
        <div className="container">
          <h2 className={classes.sectionTitle}>ماذا تقدم المنصة؟</h2>
          <div className={classes.featureGrid}>
            <div className={classes.featureCard}>
              <h4>📅 تقويم موحد</h4>
              <p>استعراض كافة البرامج والفعاليات في مكان واحد مع مواعيد دقيقة وأماكن الانعقاد.</p>
            </div>
            <div className={classes.featureCard}>
              <h4>⚡ تسجيل فوري وميسر</h4>
              <p>خطوات بسيطة وسريعة لتسجيل الحضور وتأكيد المقعد بدون تعقيد.</p>
            </div>
            <div className={classes.featureCard}>
              <h4>📍 تفاصيل ومعلومات شاملة</h4>
              <p>معلومات دقيقة حول المتحدثين، الفئات المستهدفة، شروط الحضور، والخرائط الجغرافية.</p>
            </div>
            <div className={classes.featureCard}>
              <h4>📜 شهادات حضور موثقة</h4>
              <p>إصدار شهادات إلكترونية رسمية معتمدة مرتبطة بالتحضير الفعلي للمستفيدين.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Target Audience */}
      <section className={`${classes.section} ${classes.sectionLight}`}>
        <div className="container">
          <h2 className={classes.sectionTitle}>لمن صُممت المنصة؟</h2>
          <div className={classes.audienceList}>
            <div className={classes.audienceItem}>
              <span>🎓</span>
              <span>طلاب وطالبات الجامعة الإسلامية بالمدينة المنورة بمختلف المراحل.</span>
            </div>
            <div className={classes.audienceItem}>
              <span>👨‍🏫</span>
              <span>أعضاء هيئة التدريس والباحثين ومنسوبي الكليات والمعاهد.</span>
            </div>
            <div className={classes.audienceItem}>
              <span>🌍</span>
              <span>الضيوف والزوار والمهتمون بالفعاليات والمؤتمرات الدولية.</span>
            </div>
            <div className={classes.audienceItem}>
              <span>🏛️</span>
              <span>العمادات والجهات المنظمة والمراكز البحثية داخل الجامعة.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className={classes.section}>
        <div className="container">
          <div className={classes.cta}>
            <div className={classes.ctaText}>
              <h2>جاهز لاستكشاف فعاليات الجامعة؟</h2>
              <p>تصفّح أحدث الفعاليات والأنشطة الأكاديمية وسجّل حضورك الآن بكل سهولة.</p>
            </div>
            <Link to="/events" className="btn solid" style={{background: "#ffffff", color: "var(--green-900)"}}>
              استعراض الفعاليات
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IUAboutPage;

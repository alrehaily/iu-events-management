import React from "react";
import {Link} from "react-router";
import classes from "./Home.module.scss";
import {IUHero} from "../../iu/IUHero";
import {IUEventCard} from "../../iu/IUEventCard";
import {useGetEventsPublic} from "../../../queries/useGetEventsPublic";

export const IUHomePage: React.FC = () => {
  const {data: eventsData, isLoading} = useGetEventsPublic({
    perPage: 6,
    additionalParams: {
      events_status: "upcoming"
    }
  });

  const events = eventsData?.data || [];

  return (
    <div>
      {/* 1. Hero Section */}
      <IUHero
        title="منصة إدارة الفعاليات"
        description="المنصة الرقمية الموحدة لتنظيم وتنسيق الفعاليات في الجامعة الإسلامية بالمدينة المنورة، ودعم الأنشطة الأكاديمية والثقافية والطلابية بكفاءة واحترافية."
      />

      {/* 2. About Us / Pillars */}
      <section className={classes.stats}>
        <div className="container">
          <div className={classes.statsTop}>
            <div className={classes.statsTopText}>
              <h2>من نحن</h2>
              <p>
                نحن منصة رقمية تابعة للجامعة الإسلامية بالمدينة المنورة، تهدف إلى تنظيم وإدارة الفعاليات الجامعية، وتسهيل الوصول إلى الأنشطة العلمية والثقافية، مع توفير تجربة استخدام سهلة وموحدة للطلاب ومنسوبي الجامعة والزوار.
              </p>
            </div>
            <Link to="/about" className="btn outline">
              المزيد عن المنصة
            </Link>
          </div>

          <div className={classes.statsGrid}>
            <div className={classes.statCard}>
              <div className={classes.statIcon}>🎟️</div>
              <div className={classes.statValue} style={{fontSize: 20}}>حجز فوري</div>
              <div className={classes.statLabel}>تذاكر رقمية فورية للطلاب والمشاركين</div>
            </div>

            <div className={classes.statCard}>
              <div className={classes.statIcon}>🏛️</div>
              <div className={classes.statValue} style={{fontSize: 20}}>فعاليات معتمدة</div>
              <div className={classes.statLabel}>تنظيم أكاديمي وثقافي تحت مظلة الجامعة</div>
            </div>

            <div className={classes.statCard}>
              <div className={classes.statIcon}>📱</div>
              <div className={classes.statValue} style={{fontSize: 20}}>تحقق ذكي</div>
              <div className={classes.statLabel}>تسجيل حضور مباشر عبر رمز QR</div>
            </div>

            <div className={classes.statCard}>
              <div className={classes.statIcon}>📜</div>
              <div className={classes.statValue} style={{fontSize: 20}}>شهادات موثقة</div>
              <div className={classes.statLabel}>إصدار وتحقق إلكتروني من استحقاق الحضور</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services */}
      <section className={classes.section} id="services">
        <div className="container">
          <div className={classes.sectionHead}>
            <h2>الخدمات الرقمية للمنصة</h2>
          </div>

          <div className={classes.servicesGrid}>
            <div className={classes.serviceCard}>
              <div className={classes.serviceIcon}>🎟️</div>
              <h4>تسجيل فوري في الفعاليات</h4>
              <p>احجز مقعدك في الفعاليات وورش العمل بنقرة واحدة واحصل على تذكرتك فوراً.</p>
            </div>

            <div className={classes.serviceCard}>
              <div className={classes.serviceIcon}>🔍</div>
              <h4>استعراض وبحث متقدم</h4>
              <p>تصفح التقويم الجامعي الموحد حسب التصنيف وموعد الانعقاد ونوع الحضور.</p>
            </div>

            <div className={classes.serviceCard}>
              <div className={classes.serviceIcon}>📱</div>
              <h4>تحضير سريع بالـ QR</h4>
              <p>إثبات الحضور عند بوابات القاعات بمسح الرمز المباشر بكل يسر وسهولة.</p>
            </div>

            <div className={classes.serviceCard}>
              <div className={classes.serviceIcon}>📜</div>
              <h4>شهادات حضور معتمدة</h4>
              <p>إصدار وتوثيق شهادات الحضور فور انتهاء الفعالية وتأكيد الحضور.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Events */}
      <section className={`${classes.section} ${classes.sectionLight}`}>
        <div className="container">
          <div className={classes.sectionHead}>
            <h2>الفعاليات القادمة والمتاحة للتسجيل</h2>
            <Link to="/events" className={classes.moreLink}>
              عرض كل الفعاليات ‹
            </Link>
          </div>

          {isLoading ? (
            <div className={classes.emptyEvents}>
              <p>جاري تحميل أحدث فعاليات الجامعة الإسلامية...</p>
            </div>
          ) : events.length > 0 ? (
            <div className={classes.eventsGrid}>
              {events.map((event, idx) => (
                <IUEventCard key={event.id} event={event} index={idx} />
              ))}
            </div>
          ) : (
            <div className={classes.emptyEvents}>
              <p>لا توجد فعاليات معلنة حالياً. ترقبوا الإعلان عن الفعاليات القادمة قريباً.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default IUHomePage;

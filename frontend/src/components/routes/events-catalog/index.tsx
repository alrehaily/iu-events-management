import React, {useState} from "react";
import classes from "./EventsCatalog.module.scss";
import {IUHero} from "../../iu/IUHero";
import {IUSearchBar} from "../../iu/IUSearchBar";
import {IUEventCard} from "../../iu/IUEventCard";
import {IUPagination} from "../../iu/IUPagination";
import {useGetEventsPublic} from "../../../queries/useGetEventsPublic";

export const IUEventsCatalogPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "upcoming" | "ended">("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {data: eventsResponse, isLoading} = useGetEventsPublic({
    query: query || undefined,
    pageNumber: currentPage,
    perPage: 9,
    additionalParams: {
      events_status: selectedStatus !== "all" ? selectedStatus : undefined,
      category: selectedCategory || undefined,
    },
  });

  const events = eventsResponse?.data || [];
  const totalPages = eventsResponse?.meta?.last_page || 1;

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
  };

  const handleStatusChange = (newStatus: "all" | "upcoming" | "ended") => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 1. Hero with Floating Search */}
      <IUHero className={classes.catalogHero}>
        <div className={classes.heroHeadingBlock}>
          <h1 className={classes.heroTitle}>
            دليل فعاليات الجامعة الإسلامية
          </h1>
          <p className={classes.heroLead}>
            استكشف الفعاليات والمؤتمرات والندوات الأكاديمية والثقافية وسجّل حضورك بسهولة
          </p>
        </div>

        <IUSearchBar
          query={query}
          onQueryChange={handleQueryChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          isFloating={true}
        />
      </IUHero>

      {/* 2. Events Grid Section */}
      <section className={`${classes.eventsSection} container`}>
        <div className={classes.sectionTitle}>
          <span>📅</span>
          <span>كل الفعاليات المتاحة</span>
          {eventsResponse?.meta?.total !== undefined && (
            <span style={{fontSize: "15px", fontWeight: 500, color: "var(--iu-text-muted)"}}>
              ({eventsResponse.meta.total} فعالية)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className={classes.noResults}>
            <p>جاري تحميل الفعاليات...</p>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className={classes.eventsGrid}>
              {events.map((event, idx) => (
                <IUEventCard key={event.id} event={event} index={idx} />
              ))}
            </div>

            <IUPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className={classes.noResults}>
            <h3>لم يتم العثور على فعاليات تطابق بحثك</h3>
            <p>جرّب تعديل كلمات البحث أو تصفية التصنيفات للوصول للنتائج المطلوبة.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default IUEventsCatalogPage;

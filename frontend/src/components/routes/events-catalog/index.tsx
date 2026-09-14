import React, {useState} from "react";
import classes from "./EventsCatalog.module.scss";
import {IUHero} from "../../iu/IUHero";
import {IUSearchBar} from "../../iu/IUSearchBar";
import {IUEventCard} from "../../iu/IUEventCard";
import {IUPagination} from "../../iu/IUPagination";
import {useGetEventsPublic} from "../../../queries/useGetEventsPublic";
import {IconCalendarEvent, IconSearchOff} from "@tabler/icons-react";
import {useIULanguage} from "../../../context/IULanguageContext";
import {useScrollReveal} from "../../../hooks/useScrollReveal";

export const IUEventsCatalogPage: React.FC = () => {
  const {t} = useIULanguage();
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "available" | "upcoming" | "ended">("all");
  const [selectedFormat, setSelectedFormat] = useState<"all" | "in_person" | "online">("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {data: eventsResponse, isLoading} = useGetEventsPublic({
    query: query || undefined,
    pageNumber: currentPage,
    perPage: 9,
    additionalParams: {
      ...(selectedStatus !== "all" ? { events_status: selectedStatus } : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedFormat !== "all" ? { format: selectedFormat } : {}),
    },
  });

  const events = eventsResponse?.data || [];
  const totalPages = eventsResponse?.meta?.last_page || 1;
  const eventsAnimationKey = [
    selectedStatus,
    selectedFormat,
    selectedCategory,
    query,
    currentPage,
    events.map((event) => event.id).join("-"),
  ].join("|");

  useScrollReveal([eventsAnimationKey, isLoading]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
  };

  const handleStatusChange = (newStatus: "all" | "available" | "upcoming" | "ended") => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  const handleFormatChange = (newFormat: "all" | "in_person" | "online") => {
    setSelectedFormat(newFormat);
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
        <IUSearchBar
          query={query}
          onQueryChange={handleQueryChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedFormat={selectedFormat}
          onFormatChange={handleFormatChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          isFloating={true}
        />
      </IUHero>

      {/* 2. Events Grid Section */}
      <section className={`${classes.eventsSection} container`}>
        <h1 className={`${classes.sectionTitle} iu-reveal`}>
          <IconCalendarEvent size={26} stroke={1.8} className={classes.sectionIcon} />
          <span>{t("events_available_title", "كل الفعاليات المتاحة")}</span>
          {eventsResponse?.meta?.total !== undefined && (
            <span style={{fontSize: "15px", fontWeight: 500, color: "var(--iu-text-muted)"}}>
              ({eventsResponse.meta.total} {t("events_count_suffix", "فعالية")})
            </span>
          )}
        </h1>

        {isLoading ? (
          <div className={classes.noResults}>
            <p>{t("loading_events", "جاري تحميل الفعاليات...")}</p>
          </div>
        ) : events.length > 0 ? (
          <>
            <div key={eventsAnimationKey} className={classes.eventsGrid}>
              {events.map((event, idx) => (
                <div key={event.id} className={`iu-reveal iu-stagger-${Math.min(idx + 1, 9)}`}>
                  <IUEventCard event={event} index={idx} />
                </div>
              ))}
            </div>

            <IUPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className={`${classes.noResults} iu-reveal`}>
            <IconSearchOff size={40} stroke={1.6} className={classes.noResultsIcon} />
            <h3>{t("no_events_title", "لم يتم العثور على فعاليات تطابق بحثك")}</h3>
            <p>{t("no_events_desc", "جرّب تعديل كلمات البحث أو تصفية التصنيفات للوصول للنتائج المطلوبة.")}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default IUEventsCatalogPage;

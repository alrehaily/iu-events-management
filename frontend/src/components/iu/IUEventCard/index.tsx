import {SAUDI_TIMEZONE} from "../../../constants/institution.ts";
import React from "react";
import {Link} from "react-router";
import classes from "./IUEventCard.module.scss";
import {Event} from "../../../types";
import {eventCoverImageUrl} from "../../../utilites/urlHelper";
import {IconCalendar, IconClock} from "@tabler/icons-react";
import {formatDateWithLocale} from "../../../utilites/dates.ts";
import {useIULanguage} from "../../../context/IULanguageContext";

interface IUEventCardProps {
  event: Event;
  index?: number;
}

export const IUEventCard: React.FC<IUEventCardProps> = ({event, index = 0}) => {
  const {locale, t, getCategoryLabel} = useIULanguage();
  const coverUrl = eventCoverImageUrl(event) || "/images/IUEvent2.png";
  const [imgSrc, setImgSrc] = React.useState<string>(coverUrl);

  React.useEffect(() => {
    setImgSrc(coverUrl);
  }, [coverUrl]);

  const slug = event.slug || "details";
  const isEnded = event.lifecycle_status === "ENDED";
  const isLive = event.status === "LIVE" && !isEnded;

  const startDate = event.next_occurrence_start_date ?? event.start_date ?? event.occurrences?.[0]?.start_date;
  const formattedDate = startDate
    ? formatDateWithLocale(startDate, "shortDate", SAUDI_TIMEZONE, locale)
    : t("status_upcoming", "موعد مرتقب");
  const formattedTime = startDate ? formatDateWithLocale(startDate, "timeOnly", SAUDI_TIMEZONE, locale) : "";

  return (
    <Link
      to={`/event/${event.id}/${slug}`}
      className={classes.cardLink}
      style={{animationDelay: `${index * 60}ms`}}
      viewTransition
    >
      <div className={classes.eventCard}>
        <div className={classes.eventImage}>
          <img
            src={imgSrc}
            alt={event.title}
            loading="lazy"
            onError={() => setImgSrc("/images/IUEvent2.png")}
          />
          {event.category && (
            <span className={classes.categoryBadge}>
              {getCategoryLabel(event.category)}
            </span>
          )}
        </div>

        <div className={classes.eventContent}>
          <div
            className={`${classes.eventStatus} ${
              isLive ? classes.statusLive : classes.statusClosed
            }`}
          >
            <span>
              {isLive
                ? `● ${t("badge_available", "متاح للتسجيل")}`
                : `✖ ${t("badge_closed", "التسجيل مغلق")}`}
            </span>
          </div>

          <h3 className={classes.eventTitle}>{event.title}</h3>

          <div className={classes.eventMeta}>
            <span className={classes.metaItem}>
              <IconCalendar size={15} stroke={1.75} color="var(--iu-icon, #0f172a)" />
              <span>{formattedDate}</span>
            </span>
            {formattedTime && (
              <span className={classes.metaItem}>
                <IconClock size={15} stroke={1.75} color="var(--iu-icon, #0f172a)" />
                <span>{formattedTime}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IUEventCard;

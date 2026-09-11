import React from "react";
import {Link} from "react-router";
import classes from "./IUEventCard.module.scss";
import {Event} from "../../../types";
import {eventCoverImageUrl} from "../../../utilites/urlHelper";
import dayjs from "dayjs";

interface IUEventCardProps {
  event: Event;
  index?: number;
}

export const IUEventCard: React.FC<IUEventCardProps> = ({event, index = 0}) => {
  const coverUrl = eventCoverImageUrl(event) || "/images/IUEvent2.png";
  const slug = event.slug || "details";
  const isEnded = event.lifecycle_status === "ENDED";
  const isLive = event.status === "LIVE" && !isEnded;

  // Format date and time
  const startDate = event.start_date || (event.occurrences && event.occurrences[0]?.start_date);
  const formattedDate = startDate ? dayjs(startDate).locale('ar').format("DD MMMM YYYY") : "موعد مرتقب";
  const formattedTime = startDate ? dayjs(startDate).locale('ar').format("h:mm A") : "";

  return (
    <Link
      to={`/event/${event.id}/${slug}`}
      className={classes.cardLink}
      style={{animationDelay: `${index * 80}ms`}}
    >
      <div className={`${classes.eventCard} reveal-card is-visible`}>
        <div className={classes.eventImage}>
          <img src={coverUrl} alt={event.title} loading="lazy" />
          {event.category && (
            <span className={classes.categoryBadge}>{event.category}</span>
          )}
        </div>

        <div className={classes.eventContent}>
          <div
            className={`${classes.eventStatus} ${
              isLive ? classes.statusLive : classes.statusClosed
            }`}
          >
            <span>{isLive ? "● متاح للتسجيل" : "✖ التسجيل مغلق"}</span>
          </div>

          <h3 className={classes.eventTitle}>{event.title}</h3>

          <div className={classes.eventMeta}>
            <span className={classes.metaItem}>
              <span>📅</span>
              <span>{formattedDate}</span>
            </span>
            {formattedTime && (
              <span className={classes.metaItem}>
                <span>🕒</span>
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

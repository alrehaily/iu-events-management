import React from "react";
import classes from "./IUPagination.module.scss";
import { useIULanguage } from "../../../context/IULanguageContext";

interface IUPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const IUPagination: React.FC<IUPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { isArabic, t } = useIULanguage();

  if (totalPages <= 1) return null;

  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    pages.push(p);
  }

  const prevArrow = isArabic ? "›" : "‹";
  const nextArrow = isArabic ? "‹" : "›";

  return (
    <nav className={classes.pagination} aria-label={t("pagination_page", "الصفحة")}>
      {/* Previous button */}
      <button
        type="button"
        className={classes.navBtn}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        title={t("pagination_prev", "الصفحة السابقة")}
      >
        {prevArrow}
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`${classes.pageBtn} ${p === currentPage ? classes.active : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {/* Next button */}
      <button
        type="button"
        className={classes.navBtn}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title={t("pagination_next", "الصفحة التالية")}
      >
        {nextArrow}
      </button>
    </nav>
  );
};

export default IUPagination;

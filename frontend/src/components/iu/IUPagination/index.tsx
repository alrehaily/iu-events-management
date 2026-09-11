import React from "react";
import classes from "./IUPagination.module.scss";

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
  if (totalPages <= 1) return null;

  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    pages.push(p);
  }

  return (
    <nav className={classes.pagination} aria-label="Pagination">
      {/* Previous button (in RTL, > goes to previous) */}
      <button
        type="button"
        className={classes.navBtn}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        title="الصفحة السابقة"
      >
        ›
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

      {/* Next button (in RTL, < goes to next) */}
      <button
        type="button"
        className={classes.navBtn}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title="الصفحة التالية"
      >
        ‹
      </button>
    </nav>
  );
};

export default IUPagination;

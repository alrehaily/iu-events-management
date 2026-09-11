import React from "react";
import classes from "./IUSearchBar.module.scss";

interface IUSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedStatus?: "all" | "upcoming" | "ended";
  onStatusChange?: (status: "all" | "upcoming" | "ended") => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categories?: string[];
  isFloating?: boolean;
}

export const IUSearchBar: React.FC<IUSearchBarProps> = ({
  query,
  onQueryChange,
  selectedStatus = "all",
  onStatusChange,
  selectedCategory = "",
  onCategoryChange,
  categories = [
    "مؤتمرات وملتقيات",
    "ورش عمل ودورات",
    "ندوات علمية",
    "فعاليات ثقافية",
    "أنشطة طلابية",
  ],
  isFloating = false,
}) => {
  return (
    <div
      className={`${classes.searchBox} ${isFloating ? classes.floating : ""}`}
    >
      <div className={classes.searchBar}>
        <span className={classes.searchIcon}>🔍</span>
        <input
          type="text"
          className={classes.searchInput}
          placeholder="ابحث عن فعالية، ندوة، مؤتمر أو ورشة عمل..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "16px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className={classes.filters}>
        {/* Category dropdown */}
        <div className={classes.filterGroup}>
          <select
            className={classes.filterSelect}
            value={selectedCategory}
            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
          >
            <option value="">كل التصنيفات</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        {onStatusChange && (
          <div className={classes.filterGroup}>
            <button
              type="button"
              className={`pill ${selectedStatus === "all" ? "active" : ""}`}
              onClick={() => onStatusChange("all")}
            >
              الكل
            </button>
            <button
              type="button"
              className={`pill ${
                selectedStatus === "upcoming" ? "active" : ""
              }`}
              onClick={() => onStatusChange("upcoming")}
            >
              الفعاليات القادمة
            </button>
            <button
              type="button"
              className={`pill ${selectedStatus === "ended" ? "active" : ""}`}
              onClick={() => onStatusChange("ended")}
            >
              المنتهية
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IUSearchBar;

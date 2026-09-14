import React, {useState, useRef, useEffect, useMemo} from "react";
import classes from "./IUSearchBar.module.scss";
import {
  IconSearch,
  IconX,
  IconChevronDown,
  IconFilter,
  IconCheck,
} from "@tabler/icons-react";
import {useIULanguage} from "../../../context/IULanguageContext";

export interface CategoryItem {
  id: string;
  label: string;
}

interface IUSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedStatus?: "all" | "available" | "upcoming" | "ended";
  onStatusChange?: (status: "all" | "available" | "upcoming" | "ended") => void;
  selectedFormat?: "all" | "in_person" | "online";
  onFormatChange?: (format: "all" | "in_person" | "online") => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categories?: CategoryItem[];
  isFloating?: boolean;
}

export const IUSearchBar: React.FC<IUSearchBarProps> = ({
  query,
  onQueryChange,
  selectedStatus = "all",
  onStatusChange,
  selectedFormat = "all",
  onFormatChange,
  selectedCategory = "",
  onCategoryChange,
  categories: customCategories,
  isFloating = false,
}) => {
  const {t, getCategoryLabel} = useIULanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const localizedCategories = useMemo<CategoryItem[]>(() => {
    if (customCategories) return customCategories;
    return [
      { id: "", label: t("filter_all_categories", "كل التصنيفات") },
      { id: "EDUCATION", label: t("cat_education", "تعليمي وأكاديمي") },
      { id: "WORKSHOP", label: t("cat_workshop", "ورش عمل وتدريب") },
      { id: "TECH", label: t("cat_tech", "تقنية ومعلوماتية") },
      { id: "BUSINESS", label: t("cat_business", "ريادة أعمال ومشاريع") },
      { id: "SOCIAL", label: t("cat_social", "أنشطة مجتمعية") },
      { id: "ART", label: t("cat_art", "فعاليات ثقافية ومعارض") },
      { id: "OTHER", label: t("cat_other", "عام / أخرى") },
    ];
  }, [customCategories, t]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen]);

  const handleSelectCategory = (catId: string) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
    setIsDropdownOpen(false);
  };

  const handleClearCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryChange) {
      onCategoryChange("");
    }
    setIsDropdownOpen(false);
  };

  const handleFormatToggle = (format: "in_person" | "online") => {
    if (!onFormatChange) return;
    if (selectedFormat === format) {
      onFormatChange("all");
    } else {
      onFormatChange(format);
    }
  };

  const activeCategoryLabel = selectedCategory
    ? getCategoryLabel(selectedCategory)
    : t("filter_category", "التصنيف");
  const hasSelectedCategory = Boolean(selectedCategory);

  return (
    <div
      className={`${classes.searchBox} ${isFloating ? classes.floating : ""}`}
    >
      {/* 1. Main Search Bar Input */}
      <div className={classes.searchBar}>
        <IconSearch size={20} className={classes.searchIcon} stroke={1.8} />
        <input
          type="text"
          className={classes.searchInput}
          placeholder={t("search_placeholder", "ابحث عن فعالية، ندوة، مؤتمر أو ورشة عمل...")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label={t("search_placeholder", "ابحث عن فعالية")}
        />
        {query && (
          <button
            type="button"
            className={classes.clearSearchBtn}
            onClick={() => onQueryChange("")}
            title={t("search_clear", "مسح البحث")}
            aria-label={t("search_clear", "مسح البحث")}
          >
            <IconX size={15} stroke={2} />
          </button>
        )}
      </div>

      {/* 2. Filters & Pills Row */}
      <div className={classes.filters}>
        {/* Category Dropdown Pill */}
        <div className={classes.dropdownContainer} ref={dropdownRef}>
          <button
            type="button"
            className={`${classes.dropdownTrigger} ${
              hasSelectedCategory ? classes.dropdownTriggerActive : ""
            } ${isDropdownOpen ? classes.dropdownTriggerOpen : ""}`}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label={t("filter_category", "التصنيف")}
          >
            <span className={classes.triggerLead}>
              <IconFilter
                size={16}
                stroke={1.8}
                className={classes.filterIcon}
              />
              <span className={classes.selectedLabel}>
                {activeCategoryLabel}
              </span>
            </span>

            <span className={classes.triggerTrail}>
              {hasSelectedCategory && (
                <span
                  role="button"
                  tabIndex={0}
                  className={classes.clearCategoryPill}
                  onClick={handleClearCategory}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClearCategory(e as any);
                    }
                  }}
                  title={t("search_clear", "إلغاء تصفية التصنيف")}
                  aria-label={t("search_clear", "إلغاء تصفية التصنيف")}
                >
                  <IconX size={12} stroke={2.2} />
                </span>
              )}
              <IconChevronDown
                size={15}
                stroke={2}
                className={`${classes.chevron} ${
                  isDropdownOpen ? classes.chevronOpen : ""
                }`}
              />
            </span>
          </button>

          {/* Compact, Comfortable Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className={classes.dropdownMenu}
              role="listbox"
              aria-label={t("filter_category", "قائمة التصنيفات")}
            >
              {localizedCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id || "all"}
                    type="button"
                    className={`${classes.dropdownItem} ${
                      isSelected ? classes.dropdownItemSelected : ""
                    }`}
                    onClick={() => handleSelectCategory(cat.id)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className={classes.itemLabel}>{cat.label}</span>
                    {isSelected && (
                      <IconCheck
                        size={15}
                        stroke={2.2}
                        className={classes.checkIcon}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Pills */}
        {onStatusChange && (
          <div className={classes.pillsGroup}>
            <button
              type="button"
              className={`${classes.filterPill} ${
                selectedStatus === "all" ? classes.pillActive : ""
              }`}
              onClick={() => onStatusChange("all")}
            >
              {t("status_all", "الكل")}
            </button>
            <button
              type="button"
              className={`${classes.filterPill} ${
                selectedStatus === "available" ? classes.pillActive : ""
              }`}
              onClick={() => onStatusChange("available")}
            >
              {t("status_available", "متاح للتسجيل")}
            </button>
            <button
              type="button"
              className={`${classes.filterPill} ${
                selectedStatus === "upcoming" ? classes.pillActive : ""
              }`}
              onClick={() => onStatusChange("upcoming")}
            >
              {t("status_upcoming", "قادمة")}
            </button>
            <button
              type="button"
              className={`${classes.filterPill} ${
                selectedStatus === "ended" ? classes.pillActive : ""
              }`}
              onClick={() => onStatusChange("ended")}
            >
              {t("status_ended", "منتهية")}
            </button>
          </div>
        )}

        {/* Separator / Format Pills (In-person / Online) */}
        {onFormatChange && (
          <div className={`${classes.pillsGroup} ${classes.formatPillsGroup}`}>
            <span className={classes.pillsDivider} />
            <button
              type="button"
              className={`${classes.filterPill} ${
                selectedFormat === "in_person" ? classes.pillActive : ""
              }`}
              onClick={() => handleFormatToggle("in_person")}
            >
              {t("format_in_person", "حضوري")}
            </button>
            <button
              type="button"
              className={`${classes.filterPill} ${
                selectedFormat === "online" ? classes.pillActive : ""
              }`}
              onClick={() => handleFormatToggle("online")}
            >
              {t("format_online", "عن بُعد")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IUSearchBar;

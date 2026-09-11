import React from "react";
import {NavLink, Link} from "react-router";
import classes from "./IUNavbar.module.scss";
import {useGetMe} from "../../../queries/useGetMe";
import {dynamicActivateLocale, getClientLocale} from "../../../locales";

export const IUNavbar: React.FC = () => {
  const me = useGetMe();
  const currentLocale = getClientLocale();

  const toggleLanguage = () => {
    const nextLocale = currentLocale === "ar" ? "en" : "ar";
    if (typeof document !== "undefined") {
      document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`;
    }
    dynamicActivateLocale(nextLocale);
  };

  return (
    <header className={classes.navbar}>
      <div className={classes.navContent}>
        <div className={classes.navRight}>
          <div className={classes.logo}>
            <Link to="/">
              <img
                src="/images/IUEvent2.png"
                alt="الجامعة الإسلامية بالمدينة المنورة"
              />
            </Link>
          </div>
          <nav className={classes.navLinks} aria-label="القائمة الرئيسية">
            <NavLink
              to="/"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
              end
            >
              الرئيسية
            </NavLink>
            <NavLink
              to="/events"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
            >
              الفعاليات
            </NavLink>
            <NavLink
              to="/about"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
            >
              عن المنصة
            </NavLink>
            <NavLink
              to="/my-registrations"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
            >
              تسجيلاتي
            </NavLink>
          </nav>
        </div>

        <div className={classes.navLeft}>
          <button
            className="btn outline"
            type="button"
            onClick={toggleLanguage}
            style={{padding: "8px 18px", fontSize: "14px"}}
          >
            {currentLocale === "ar" ? "English" : "العربية"}
          </button>

          {me.isSuccess ? (
            <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
              <Link
                to="/manage/events"
                className="btn solid"
                style={{padding: "8px 20px", fontSize: "14px"}}
              >
                لوحة المنظم
              </Link>
            </div>
          ) : typeof window !== "undefined" && localStorage.getItem("iu_attendee_token") ? (
            <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
              <Link
                to="/my-registrations"
                className="btn solid"
                style={{padding: "8px 18px", fontSize: "14px"}}
              >
                تذاكري وحسابي
              </Link>
            </div>
          ) : (
            <div style={{display: "flex", gap: "8px"}}>
              <Link
                to="/login"
                className="btn solid"
                style={{padding: "8px 20px", fontSize: "14px"}}
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default IUNavbar;

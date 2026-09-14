import React, {useState, useEffect} from "react";
import {NavLink, Link, useLocation, useNavigate} from "react-router";
import classes from "./IUNavbar.module.scss";
import {useGetMe} from "../../../queries/useGetMe";
import {attendeeClient} from "../../../api/attendee.client";
import {authClient} from "../../../api/auth.client";
import {useIULanguage} from "../../../context/IULanguageContext";

export const IUNavbar: React.FC = () => {
  const me = useGetMe();
  const {locale, toggleLanguage, t} = useIULanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasAttendeeToken, setHasAttendeeToken] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("iu_attendee_token") || localStorage.getItem("token"));
    }
    return false;
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = Boolean(
        localStorage.getItem("iu_attendee_token") || localStorage.getItem("token")
      );
      setHasAttendeeToken(token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location.pathname]);

  const isLoggedIn = hasAttendeeToken || Boolean(me.data);

  const handleLogout = async () => {
    attendeeClient.logout();
    if (me.data) {
      try {
        await authClient.logout();
      } catch {
        // ignore
      }
      localStorage.removeItem("token");
    }
    setHasAttendeeToken(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };

  return (
    <header className={classes.navbar}>
      <div className={classes.navContent}>
        <div className={classes.navRight}>
          <div className={classes.logo}>
            <Link to="/">
              <img
                src="/images/IUEvent2.png"
                alt={t("brand_title", "الجامعة الإسلامية بالمدينة المنورة")}
              />
            </Link>
          </div>
          <nav className={classes.navLinks} aria-label={t("brand_title", "القائمة الرئيسية")}>
            <NavLink
              to="/"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
              end
            >
              {t("nav_home", "الرئيسية")}
            </NavLink>
            <NavLink
              to="/events"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
            >
              {t("nav_events", "الفعاليات")}
            </NavLink>
            <NavLink
              to="/about"
              className={({isActive}) =>
                `${classes.navLink} ${isActive ? classes.active : ""}`
              }
            >
              {t("nav_about", "عن المنصة")}
            </NavLink>
            {isLoggedIn && (
              <NavLink
                to="/my-registrations"
                className={({isActive}) =>
                  `${classes.navLink} ${isActive ? classes.active : ""}`
                }
              >
                {t("nav_my_registrations", "تسجيلاتي")}
              </NavLink>
            )}
          </nav>
        </div>

        <div className={classes.navLeft}>
          <button
            className="btn outline"
            type="button"
            onClick={toggleLanguage}
            style={{padding: "8px 18px", fontSize: "14px"}}
            title={locale === "ar" ? "Switch to English" : "التحويل إلى العربية"}
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>

          {isLoggedIn ? (
            <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
              {me.isSuccess && (
                <Link
                  to="/manage/events"
                  className="btn outline"
                  style={{padding: "8px 18px", fontSize: "14px"}}
                >
                  {t("nav_organizer_dashboard", "لوحة المنظم")}
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn solid"
                style={{padding: "8px 18px", fontSize: "14px", cursor: "pointer"}}
              >
                {t("nav_logout", "تسجيل خروج")}
              </button>
            </div>
          ) : (
            <div style={{display: "flex", gap: "8px"}}>
              <Link
                to="/auth/login"
                className="btn solid"
                style={{padding: "8px 20px", fontSize: "14px"}}
              >
                {t("nav_login", "تسجيل الدخول")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default IUNavbar;

import React, {useEffect} from "react";
import {Outlet, useLocation} from "react-router";
import {IUNavbar} from "../../iu/IUNavbar";
import {IUFooter} from "../../iu/IUFooter";
import "../../../styles/iu/common.css";
import {useIULanguage} from "../../../context/IULanguageContext";

export const IUSiteLayout: React.FC = () => {
  const location = useLocation();
  const {dir, locale} = useIULanguage();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [location.pathname, dir, locale]);

  return (
    <div className="iu-page" dir={dir}>
      <IUNavbar />
      <main className="iu-main">
        <div key={`${location.pathname}_${locale}`} className="iu-page-transition">
          <Outlet />
        </div>
      </main>
      <IUFooter />
    </div>
  );
};

export default IUSiteLayout;

import React, {useEffect} from "react";
import {Outlet} from "react-router";
import {IUNavbar} from "../../iu/IUNavbar";
import {IUFooter} from "../../iu/IUFooter";
import "../../../styles/iu/common.css";

export const IUSiteLayout: React.FC = () => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  return (
    <div className="iu-page" dir="rtl">
      <IUNavbar />
      <main className="iu-main">
        <Outlet />
      </main>
      <IUFooter />
    </div>
  );
};

export default IUSiteLayout;

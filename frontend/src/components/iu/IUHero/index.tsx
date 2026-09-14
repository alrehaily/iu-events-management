import React from "react";
import classes from "./IUHero.module.scss";
import {useIULanguage} from "../../../context/IULanguageContext";

interface IUHeroProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const IUHero: React.FC<IUHeroProps> = ({
  title,
  description,
  children,
  style,
  className,
}) => {
  const {dir} = useIULanguage();

  return (
    <section className={`${classes.hero} ${className || ""}`} style={style} dir={dir}>
      <div className="container">
        {(title || description) && (
          <div className={classes.heroContent} dir={dir}>
            {title && <h1 className={classes.heroTitle}>{title}</h1>}
            {description && (
              <p className={classes.heroDescription}>{description}</p>
            )}
          </div>
        )}
        {children && (
          <div className={classes.heroChildrenWrapper} dir={dir}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default IUHero;

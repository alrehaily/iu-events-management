import React from "react";
import classes from "./IUHero.module.scss";

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
  return (
    <section className={`${classes.hero} ${className || ""}`} style={style}>
      <div className="container">
        {(title || description) && (
          <div className={classes.heroContent}>
            {title && <h1 className={classes.heroTitle}>{title}</h1>}
            {description && (
              <p className={classes.heroDescription}>{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default IUHero;

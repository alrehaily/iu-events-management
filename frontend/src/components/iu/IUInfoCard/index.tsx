import React from "react";
import classes from "./IUInfoCard.module.scss";

interface InfoItem {
  icon: string;
  label: string;
  value: string;
}

interface IUInfoCardProps {
  items: InfoItem[];
}

export const IUInfoCard: React.FC<IUInfoCardProps> = ({items}) => {
  return (
    <div className={classes.infoGrid}>
      {items.map((item, idx) => (
        <div key={idx} className={classes.infoCard}>
          <div className={classes.cardHeader}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <p className={classes.cardValue}>{item.value || "—"}</p>
        </div>
      ))}
    </div>
  );
};

export default IUInfoCard;

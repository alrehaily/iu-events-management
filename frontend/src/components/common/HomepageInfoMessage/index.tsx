import {Button} from "@mantine/core";
import {IconAlertCircle, IconArrowLeft, IconArrowRight, IconBuildingBank, IconCircleCheck, IconCircleX, IconClock, IconCreditCard, IconInfoCircle, IconSearch} from "@tabler/icons-react";
import classes from './HomepageInfoMessage.module.scss';
import React from "react";
import {useIULanguage} from "../../../context/IULanguageContext.tsx";

type StatusType =
    | 'info'
    | 'processing'
    | 'success'
    | 'warning'
    | 'error'
    | 'expired'
    | 'cancelled'
    | 'not_found'
    | 'awaiting_payment'
    | 'offline_payment';

const statusIcons = {
    info: IconInfoCircle,
    processing: IconClock,
    success: IconCircleCheck,
    warning: IconAlertCircle,
    error: IconAlertCircle,
    expired: IconClock,
    cancelled: IconCircleX,
    not_found: IconSearch,
    awaiting_payment: IconCreditCard,
    offline_payment: IconBuildingBank,
};

interface HomepageInfoMessageProps {
    message: React.ReactNode;
    subtitle?: string;
    link?: string;
    linkText?: string;
    status?: StatusType;
}

export const HomepageInfoMessage = ({
                                        message,
                                        subtitle,
                                        link,
                                        linkText,
                                        status = 'info',
                                    }: HomepageInfoMessageProps) => {
    const Icon = statusIcons[status];
    const {dir} = useIULanguage();
    const Arrow = dir === 'rtl' ? IconArrowLeft : IconArrowRight;

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <div className={classes.statusIcon}>
                    <Icon size={32} stroke={1.5} aria-hidden/>
                </div>

                <h2 className={classes.title}>{message}</h2>

                {subtitle && (
                    <p className={classes.subtitle}>{subtitle}</p>
                )}

                {(link && linkText) && (
                    <Button
                        component="a"
                        href={link}
                        rightSection={<Arrow size={16}/>}
                        className={classes.button}
                    >
                        {linkText}
                    </Button>
                )}
            </div>
        </div>
    );
};

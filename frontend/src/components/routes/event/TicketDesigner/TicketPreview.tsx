import {useGetEvent} from "../../../../queries/useGetEvent.ts";
import {useGetMe} from "../../../../queries/useGetMe.ts";
import {useGetEventSettings} from "../../../../queries/useGetEventSettings.ts";
import {t} from "@lingui/macro";
import {IdParam, LocationType, ProductPriceType, ProductType} from "../../../../types.ts";
import {AttendeeTicket} from "../../../common/AttendeeTicket";
import {resolveEventLocation} from "../../../../utilites/effectiveLocation.ts";
import classes from './TicketPreview.module.scss';

interface TicketDesignSettings {
    accent_color: string;
    logo_image_id: IdParam | null;
    footer_text: string | null;
    date_display_mode: 'START_DATE_TIME' | 'DATE_RANGE' | 'HIDDEN';
    enabled: boolean;
}

interface TicketPreviewProps {
    settings: TicketDesignSettings;
    eventId: IdParam;
    logoUrl?: string;
}

export const TicketPreview = ({settings, eventId, logoUrl}: TicketPreviewProps) => {
    const eventQuery = useGetEvent(eventId);
    const meQuery = useGetMe();
    const eventSettingsQuery = useGetEventSettings(eventId);

    const event = eventQuery.data;
    const user = meQuery.data;

    const eventSettings = eventSettingsQuery.data ?? event?.settings;
    if (!event || !user || !eventSettings) {
        return (
            <div className={classes.loadingState}>
                <p>{t`Loading preview...`}</p>
            </div>
        );
    }

    const mockProduct = {
        id: 1,
        title: t`General Admission`,
        price: 2500,
        type: ProductPriceType.Paid,
        product_type: ProductType.Ticket,
        is_hidden: false,
        sort_order: 1,
        description: "",
        is_hidden_without_promo_code: false
    };

    const mockAttendee = {
        id: 1,
        public_id: "PREVIEW12345",
        short_id: "P1234",
        first_name: user.first_name || "John",
        last_name: user.last_name || "Doe",
        email: user.email || "john.doe@example.com",
        status: "ACTIVE" as const,
        product_id: mockProduct.id,
        product: mockProduct,
        product_price_id: 1,
        order_id: 1,
    };

    const fallbackLocationDetails = {
        venue_name: t`Sample Venue`,
        address_line_1: t`123 Sample Street`,
    };
    const resolved = resolveEventLocation(event, null);
    const resolvedEventLocation = resolved?.type === LocationType.InPerson && resolved.location
        ? resolved
        : {
            id: 0,
            type: LocationType.InPerson,
            location: {name: fallbackLocationDetails.venue_name, structured_address: fallbackLocationDetails},
        };
    const eventWithDesignSettings = {
        ...event,
        event_location: resolvedEventLocation,
        settings: {
            ...eventSettings,
            ticket_design_settings: {
                accent_color: settings.accent_color,
                logo_image_id: settings.logo_image_id ?? undefined,
                footer_text: settings.footer_text ?? undefined,
                date_display_mode: settings.date_display_mode,
                enabled: settings.enabled
            },
        },
        images: logoUrl && settings.logo_image_id ? [
            ...((event.images || []).filter(img => img.type !== 'TICKET_LOGO')),
            {
                id: settings.logo_image_id,
                type: 'TICKET_LOGO' as const,
                url: logoUrl,
                size: 0,
                file_name: '',
                mime_type: ''
            }
        ] : (event.images || []).filter(img => img.type !== 'TICKET_LOGO')
    };

    return (
        <div className={classes.previewWrapper}>
            <AttendeeTicket
                event={eventWithDesignSettings}
                attendee={mockAttendee}
                product={mockProduct}
                hideButtons={true}
            />
        </div>
    );
};

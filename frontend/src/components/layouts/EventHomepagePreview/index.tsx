import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {LoadingOverlay} from "@mantine/core";
import {Event, HomepageThemeSettings} from "../../../types.ts";
import {useGetEventPublic} from "../../../queries/useGetEventPublic.ts";
import {EventNotAvailable} from "../EventHomepage/EventNotAvailable";
import EventHomepage from "../EventHomepage";

interface PreviewSettings {
    homepage_theme_settings?: Partial<HomepageThemeSettings>;
    continue_button_text?: string;
    get_tickets_button_text?: string;
    is_certificate_eligible?: boolean;
    target_audience?: string;
    certificate_info?: string;
    requirements_info?: string;
    event_highlights?: string;
    attendee_notice?: string;
}

const EventHomepagePreview = () => {
    const {eventId} = useParams();
    const {data: event, isFetched, isLoading} = useGetEventPublic(eventId);
    const [previewSettings, setPreviewSettings] = useState<PreviewSettings | null>(null);

    useEffect(() => {
        const handleMessage = (messageEvent: MessageEvent) => {
            if (messageEvent.data.type === "UPDATE_SETTINGS") {
                setPreviewSettings(messageEvent.data.settings);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (!isFetched || isLoading) {
        return <LoadingOverlay visible />;
    }

    if (!event) {
        return <EventNotAvailable />;
    }

    // Create a modified event with preview settings merged in
    let previewEvent: Event | undefined = event;

    if (previewSettings && event.settings) {
        previewEvent = {
            ...event,
            is_certificate_eligible: previewSettings.is_certificate_eligible ?? event.is_certificate_eligible,
            settings: {
                ...event.settings,
                homepage_theme_settings: previewSettings.homepage_theme_settings as HomepageThemeSettings || event.settings.homepage_theme_settings,
                continue_button_text: previewSettings.continue_button_text ?? event.settings.continue_button_text,
                get_tickets_button_text: previewSettings.get_tickets_button_text ?? event.settings.get_tickets_button_text,
                is_certificate_eligible: previewSettings.is_certificate_eligible ?? event.settings.is_certificate_eligible,
                target_audience: previewSettings.target_audience ?? event.settings.target_audience,
                certificate_info: previewSettings.certificate_info ?? event.settings.certificate_info,
                requirements_info: previewSettings.requirements_info ?? event.settings.requirements_info,
                event_highlights: previewSettings.event_highlights ?? event.settings.event_highlights,
                attendee_notice: previewSettings.attendee_notice ?? event.settings.attendee_notice,
            }
        };
    }

    return (
        <EventHomepage
            event={previewEvent}
            promoCodeValid={undefined}
            promoCode={undefined}
        />
    );
};

export default EventHomepagePreview;

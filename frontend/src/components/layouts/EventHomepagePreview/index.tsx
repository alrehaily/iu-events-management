import {useState} from "react";
import {useLoaderData} from "react-router";
import {Event, HomepageThemeSettings} from "../../../types.ts";
import {useHomepagePreviewSettings} from "../../../hooks/useHomepagePreview.ts";
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
    const event = useLoaderData<Event | null>();
    const [previewSettings, setPreviewSettings] = useState<PreviewSettings | null>(null);
    useHomepagePreviewSettings<PreviewSettings>("UPDATE_SETTINGS", setPreviewSettings);

    if (!event) {
        return <div inert><EventNotAvailable /></div>;
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
            preview
            promoCodeValid={undefined}
            promoCode={undefined}
        />
    );
};

export default EventHomepagePreview;

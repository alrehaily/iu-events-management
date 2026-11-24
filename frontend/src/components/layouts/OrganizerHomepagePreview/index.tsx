import {useState} from "react";
import {useLoaderData, useParams} from "react-router";
import {useGetOrganizerSettings} from "../../../queries/useGetOrganizerSettings.ts";
import {LoadingMask} from "../../common/LoadingMask";
import OrganizerHomepage from "../OrganizerHomepage";
import {HomepageThemeSettings, Organizer} from "../../../types.ts";
import {useHomepagePreviewSettings} from "../../../hooks/useHomepagePreview.ts";
import {t} from "@lingui/macro";

interface PreviewSettings {
    logoUrl?: string;
    coverUrl?: string;
    homepage_theme_settings?: HomepageThemeSettings;
}

const OrganizerHomepagePreview = () => {
    const {organizerId} = useParams();

    const {organizer, eventsData} = useLoaderData() as {
        organizer: Organizer | null;
        eventsData: any;
        isPastEvents: boolean;
    };

    const organizerSettingsQuery = useGetOrganizerSettings(organizerId);
    const [previewSettings, setPreviewSettings] = useState<PreviewSettings | null>(null);
    useHomepagePreviewSettings<PreviewSettings>("UPDATE_ORGANIZER_SETTINGS", setPreviewSettings);

    if (organizer && organizerSettingsQuery.isLoading) {
        return <LoadingMask/>;
    }

    if (!organizer || !organizerSettingsQuery.data) {
        return <p role="alert">{t`Organizer page not available`}</p>;
    }

    // Merge preview settings with actual data
    const previewOrganizer = {
        ...organizer,
        images: organizer.images?.map(img => {
            if (img.type === 'ORGANIZER_LOGO' && previewSettings?.logoUrl) {
                return {...img, url: previewSettings.logoUrl};
            }
            if (img.type === 'ORGANIZER_COVER' && previewSettings?.coverUrl) {
                return {...img, url: previewSettings.coverUrl};
            }
            return img;
        }),
        settings: {
            ...organizerSettingsQuery.data,
            homepage_theme_settings: previewSettings?.homepage_theme_settings || organizerSettingsQuery.data.homepage_theme_settings,
        }
    };

    return <OrganizerHomepage
        organizer={previewOrganizer}
        eventsData={eventsData}
        isPastEvents={false}
        preview
    />;
};

export default OrganizerHomepagePreview;

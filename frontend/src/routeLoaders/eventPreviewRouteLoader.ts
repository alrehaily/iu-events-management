import {isAxiosError} from "axios";
import {LoaderFunctionArgs} from "react-router";
import {getEventPublicQuery} from "../queries/useGetEventPublic.ts";
import {getQueryClient} from "../utilites/ssrQueryClient.ts";

export const eventPreviewRouteLoader = async ({params}: LoaderFunctionArgs) => {
    try {
        return await getQueryClient().fetchQuery(getEventPublicQuery(params.eventId, null, false));
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
    }
};

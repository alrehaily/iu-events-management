import {useQuery} from "@tanstack/react-query";
import {QueryFilters} from "../types.ts";
import {eventsClientPublic} from "../api/event.client.ts";

export const GET_EVENTS_PUBLIC_QUERY = 'getEventsPublic';

export const useGetEventsPublic = (pagination?: QueryFilters, options?: {enabled?: boolean}) => {
    return useQuery({
        ...getEventsPublicQuery(pagination),
        enabled: options?.enabled ?? true
    });
};

export const getEventsPublicQuery = (pagination?: QueryFilters) => ({
    queryKey: [GET_EVENTS_PUBLIC_QUERY, pagination],

    queryFn: async () => {
        return await eventsClientPublic.all(pagination);
    }
});

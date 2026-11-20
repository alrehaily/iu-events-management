import type {QueryClient} from "@tanstack/react-query";
import type {SupportedLocales} from "../locales.ts";

interface SsrRequestContext {
    queryClient: QueryClient;
    locale: SupportedLocales;
    token?: string;
}

let readSsrRequest: () => SsrRequestContext | undefined = () => undefined;

export const configureSsrRequestContext = (read: typeof readSsrRequest) => {
    readSsrRequest = read;
};

export const getSsrRequestContext = () => readSsrRequest();

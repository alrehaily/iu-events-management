import type {AxiosRequestHeaders} from "axios";
import {getClientLocale} from "../locales.ts";
import {getSsrRequestContext} from "./ssrRequestContext.ts";

export const setInterfaceRequestHeaders = (headers: AxiosRequestHeaders) => {
    const request = getSsrRequestContext();
    if (request?.token) {
        headers.set("Authorization", `Bearer ${request.token}`, false);
    }
    headers.set("Accept-Language", request?.locale ?? getClientLocale(), false);
};

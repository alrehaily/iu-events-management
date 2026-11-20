import {getSsrRequestContext} from "./ssrRequestContext.ts";
import {queryClient} from "./queryClient.ts";

export const getQueryClient = () => getSsrRequestContext()?.queryClient ?? queryClient;

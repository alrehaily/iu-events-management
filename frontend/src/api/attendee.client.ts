import {api} from "./client";
import {Attendee, GenericDataResponse, GenericPaginatedResponse, IdParam, QueryFilters, TaxAndFee} from "../types";
import {queryParamsHelper} from "../utilites/queryParamsHelper.ts";
import {publicApi} from "./public-client.ts";
import {SupportedLocales} from "../locales.ts";

export interface EditAttendeeRequest {
    first_name: string;
    last_name: string;
    email: string;
    notes?: string;
    product_id?: IdParam;
    product_price_id?: IdParam;
    status?: string;
}

export interface CreateAttendeeRequest extends EditAttendeeRequest {
    amount_paid: number;
    send_confirmation_email: boolean;
    taxes_and_fees: TaxAndFee[];
    locale: SupportedLocales;
    event_occurrence_id?: number | null;
    override_capacity?: boolean;
}

export const attendeesClient = {
    create: async (eventId: IdParam, attendee: CreateAttendeeRequest) => {
        const response = await api.post<GenericDataResponse<Attendee>>(
            `events/${eventId}/attendees`, attendee
        );
        return response.data;
    },
    update: async (eventId: IdParam, attendeeId: IdParam, attendee: EditAttendeeRequest) => {
        const response = await api.put<GenericDataResponse<Attendee>>(
            `events/${eventId}/attendees/${attendeeId}`, attendee
        );
        return response.data;
    },
    modify: async (eventId: IdParam, attendeeId: IdParam, attendee: Partial<EditAttendeeRequest>) => {
        const response = await api.patch<GenericDataResponse<Attendee>>(
            `events/${eventId}/attendees/${attendeeId}`, attendee
        );
        return response.data;
    },
    all: async (eventId: IdParam, queryFilters: QueryFilters) => {
        const response = await api.get<GenericPaginatedResponse<Attendee>>(
            `/events/${eventId}/attendees` + queryParamsHelper.buildQueryString(queryFilters)
        );
        return response.data;
    },
    findById: async (eventId: IdParam, attendeeId: IdParam) => {
        const response = await api.get<GenericDataResponse<Attendee>>(`events/${eventId}/attendees/${attendeeId}`);
        return response.data;
    },
    checkIn: async (eventId: IdParam, attendeePublicId: string, action: 'check_in' | 'check_out') => {
        const response = await api.post<GenericDataResponse<Attendee>>(`events/${eventId}/attendees/${attendeePublicId}/check_in`, {
            action: action,
        });
        return response.data;
    },
    export: async (eventId: IdParam, eventOccurrenceId?: number | null): Promise<Blob> => {
        const body = eventOccurrenceId ? {event_occurrence_id: eventOccurrenceId} : {};
        const response = await api.post(`events/${eventId}/attendees/export`, body, {
            responseType: 'blob',
        });

        return new Blob([response.data]);
    },
    resendTicket: async (eventId: IdParam, attendeeId: IdParam) => {
        return await api.post(`events/${eventId}/attendees/${attendeeId}/resend-ticket`);
    },
};

export const attendeeClientPublic = {
    findByShortId: async (eventId: IdParam, attendeeShortId: string) => {
        const response = await publicApi.get<GenericDataResponse<Partial<Attendee>>>(`events/${eventId}/attendees/${attendeeShortId}`);
        return response.data;
    },
};

export interface AttendeeRegistrationData {
  order_id: number;
  short_id: string;
  status: string;
  total_gross: number;
  currency: string;
  created_at: string;
  event: {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    short_id: string;
    status: string;
    is_certificate_eligible: boolean;
  } | null;
  attendees: Array<{
    id: number;
    short_id: string;
    public_id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    product_title: string;
    checked_in: boolean;
    checked_in_at: string | null;
    is_certificate_eligible: boolean;
    certificate_code?: string;
    certificate_url: string | null;
  }>;
}

export interface CertificateData {
  eligible: boolean;
  certificate_code: string;
  attendee_name: string;
  attendee_email: string;
  event_title: string;
  event_date: string;
  location: string;
  issued_at: string;
  issuer: string;
  checked_in: boolean;
  verification_url: string;
  message?: string;
}

export interface AttendeeUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export const attendeeClient = {
  async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }): Promise<{token: string; user: AttendeeUser; message: string}> {
    const response = await publicApi.post<{token: string; user: AttendeeUser; message: string}>(
      "/attendee/register",
      data
    );
    if (response.data.token && typeof localStorage !== "undefined") {
      localStorage.setItem("iu_attendee_token", response.data.token);
      localStorage.setItem("iu_attendee_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{token: string; user: AttendeeUser; message: string}> {
    const response = await publicApi.post<{token: string; user: AttendeeUser; message: string}>(
      "/attendee/login",
      data
    );
    if (response.data.token && typeof localStorage !== "undefined") {
      localStorage.setItem("iu_attendee_token", response.data.token);
      localStorage.setItem("iu_attendee_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async me(): Promise<{user: AttendeeUser} | null> {
    if (typeof localStorage === "undefined") return null;
    const token = localStorage.getItem("iu_attendee_token");
    if (!token) return null;

    try {
      const response = await publicApi.get<{user: AttendeeUser}>("/attendee/me", {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch {
      localStorage.removeItem("iu_attendee_token");
      localStorage.removeItem("iu_attendee_user");
      return null;
    }
  },

  getStoredUser(): AttendeeUser | null {
    if (typeof localStorage === "undefined") return null;
    const userStr = localStorage.getItem("iu_attendee_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  logout(): void {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("iu_attendee_token");
      localStorage.removeItem("iu_attendee_user");
    }
  },

  async getRegistrations(email?: string): Promise<{registrations: AttendeeRegistrationData[]}> {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("iu_attendee_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const params: Record<string, string> = {};
    if (email) {
      params["email"] = email;
    }

    const response = await publicApi.get<{registrations: AttendeeRegistrationData[]}>(
      "/attendee/registrations",
      {headers, params}
    );
    return response.data;
  },

  async cancelRegistration(orderShortId: string): Promise<{message: string}> {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("iu_attendee_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await publicApi.post<{message: string}>(
      `/attendee/registrations/${orderShortId}/cancel`,
      {},
      {headers}
    );
    return response.data;
  },

  async getCertificate(attendeeIdentifier: string): Promise<CertificateData> {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("iu_attendee_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await publicApi.get<CertificateData>(
      `/attendees/${attendeeIdentifier}/certificate`,
      {headers}
    );
    return response.data;
  },

  async verifyCertificate(certificateCode: string): Promise<{valid: boolean; certificate?: any; message?: string}> {
    const response = await publicApi.get<{valid: boolean; certificate?: any; message?: string}>(
      `/certificates/verify/${certificateCode}`
    );
    return response.data;
  },
};

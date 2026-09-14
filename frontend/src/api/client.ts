import axios from "axios";
import {isSsr} from "../utilites/helpers.ts";
import {getConfig} from "../utilites/config.ts";

const BASE_URL = isSsr()
    ? getConfig('VITE_API_URL_SERVER')
    : getConfig('VITE_API_URL_CLIENT');
const LOGIN_PATH = "/auth/login";
const PREVIOUS_URL_KEY = 'previous_url';

/**
 * Determines whether a given pathname belongs to a public route
 * that should never trigger an automatic forced redirect on 401/403 errors.
 */
export const isPublicPath = (pathname: string): boolean => {
    if (!pathname) return true;

    // Normalize path by stripping trailing slashes (except root "/")
    const normalized = pathname.replace(/\/+$/, '') || '/';

    // The root path is the public university homepage
    if (normalized === '/') {
        return true;
    }

    // Public exact paths or path prefixes
    const publicPrefixes = [
        '/events',
        '/about',
        '/my-registrations',
        '/login',
        '/register',
        '/auth',
        '/manage/login',
        '/event',
        '/e',
        '/o',
        '/organizer',
        '/widget',
        '/checkout',
        '/order',
        '/product',
        '/check-in',
        '/my-tickets',
        '/public',
        '/print',
    ];

    return publicPrefixes.some((prefix) => {
        return normalized === prefix || normalized.startsWith(prefix + '/');
    });
};

export const ALLOWED_UNAUTHENTICATED_PATHS = [
    '/',
    'auth/login',
    'manage/login',
    'auth/organizer-login',
    'accept-invitation',
    'register',
    'forgot-password',
    'auth',
    'account/payment',
    'checkout',
    '/event/',
    'print',
    '/order/',
    'widget',
    '/product/',
    'check-in',
    '/events',
    'about',
    'my-registrations',
    'login',
    'register',
    'public',
    'my-tickets',
];

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            return Promise.reject(error);
        }
        const { status } = error.response;
        const currentPath = typeof window !== 'undefined' ? (window.location?.pathname || '/') : '/';
        const isPublic = isPublicPath(currentPath);
        const isAuthError = status === 401 || status === 403;

        if (status === 403 && error.response.data?.error_code === 'ACCOUNT_PENDING_DELETION') {
            if (!currentPath.startsWith('/account')) {
                window?.location?.replace('/account/danger-zone');
            }
            return Promise.reject(error);
        }

        // Only redirect on authentication error if we are on a protected route.
        // Public pages (home, events catalog, about, event preview, etc.) must NEVER force redirect visitors to login.
        if (isAuthError && !isPublic) {
            // Store the current URL before redirecting to the login page
            window?.localStorage?.setItem(PREVIOUS_URL_KEY, window?.location.href);
            // Preserve query params (UTM tracking) during redirect
            const searchParams = window?.location?.search || '';
            const isOrganizerProtectedPath = currentPath.startsWith('/manage') || currentPath.startsWith('/admin') || currentPath.startsWith('/account') || currentPath.startsWith('/welcome');
            const targetLogin = isOrganizerProtectedPath
                ? '/manage/login'
                : LOGIN_PATH;
            window?.location?.replace(targetLogin + searchParams);
        }

        return Promise.reject(error);
    }
);

axios.defaults.withCredentials = true;

export const redirectToPreviousUrl = () => {
    const previousUrl = window?.localStorage?.getItem(PREVIOUS_URL_KEY) || '/manage/events';
    window?.localStorage?.removeItem(PREVIOUS_URL_KEY);
    if (typeof window !== "undefined") {
        // If the stored URL is invalid, a login route, or a public route, default to organizer events
        if (!previousUrl || previousUrl.includes('/login') || previousUrl === '/' || isPublicPath(new URL(previousUrl, window.location.origin).pathname)) {
            window.location.href = '/manage/events';
            return;
        }
        window.location.href = previousUrl;
    }
};

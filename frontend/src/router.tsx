import { Navigate, RouteObject } from "react-router";
import ErrorPage from "./error-page.tsx";
import { publicEventRouteLoader } from "./routeLoaders/publicEventRouteLoader.ts";
import { publicOrganizerRouteLoader } from "./routeLoaders/publicOrganizerRouteLoader.ts";
import { organizerPreviewRouteLoader } from "./routeLoaders/organizerPreviewRouteLoader.ts";
import { isMidtermDemoEnabled } from "./utilites/demoGates.ts";

const lazyDemoGated = (importFn: () => Promise<any>, isGated: boolean = true) => {
    return async () => {
        if (isGated && isMidtermDemoEnabled) {
            const DemoUnavailable = await import("./components/common/DemoUnavailable");
            return { Component: DemoUnavailable.default };
        }
        const module = await importFn();
        return { Component: module.default };
    };
};

export const router: RouteObject[] = [
    {
        path: "/",
        async lazy() {
            const SiteLayout = await import("./components/layouts/IUSiteLayout");
            return { Component: SiteLayout.default };
        },
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                async lazy() {
                    const Home = await import("./components/routes/home");
                    return { Component: Home.default };
                }
            },
            {
                path: "events",
                async lazy() {
                    const EventsCatalog = await import("./components/routes/events-catalog");
                    return { Component: EventsCatalog.default };
                }
            },
            {
                path: "about",
                async lazy() {
                    const About = await import("./components/routes/about");
                    return { Component: About.default };
                }
            },
            {
                path: "my-registrations",
                lazy: lazyDemoGated(() => import("./components/routes/my-registrations")),
            },
            {
                path: "login",
                element: <Navigate to="/auth/login" replace />
            },
        ]
    },
    {
        path: "register",
        errorElement: <ErrorPage />,
        async lazy() {
            const AuthLayout = await import("./components/layouts/AuthLayout");
            return { Component: AuthLayout.default };
        },
        children: [
            {
                index: true,
                async lazy() {
                    const AttendeeRegister = await import("./components/routes/attendee-auth/AttendeeRegister");
                    return { Component: AttendeeRegister.default };
                }
            }
        ]
    },
    {
        path: "manage/login",
        errorElement: <ErrorPage />,
        async lazy() {
            const AuthLayout = await import("./components/layouts/AuthLayout");
            return { Component: AuthLayout.default };
        },
        children: [
            {
                index: true,
                async lazy() {
                    const OrganizerLogin = await import("./components/routes/auth/OrganizerLogin");
                    return { Component: OrganizerLogin.default };
                }
            }
        ]
    },
    {
        path: "auth/organizer-login",
        errorElement: <ErrorPage />,
        element: <Navigate to="/manage/login" replace />
    },
    {
        path: "auth",
        async lazy() {
            const AuthLayout = await import("./components/layouts/AuthLayout");
            return { Component: AuthLayout.default };
        },
        errorElement: <ErrorPage />,
        children: [
            {
                path: "login",
                async lazy() {
                    const Login = await import("./components/routes/auth/Login");
                    return { Component: Login.default };
                },
            },
            {
                path: "register",
                element: <Navigate to="/manage/login" replace />
            },
            {
                path: "forgot-password",
                async lazy() {
                    const ForgotPassword = await import("./components/routes/auth/ForgotPassword");
                    return { Component: ForgotPassword.default };
                }
            },
            {
                path: "reset-password/:token",
                async lazy() {
                    const ResetPassword = await import("./components/routes/auth/ResetPassword");
                    return { Component: ResetPassword.default };
                }
            },
            {
                path: "accept-invitation/:token",
                async lazy() {
                    const AcceptInvitation = await import("./components/routes/auth/AcceptInvitation");
                    return { Component: AcceptInvitation.default };
                }
            }
        ]
    },
    {
        path: "manage",
        errorElement: <ErrorPage />,
        async lazy() {
            const DefaultLayout = await import("./components/layouts/DefaultLayout");
            return { Component: DefaultLayout.default };
        },
        children: [
            {
                path: "events/:eventsState?",
                async lazy() {
                    const Dashboard = await import("./components/routes/events/Dashboard");
                    return { Component: Dashboard.default };
                },
            },
            {
                path: "account",
                async lazy() {
                    const ManageAccount = await import("./components/routes/account/ManageAccount");
                    return { Component: ManageAccount.default };
                }
            },
            {
                path: "profile",
                async lazy() {
                    const ManageProfile = await import("./components/routes/profile/ManageProfile");
                    return { Component: ManageProfile.default };
                }
            },
            {
                path: "profile/confirm-email-change/:token",
                async lazy() {
                    const ConfirmEmailChange = await import("./components/routes/profile/ConfirmEmailChange");
                    return { Component: ConfirmEmailChange.default };
                }
            },
            {
                path: "profile/confirm-email-address/:token",
                async lazy() {
                    const ConfirmEmailAddress = await import("./components/routes/profile/ConfirmEmailAddress");
                    return { Component: ConfirmEmailAddress.default };
                }
            },
        ]
    },
    {
        path: "welcome",
        async lazy() {
            const WelcomeLayout = await import("./components/layouts/WelcomeLayout");
            return { Component: WelcomeLayout.default };
        },
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                async lazy() {
                    const Welcome = await import("./components/routes/welcome");
                    return { Component: Welcome.default };
                }
            },
        ]
    },
    {
        path: "admin",
        errorElement: <ErrorPage />,
        async lazy() {
            const AdminLayout = await import("./components/layouts/Admin");
            return { Component: AdminLayout.default };
        },
        children: [
            {
                path: "",
                async lazy() {
                    const Dashboard = await import("./components/routes/admin/Dashboard");
                    return { Component: Dashboard.default };
                }
            },
            {
                path: "accounts",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Accounts")),
            },
            {
                path: "accounts/:accountId",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Accounts/AccountDetail")),
            },
            {
                path: "deletion-requests",
                lazy: lazyDemoGated(() => import("./components/routes/admin/DeletionRequests")),
            },
            {
                path: "users",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Users")),
            },
            {
                path: "events",
                async lazy() {
                    const Events = await import("./components/routes/admin/Events");
                    return { Component: Events.default };
                }
            },
            {
                path: "orders",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Orders")),
            },
            {
                path: "attribution",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Attribution")),
            },
            {
                path: "configurations",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Configurations")),
            },
            {
                path: "failed-jobs",
                lazy: lazyDemoGated(() => import("./components/routes/admin/FailedJobs")),
            },
            {
                path: "messages",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Messages")),
            },
            {
                path: "spam-events",
                lazy: lazyDemoGated(() => import("./components/routes/admin/SpamEvents")),
            },
            {
                path: "announcements",
                lazy: lazyDemoGated(() => import("./components/routes/admin/Announcements")),
            }
        ]
    },
    {
        path: "account",
        errorElement: <ErrorPage />,
        async lazy() {
            const DefaultLayout = await import("./components/layouts/DefaultLayout");
            return { Component: DefaultLayout.default };
        },
        children: [
            {
                path: "",
                async lazy() {
                    const ManageAccount = await import("./components/routes/account/ManageAccount");
                    return { Component: ManageAccount.default };
                },
                children: [
                    {
                        path: "settings",
                        async lazy() {
                            const AccountSettings = await import("./components/routes/account/ManageAccount/sections/AccountSettings");
                            return { Component: AccountSettings.default };
                        }
                    },
                    {
                        path: "taxes-and-fees",
                        lazy: lazyDemoGated(() => import("./components/routes/account/ManageAccount/sections/TaxSettings")),
                    },
                    {
                        path: "event-defaults",
                        async lazy() {
                            const EventDefaultsSettings = await import("./components/routes/account/ManageAccount/sections/EventDefaultsSettings");
                            return { Component: EventDefaultsSettings.default };
                        }
                    },
                    {
                        path: "users",
                        async lazy() {
                            const Users = await import("./components/routes/account/ManageAccount/sections/Users");
                            return { Component: Users.default };
                        }
                    },
                    {
                        path: "danger-zone",
                        lazy: lazyDemoGated(() => import("./components/routes/account/ManageAccount/sections/DangerZone")),
                    },
                ]
            },
        ]
    },
    {
        path: "/manage/organizer/:organizerId?",
        async lazy() {
            const Dashboard = await import("./components/layouts/OrganizerLayout");
            return { Component: Dashboard.default };
        },
        errorElement: <ErrorPage />,
        children: [
            {
                path: "dashboard?",
                async lazy() {
                    const OrganizerDashboard = await import("./components/routes/organizer/OrganizerDashboard");
                    return { Component: OrganizerDashboard.default };
                }
            },
            {
                path: "events/:eventsState?",
                async lazy() {
                    const Events = await import("./components/routes/organizer/Events");
                    return { Component: Events.default };
                }
            },
            {
                path: "settings",
                lazy: lazyDemoGated(() => import("./components/routes/organizer/Settings")),
            },
            {
                path: "organizer-homepage-designer",
                async lazy() {
                    const OrganizerHomepageDesigner = await import("./components/routes/organizer/OrganizerHomepageDesigner");
                    return { Component: OrganizerHomepageDesigner.default };
                }
            },
            {
                path: "webhooks",
                lazy: lazyDemoGated(() => import("./components/routes/organizer/Webhooks")),
            },
            {
                path: "locations",
                async lazy() {
                    const Locations = await import("./components/routes/organizer/Locations");
                    return { Component: Locations.default };
                }
            },
            {
                path: "payments",
                lazy: lazyDemoGated(() => import("./components/routes/organizer/Payments/Redirect")),
            },
            {
                path: "reports",
                lazy: lazyDemoGated(() => import("./components/routes/organizer/Reports")),
            },
            {
                path: "report/:reportType",
                lazy: lazyDemoGated(() => import("./components/routes/organizer/Reports/ReportLayout")),
            }
        ],
    },
    {
        path: "/manage/event/:eventId",
        async lazy() {
            const EventLayout = await import("./components/layouts/Event");
            return { Component: EventLayout.default };
        },
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                async lazy() {
                    const EventDashboard = await import("./components/routes/event/EventDashboard");
                    return { Component: EventDashboard.default };
                }
            },
            {
                path: "dashboard",
                async lazy() {
                    const EventDashboard = await import("./components/routes/event/EventDashboard");
                    return { Component: EventDashboard.default };
                }
            },
            {
                path: "getting-started",
                element: <Navigate to="../dashboard" replace={true} />
            },
            {
                path: "reports",
                lazy: lazyDemoGated(() => import("./components/routes/event/Reports")),
            },
            {
                path: "report/:reportType",
                lazy: lazyDemoGated(() => import("./components/routes/event/Reports/ReportLayout")),
            },
            {
                path: "products",
                async lazy() {
                    const products = await import("./components/routes/event/products");
                    return { Component: products.default };
                }
            },
            {
                path: "attendees",
                lazy: lazyDemoGated(() => import("./components/routes/event/attendees")),
            },
            {
                path: "questions",
                lazy: lazyDemoGated(() => import("./components/routes/event/questions")),
            },
            {
                path: "orders",
                lazy: lazyDemoGated(() => import("./components/routes/event/orders")),
            },
            {
                path: "promo-codes",
                lazy: lazyDemoGated(() => import("./components/routes/event/promo-codes")),
            },
            {
                path: "affiliates",
                lazy: lazyDemoGated(() => import("./components/routes/event/Affiliates")),
            },
            {
                path: "check-in",
                lazy: lazyDemoGated(() => import("./components/routes/event/CheckInLists")),
            },
            {
                path: "messages",
                lazy: lazyDemoGated(() => import("./components/routes/event/messages")),
            },
            {
                path: "settings",
                async lazy() {
                    const Settings = await import("./components/routes/event/Settings");
                    return { Component: Settings.default };
                }
            },
            {
                path: "widget",
                lazy: lazyDemoGated(() => import("./components/routes/event/widget")),
            },
            {
                path: "homepage-designer",
                async lazy() {
                    const HomepageDesigner = await import("./components/routes/event/HomepageDesigner");
                    return { Component: HomepageDesigner.default };
                }
            },
            {
                path: "ticket-designer",
                async lazy() {
                    const TicketDesigner = await import("./components/routes/event/TicketDesigner");
                    return { Component: TicketDesigner.default };
                }
            },
            {
                path: "sold-out-waitlist",
                lazy: lazyDemoGated(() => import("./components/routes/event/SoldOutWaitlist")),
            },
            {
                path: "occurrences",
                async lazy() {
                    const OccurrencesTab = await import("./components/routes/event/OccurrencesTab");
                    return {Component: OccurrencesTab.default};
                }
            },
            {
                path: "occurrences/calendar",
                async lazy() {
                    const OccurrencesTab = await import("./components/routes/event/OccurrencesTab");
                    return {Component: OccurrencesTab.default};
                }
            },
            {
                path: "occurrences/:occurrenceId",
                async lazy() {
                    const OccurrenceDetail = await import("./components/routes/event/OccurrenceDetail");
                    return {Component: OccurrenceDetail.default};
                }
            },
            {
                path: "capacity-assignments",
                lazy: lazyDemoGated(() => import("./components/routes/event/CapacityAssignments")),
            },
            {
                path: "webhooks",
                lazy: lazyDemoGated(() => import("./components/routes/event/Webhooks")),
            }
        ]
    },
    {
        path: "/events/:organizerId/:organizerSlug",
        loader: publicOrganizerRouteLoader,
        async lazy() {
            const PublicOrganizer = await import("./components/layouts/PublicOrganizer");
            return { Component: PublicOrganizer.default };
        },
        errorElement: <ErrorPage />,
    },
    {
        path: "/events/:organizerId/:organizerSlug/past-events",
        loader: publicOrganizerRouteLoader,
        async lazy() {
            const PublicOrganizer = await import("./components/layouts/PublicOrganizer");
            return { Component: PublicOrganizer.default };
        },
        errorElement: <ErrorPage />,
    },
    {
        path: "/e/:eventId/:eventSlug",
        async lazy() {
            const EventHomepage = await import("./components/layouts/EventHomepage");
            return { Component: EventHomepage.default };
        },
        errorElement: <ErrorPage />,
    },
    {
        path: "/event/:eventId/preview",
        async lazy() {
            const EventHomepagePreview = await import("./components/layouts/EventHomepagePreview");
            return { Component: EventHomepagePreview.default };
        },
    },
    {
        path: "/organizer/:organizerId/preview",
        loader: organizerPreviewRouteLoader,
        async lazy() {
            const OrganizerHomepagePreview = await import("./components/layouts/OrganizerHomepagePreview");
            return { Component: OrganizerHomepagePreview.default };
        },
    },
    {
        path: "/event/:eventId",
        loader: publicEventRouteLoader,
        async lazy() {
            const PublicEvent = await import("./components/layouts/PublicEvent");
            return { Component: PublicEvent.default };
        },
        errorElement: <ErrorPage />,
    },
    {
        path: "/event/:eventId/:eventSlug",
        loader: publicEventRouteLoader,
        async lazy() {
            const PublicEvent = await import("./components/layouts/PublicEvent");
            return { Component: PublicEvent.default };
        },
        errorElement: <ErrorPage />,
    },
    {
        path: "/event/:eventId/register",
        lazy: lazyDemoGated(() => import("./components/layouts/Checkout")),
        errorElement: <ErrorPage />,
    },
    {
        path: "/event/:eventId/:eventSlug/register",
        lazy: lazyDemoGated(() => import("./components/layouts/Checkout")),
        errorElement: <ErrorPage />,
    },
    {
        path: "/widget/:eventId",
        lazy: lazyDemoGated(() => import("./components/layouts/ProductWidget")),
        errorElement: <ErrorPage />,
    },
    {
        path: "/checkout/:eventId",
        lazy: lazyDemoGated(() => import("./components/layouts/Checkout")),
        errorElement: <ErrorPage />,
        children: [
            {
                path: ":orderShortId/details",
                lazy: lazyDemoGated(() => import("./components/routes/product-widget/CollectInformation")),
            },
            {
                path: ":orderShortId/payment",
                lazy: lazyDemoGated(() => import("./components/routes/product-widget/Payment")),
            },
            {
                path: ":orderShortId/summary",
                lazy: lazyDemoGated(() => import("./components/routes/product-widget/OrderSummaryAndProducts")),
            },
            {
                path: ":orderShortId/payment_return",
                lazy: lazyDemoGated(() => import("./components/routes/product-widget/PaymentReturn")),
            },
        ]
    },
    {
        path: "/order/:eventId/:orderShortId/print",
        lazy: lazyDemoGated(() => import("./components/routes/product-widget/PrintOrder")),
        errorElement: <ErrorPage />
    },
    {
        path: "/product/:eventId/:attendeeShortId/print",
        lazy: lazyDemoGated(() => import("./components/routes/product-widget/PrintProduct")),
        errorElement: <ErrorPage />
    },
    {
        path: "/manage/event/:eventId/ticket-designer/print",
        async lazy() {
            const TicketDesignerPrint = await import("./components/routes/event/TicketDesigner/TicketDesignerPrint");
            return { Component: TicketDesignerPrint.default };
        },
        errorElement: <ErrorPage />
    },
    {
        path: "/product/:eventId/:attendeeShortId",
        lazy: lazyDemoGated(() => import("./components/routes/product-widget/AttendeeProductAndInformation")),
        errorElement: <ErrorPage />
    },
    {
        path: "/check-in/:checkInListShortId",
        lazy: lazyDemoGated(() => import("./components/layouts/CheckIn")),
        errorElement: <ErrorPage />,
    },
    {
        path: "/my-tickets/:token",
        lazy: lazyDemoGated(() => import("./components/routes/my-tickets")),
        errorElement: <ErrorPage />,
    }
];


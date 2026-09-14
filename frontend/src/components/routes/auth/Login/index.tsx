import {Button, PasswordInput, TextInput, Collapse, UnstyledButton} from "@mantine/core";
import {NavLink, useLocation, useNavigate} from "react-router";
import {notifications} from '@mantine/notifications';
import {attendeeClient} from "../../../../api/attendee.client.ts";
import {useForm} from "@mantine/form";
import classes from "./Login.module.scss";
import {useState} from "react";
import {useSendTicketLookupEmail} from "../../../../mutations/useSendTicketLookupEmail.ts";
import {showError} from "../../../../utilites/notifications.tsx";
import {IconTicket, IconChevronDown} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const Login = () => {
    const {t} = useIULanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [ticketLookupOpen, setTicketLookupOpen] = useState(false);
    const [ticketLookupSuccess, setTicketLookupSuccess] = useState(false);

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        }
    });

    const ticketLookupForm = useForm({
        initialValues: {
            email: '',
        }
    });

    const ticketLookupMutation = useSendTicketLookupEmail();

    const handleLogin = async (values: typeof form.values) => {
        setLoginError(null);
        setLoading(true);

        try {
            await attendeeClient.login(values);
            const searchParams = new URLSearchParams(location.search);
            const redirectParam = searchParams.get('redirect');
            const redirectUrl = (redirectParam && redirectParam !== '/my-registrations') ? redirectParam : '/';
            navigate(redirectUrl);
        } catch (err: any) {
            const msg = err.response?.data?.message || t("login_error_default");
            setLoginError(msg);
            notifications.show({
                message: msg,
                color: 'red',
                position: 'top-center',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTicketLookup = (values: { email: string }) => {
        ticketLookupMutation.mutate(values.email, {
            onSuccess: () => {
                setTicketLookupSuccess(true);
            },
            onError: () => {
                showError(t("ticket_lookup_error"));
            }
        });
    };

    return (
        <>
            <header className={classes.header}>
                <h2>{t("login_title", "تسجيل الدخول إلى حسابك")}</h2>
                <p>
                    {t("login_desc", "سجل دخولك لاستعراض تذاكرك، متابعة تسجيلاتك، وتحميل شهادات الحضور المعتمدة.")}
                </p>
            </header>

            {loginError && (
                <div style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    padding: "10px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                }}>
                    {loginError}
                </div>
            )}

            <div className={classes.loginCard}>
                <form onSubmit={form.onSubmit(handleLogin)}>
                    <TextInput
                        {...form.getInputProps('email')}
                        label={t("email_label", "البريد الإلكتروني")}
                        placeholder="name@example.com"
                        type="email"
                        required
                    />

                    <div className={classes.passwordLabelRow}>
                        <label htmlFor="login-password">
                            {t("password_label", "كلمة المرور")}
                        </label>
                        <NavLink to={`/auth/forgot-password`} tabIndex={-1}>
                            {t("forgot_password_link", "نسيت كلمة المرور؟")}
                        </NavLink>
                    </div>

                    <PasswordInput
                        {...form.getInputProps('password')}
                        id="login-password"
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                        mt="lg"
                    >
                        {loading ? t("logging_in", "جاري تسجيل الدخول...") : t("login_submit", "تسجيل الدخول")}
                    </Button>

                    <div className={classes.createAccountPrompt}>
                        <span>{t("dont_have_account", "ليس لديك حساب بعد؟")}</span>
                        <NavLink to={`/register${location.search}`} className={classes.createAccountLink}>
                            {t("login_create_account", "إنشاء حساب جديد")}
                        </NavLink>
                    </div>
                </form>
            </div>

            <div className={classes.ticketLookup}>
                <UnstyledButton
                    className={classes.ticketLookupTrigger}
                    onClick={() => setTicketLookupOpen(!ticketLookupOpen)}
                    data-expanded={ticketLookupOpen}
                >
                    <IconTicket size={18} />
                    <span>{t("ticket_lookup_trigger")}</span>
                    <IconChevronDown
                        size={16}
                        className={classes.chevron}
                        data-expanded={ticketLookupOpen}
                    />
                </UnstyledButton>

                <Collapse expanded={ticketLookupOpen}>
                    <div className={classes.ticketLookupContent}>
                        {ticketLookupSuccess ? (
                            <div className={classes.successMessage}>
                                <p>{t("ticket_lookup_success")}</p>
                                <UnstyledButton
                                    className={classes.resetLink}
                                    onClick={() => {
                                        setTicketLookupSuccess(false);
                                        ticketLookupForm.reset();
                                    }}
                                >
                                    {t("ticket_lookup_another_email")}
                                </UnstyledButton>
                            </div>
                        ) : (
                            <form onSubmit={ticketLookupForm.onSubmit(handleTicketLookup)}>
                                <div className={classes.ticketLookupForm}>
                                    <TextInput
                                        {...ticketLookupForm.getInputProps('email')}
                                        type="email"
                                        placeholder={t("ticket_lookup_placeholder")}
                                        required
                                        className={classes.ticketEmailInput}
                                    />
                                    <Button
                                        type="submit"
                                        loading={ticketLookupMutation.isPending}
                                        disabled={ticketLookupMutation.isPending}
                                    >
                                        {t("ticket_lookup_send_btn")}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </Collapse>
            </div>

            <div style={{
                marginTop: 20,
                fontSize: 13,
                background: "var(--iu-green-soft, #f4fbf7)",
                padding: "12px 16px",
                borderRadius: 14,
                border: "1px solid var(--iu-green-light, #dff3e8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
            }}>
                <span style={{color: "var(--iu-text-secondary, #475569)"}}>
                    {t("login_organizer_prompt", "هل أنت منظم أو مسؤول فعالية بالجامعة؟")}
                </span>
                <NavLink to={`/manage/login${location.search}`} style={{fontWeight: 700, color: "var(--iu-green-secondary, #1b754b)", textDecoration: "none", whiteSpace: "nowrap"}}>
                    {t("login_organizer_link", "دخول المنظمين والمسؤولين ←")}
                </NavLink>
            </div>
        </>
    );
};

export default Login;

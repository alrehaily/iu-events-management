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
    const {isArabic} = useIULanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [ticketLookupOpen, setTicketLookupOpen] = useState(false);
    const [ticketLookupSuccess, setTicketLookupSuccess] = useState(false);

    const text = {
        title: isArabic ? "تسجيل الدخول إلى حسابك" : "Log in to your account",
        description: isArabic
            ? "سجل دخولك لاستعراض تذاكرك، متابعة تسجيلاتك، وتحميل شهادات الحضور المعتمدة."
            : "Sign in to view your tickets, track your registrations, and download verified attendance certificates.",
        email: isArabic ? "البريد الإلكتروني" : "Email",
        password: isArabic ? "كلمة المرور" : "Password",
        forgotPassword: isArabic ? "نسيت كلمة المرور؟" : "Forgot password?",
        loggingIn: isArabic ? "جاري تسجيل الدخول..." : "Logging in...",
        login: isArabic ? "تسجيل الدخول" : "Log In",
        noAccount: isArabic ? "ليس لديك حساب بعد؟" : "Don't have an account?",
        createAccount: isArabic ? "إنشاء حساب جديد" : "Create a new account",
        loginError: isArabic
            ? "تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى."
            : "Unable to log in. Check your details and try again.",
        ticketLookupTrigger: isArabic ? "تبحث عن تذاكرك فقط؟" : "Just looking for your tickets?",
        ticketLookupPlaceholder: isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email address",
        ticketLookupSend: isArabic ? "إرسال رابط التذاكر" : "Send ticket link",
        ticketLookupSuccess: isArabic
            ? "تم إرسال رابط الوصول إلى تذاكرك إلى بريدك الإلكتروني."
            : "A ticket access link has been sent to your email.",
        ticketLookupAnother: isArabic ? "استخدام بريد إلكتروني آخر" : "Use another email",
        ticketLookupError: isArabic
            ? "تعذر إرسال رابط التذاكر. حاول مرة أخرى."
            : "Unable to send the ticket link. Please try again.",
        organizerPrompt: isArabic
            ? "هل أنت منظم أو مسؤول فعالية بالجامعة؟"
            : "Are you an organizer or event administrator?",
        organizerLink: isArabic ? "دخول المنظمين والمسؤولين ←" : "Organizer & staff login →",
    };

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
            const msg = err.response?.data?.message || text.loginError;
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
                showError(text.ticketLookupError);
            }
        });
    };

    return (
        <>
            <header className={classes.header}>
                <h2>{text.title}</h2>
                <p>{text.description}</p>
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
                        label={text.email}
                        placeholder="name@example.com"
                        type="email"
                        required
                    />

                    <div className={classes.passwordLabelRow}>
                        <label htmlFor="login-password">{text.password}</label>
                        <NavLink to={`/auth/forgot-password`} tabIndex={-1}>
                            {text.forgotPassword}
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
                        {loading ? text.loggingIn : text.login}
                    </Button>

                    <div className={classes.createAccountPrompt}>
                        <span>{text.noAccount}</span>
                        <NavLink to={`/register${location.search}`} className={classes.createAccountLink}>
                            {text.createAccount}
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
                    <span>{text.ticketLookupTrigger}</span>
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
                                <p>{text.ticketLookupSuccess}</p>
                                <UnstyledButton
                                    className={classes.resetLink}
                                    onClick={() => {
                                        setTicketLookupSuccess(false);
                                        ticketLookupForm.reset();
                                    }}
                                >
                                    {text.ticketLookupAnother}
                                </UnstyledButton>
                            </div>
                        ) : (
                            <form onSubmit={ticketLookupForm.onSubmit(handleTicketLookup)}>
                                <div className={classes.ticketLookupForm}>
                                    <TextInput
                                        {...ticketLookupForm.getInputProps('email')}
                                        type="email"
                                        placeholder={text.ticketLookupPlaceholder}
                                        required
                                        className={classes.ticketEmailInput}
                                    />
                                    <Button
                                        type="submit"
                                        loading={ticketLookupMutation.isPending}
                                        disabled={ticketLookupMutation.isPending}
                                    >
                                        {text.ticketLookupSend}
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
                    {text.organizerPrompt}
                </span>
                <NavLink to={`/manage/login${location.search}`} style={{fontWeight: 700, color: "var(--iu-green-secondary, #1b754b)", textDecoration: "none", whiteSpace: "nowrap"}}>
                    {text.organizerLink}
                </NavLink>
            </div>
        </>
    );
};

export default Login;

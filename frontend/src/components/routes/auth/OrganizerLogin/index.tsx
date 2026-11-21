import {Alert, Button, PasswordInput, TextInput} from "@mantine/core";
import {NavLink, useLocation, useNavigate} from "react-router";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {isAxiosError} from "axios";
import {t} from "@lingui/macro";
import {authClient} from "../../../../api/auth.client.ts";
import {LoginData, LoginResponse} from "../../../../types.ts";
import {useForm} from "@mantine/form";
import classes from "./OrganizerLogin.module.scss";
import {useState} from "react";
import {ChooseAccountModal} from "../../../modals/ChooseAccountModal";
import {GET_ME_QUERY_KEY} from "../../../../queries/useGetMe.ts";
import {userClient} from "../../../../api/user.client.ts";
import {IconShieldLock} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const OrganizerLogin = () => {
    const queryClient = useQueryClient();
    const location = useLocation();
    const navigate = useNavigate();
    const {isArabic} = useIULanguage();
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        }
    });
    const [accounts, setAccounts] = useState<LoginResponse['accounts']>([]);
    const [error, setError] = useState<'credentials' | 'session' | null>(null);

    const text = {
        badge: isArabic ? "بوابة المنظمين والمسؤولين" : "Organizer & Staff Portal",
        title: isArabic ? "تسجيل الدخول لإدارة الفعاليات" : "Sign in to manage events",
        description: isArabic
            ? "مخصص للجهات واللجان المنظمة للفعاليات بالجامعة الإسلامية."
            : "For university departments and authorized event organizing teams.",
        email: isArabic ? "البريد الإلكتروني المؤسسي" : "Institutional Email",
        password: isArabic ? "كلمة المرور" : "Password",
        forgotPassword: isArabic ? "نسيت كلمة المرور؟" : "Forgot password?",
        loggingIn: isArabic ? "جاري تسجيل الدخول..." : "Logging in...",
        login: isArabic ? "تسجيل الدخول كمنظم" : "Log In as Organizer",
        attendeePrompt: isArabic
            ? "هل ترغب بحضور الفعاليات والتسجيل فيها فقط؟"
            : "Are you here to browse and register for events?",
        attendeeLink: isArabic ? "دخول المستفيدين والزوار ←" : "Attendee & visitor login →",
    };

    const {mutate: loginUser, isPending} = useMutation({
        mutationFn: async (userData: LoginData) => {
            setError(null);
            setAccounts([]);
            const response = await authClient.login(userData);
            if (response.token) {
                const {data: user} = await userClient.me();
                await queryClient.cancelQueries({queryKey: [GET_ME_QUERY_KEY]});
                queryClient.setQueryData([GET_ME_QUERY_KEY], user);
                navigate('/manage/events', {replace: true});
                return;
            }

            if (response.accounts?.length > 1) {
                setAccounts(response.accounts);
                return;
            }

            setError('session');
        },

        onError: (failure) => {
            setError(isAxiosError(failure) && failure.response?.status === 401 && failure.config?.url === 'auth/login'
                ? 'credentials' : 'session');
        }
    });

    return (
        <>
            <div className={classes.badgeWrapper}>
                <span className={classes.badge}>
                    <IconShieldLock size={14} />
                    {text.badge}
                </span>
            </div>

            <header className={classes.header}>
                <h2>{text.title}</h2>
                <p>{text.description}</p>
            </header>

            <div className={classes.organizerCard}>
                {error && <Alert role="alert" color="red" mb="md">
                    {error === 'credentials' ? t`Incorrect email or password.` : t`Unable to start your session. Please try again.`}
                </Alert>}
                <form onSubmit={form.onSubmit((values) => loginUser(values))}>
                    <TextInput
                        {...form.getInputProps('email')}
                        label={text.email}
                        placeholder="organizer@iu.edu.sa"
                        type="email"
                        required
                    />

                    <div>
                        <div className={classes.passwordRow}>
                            <label htmlFor="organizer-password">{text.password}</label>
                            <NavLink to={`/auth/forgot-password${location.search}`} tabIndex={-1}>
                                {text.forgotPassword}
                            </NavLink>
                        </div>
                        <PasswordInput
                            {...form.getInputProps('password')}
                            id="organizer-password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        loading={isPending}
                        disabled={isPending}
                        mt="lg"
                    >
                        {isPending ? text.loggingIn : text.login}
                    </Button>
                </form>
            </div>

            <div className={classes.bottomPrompt}>
                <span>{text.attendeePrompt}</span>
                <NavLink to={`/auth/login${location.search}`}>
                    {text.attendeeLink}
                </NavLink>
            </div>

            {accounts.length > 0 && (
                <ChooseAccountModal
                    onAccountChosen={(accountId) => loginUser({...form.values, account_id: String(accountId)})}
                    accounts={accounts}
                />
            )}
        </>
    );
};

export default OrganizerLogin;

import {Button, PasswordInput, TextInput} from "@mantine/core";
import {NavLink, Navigate, useLocation, useNavigate} from "react-router";
import {useMutation} from "@tanstack/react-query";
import {notifications} from '@mantine/notifications';
import {authClient} from "../../../../api/auth.client.ts";
import {LoginData, LoginResponse} from "../../../../types.ts";
import {useForm} from "@mantine/form";
import classes from "./OrganizerLogin.module.scss";
import {useEffect, useState} from "react";
import {ChooseAccountModal} from "../../../modals/ChooseAccountModal";
import {useGetMe} from "../../../../queries/useGetMe.ts";
import {IconShieldLock} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const OrganizerLogin = () => {
    const me = useGetMe();
    const location = useLocation();
    const navigate = useNavigate();
    const {isArabic} = useIULanguage();
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            account_id: '',
        }
    });
    const [showChooseAccount, setShowChooseAccount] = useState(false);

    const text = {
        error: isArabic
            ? "يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور والمحاولة مرة أخرى."
            : "Please check your email and password and try again.",
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

    const {mutate: loginUser, isPending, data} = useMutation({
        mutationFn: (userData: LoginData) => authClient.login(userData),

        onSuccess: (response: LoginResponse) => {
            if (response.token) {
                navigate('/manage/events');
                return;
            }

            if (response.accounts && response.accounts.length > 1) {
                setShowChooseAccount(true);
                return;
            }
        },

        onError: () => {
            notifications.show({
                message: text.error,
                color: 'red',
                position: 'top-center',
            });
        }
    });

    useEffect(() => {
        if (form.values.account_id) {
            loginUser(form.values);
        }
    }, [form.values.account_id]);

    if (me.isSuccess) {
        return <Navigate to={'/manage/events'} replace />;
    }

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

            {(showChooseAccount && data) && (
                <ChooseAccountModal
                    onAccountChosen={(accountId) => {
                        form.setFieldValue('account_id', accountId as string);
                    }}
                    accounts={data.accounts}
                />
            )}
        </>
    );
};

export default OrganizerLogin;

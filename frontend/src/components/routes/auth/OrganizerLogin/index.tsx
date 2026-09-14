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
    const {t} = useIULanguage();
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            account_id: '',
        }
    });
    const [showChooseAccount, setShowChooseAccount] = useState(false);

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
                message: t("organizer_login_error", "يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور والمحاولة مرة أخرى."),
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
                    {t("organizer_portal_badge", "بوابة المنظمين والمسؤولين")}
                </span>
            </div>

            <header className={classes.header}>
                <h2>{t("organizer_login_title", "تسجيل الدخول لإدارة الفعاليات")}</h2>
                <p>
                    {t("organizer_login_desc", "مخصص لمنسوبي الكليات والعمادات واللجان المنظمة بالجامعة الإسلامية.")}
                </p>
            </header>

            <div className={classes.organizerCard}>
                <form onSubmit={form.onSubmit((values) => loginUser(values))}>
                    <TextInput
                        {...form.getInputProps('email')}
                        label={t("organizer_email_label", "البريد الإلكتروني المؤسسي")}
                        placeholder="organizer@iu.edu.sa"
                        type="email"
                        required
                    />

                    <div>
                        <div className={classes.passwordRow}>
                            <label htmlFor="organizer-password">
                                {t("password_label", "كلمة المرور")}
                            </label>
                            <NavLink to={`/auth/forgot-password${location.search}`} tabIndex={-1}>
                                {t("forgot_password_link", "نسيت كلمة المرور؟")}
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
                        {isPending ? t("logging_in", "جاري تسجيل الدخول...") : t("organizer_login_button", "تسجيل الدخول كمنظم")}
                    </Button>
                </form>
            </div>

            <div className={classes.bottomPrompt}>
                <span>
                    {t("organizer_attendee_prompt", "هل ترغب بحضور الفعاليات والتسجيل فيها فقط؟")}
                </span>
                <NavLink to={`/auth/login${location.search}`}>
                    {t("organizer_attendee_link", "دخول المستفيدين والزوار ←")}
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

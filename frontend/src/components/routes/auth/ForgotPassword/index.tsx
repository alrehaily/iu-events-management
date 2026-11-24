import {Button, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useMutation} from "@tanstack/react-query";
import {showError} from "../../../../utilites/notifications.tsx";
import {authClient} from "../../../../api/auth.client.ts";
import {useState} from "react";
import {NavLink} from "react-router";
import classes from "./ForgotPassword.module.scss";
import {IconArrowLeft, IconArrowRight, IconCheck} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const ForgotPassword = () => {
    const {t, dir, isArabic} = useIULanguage();
    const BackArrow = dir === 'rtl' ? IconArrowRight : IconArrowLeft;
    const form = useForm({
        initialValues: {
            email: '',
        },
    });
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const mutate = useMutation({
        mutationFn: (email: string) => {
            return authClient.forgotPassword({
                email: email,
            });
        },

        onSuccess: () => {
            setShowSuccessMessage(true);
        },

        onError: () => {
            showError(t("forgot_password_error", isArabic ? "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى." : "An error occurred while processing your request. Please try again."));
        }
    });

    if (showSuccessMessage) {
        return (
            <div className={classes.successMessage} dir={dir}>
                <div className={classes.successIcon}>
                    <IconCheck size={26} />
                </div>
                <h3>{t("forgot_success_title", isArabic ? "تحقق من بريدك الإلكتروني" : "Check your email")}</h3>
                <p>
                    {t("forgot_success_desc", isArabic ? "إذا كان لديك حساب مسجل لدينا، فستصلك رسالة تحتوي على تعليمات إعادة تعيين كلمة المرور." : "If you have an account with us, you will receive an email with password reset instructions.")}
                </p>
                <NavLink to={'/auth/login'}>
                    <BackArrow size={16} />
                    <span>{t("back_to_login", isArabic ? "العودة لتسجيل الدخول" : "Back to login")}</span>
                </NavLink>
            </div>
        );
    }

    return (
        <div dir={dir}>
            <header className={classes.header}>
                <h2>{t("forgot_password_title", isArabic ? "استعادة كلمة المرور" : "Forgot Password")}</h2>
                <p>{t("forgot_password_desc", isArabic ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك." : "Enter your email address and we will send you a link to reset your password.")}</p>
            </header>
            <div className={classes.forgotPasswordCard}>
                <form onSubmit={form.onSubmit((values) => mutate.mutate(values.email))}>
                    <TextInput
                        type="email"
                        {...form.getInputProps('email')}
                        label={t("email_label", isArabic ? "البريد الإلكتروني" : "Email Address")}
                        placeholder="name@example.com"
                        required
                    />
                    <Button type="submit" fullWidth loading={mutate.isPending} disabled={mutate.isPending} mt="md">
                        {mutate.isPending
                            ? t("sending", isArabic ? "جاري الإرسال..." : "Sending...")
                            : t("send_reset_link", isArabic ? "إرسال رابط الاستعادة" : "Send Reset Link")}
                    </Button>
                </form>
                <footer>
                    <NavLink to={'/auth/login'}>
                        <BackArrow size={16} />
                        <span>{t("back_to_login", isArabic ? "العودة لتسجيل الدخول" : "Back to login")}</span>
                    </NavLink>
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;

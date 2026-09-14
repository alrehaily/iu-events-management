import {Button, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useMutation} from "@tanstack/react-query";
import {showError} from "../../../../utilites/notifications.tsx";
import {authClient} from "../../../../api/auth.client.ts";
import {useState} from "react";
import {NavLink} from "react-router";
import classes from "./ForgotPassword.module.scss";
import {IconArrowRight, IconCheck} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const ForgotPassword = () => {
    const {t, dir, isArabic} = useIULanguage();
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
            showError(t("forgot_password_error", "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى."));
        }
    });

    if (showSuccessMessage) {
        return (
            <div className={classes.successMessage} dir={dir}>
                <div className={classes.successIcon}>
                    <IconCheck size={26} />
                </div>
                <h3>{t("forgot_success_title", "تحقق من بريدك الإلكتروني")}</h3>
                <p>
                    {t("forgot_success_desc", "إذا كان لديك حساب مسجل لدينا، فستصلك رسالة تحتوي على تعليمات إعادة تعيين كلمة المرور.")}
                </p>
                <NavLink to={'/auth/login'}>
                    <IconArrowRight size={16} style={{transform: isArabic ? "rotate(180deg)" : "none"}} />
                    {t("back_to_login", "العودة لتسجيل الدخول")}
                </NavLink>
            </div>
        );
    }

    return (
        <div dir={dir}>
            <header className={classes.header}>
                <h2>{t("forgot_password_title", "استعادة كلمة المرور")}</h2>
                <p>{t("forgot_password_desc", "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.")}</p>
            </header>
            <div className={classes.forgotPasswordCard}>
                <form onSubmit={form.onSubmit((values) => mutate.mutate(values.email))}>
                    <TextInput
                        type="email"
                        {...form.getInputProps('email')}
                        label={t("email_label", "البريد الإلكتروني")}
                        placeholder="name@example.com"
                        required
                    />
                    <Button type="submit" fullWidth loading={mutate.isPending} disabled={mutate.isPending} mt="md">
                        {mutate.isPending ? t("sending", "جاري الإرسال...") : t("send_reset_link", "إرسال رابط الاستعادة")}
                    </Button>
                </form>
                <footer>
                    <NavLink to={'/auth/login'}>{t("back_to_login", "العودة لتسجيل الدخول")}</NavLink>
                </footer>
            </div>
        </div>
    );
}

export default ForgotPassword;

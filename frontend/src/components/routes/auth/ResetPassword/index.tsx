import {Button, LoadingOverlay, PasswordInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {NavLink, useNavigate, useParams} from "react-router";
import {useResetPassword} from "../../../../mutations/useResetPassword.ts";
import {useVerifyPasswordResetToken} from "../../../../queries/useVerifyPasswordResetToken.ts";
import {showError, showSuccess} from "../../../../utilites/notifications.tsx";
import {useEffect} from "react";
import {ResetPasswordRequest} from "../../../../types.ts";
import {useFormErrorResponseHandler} from "../../../../hooks/useFormErrorResponseHandler.tsx";
import classes from "./ResetPassword.module.scss";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const ResetPassword = () => {
    const {t, dir} = useIULanguage();
    const form = useForm({
        initialValues: {
            password: '',
            password_confirmation: '',
        },
    });
    const {token} = useParams();
    const navigate = useNavigate();
    const mutate = useResetPassword();
    const verifyQuery = useVerifyPasswordResetToken(String(token));
    const errorHandler = useFormErrorResponseHandler();

    useEffect(() => {
        if (verifyQuery.isError) {
            showError(t("reset_invalid_token", "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية."));
            navigate('/auth/login');
        }
    }, [verifyQuery.isError]);

    if (verifyQuery.isLoading) {
        return (
            <div className={classes.loadingWrapper}>
                <LoadingOverlay visible />
            </div>
        );
    }

    const handleSubmit = (values: ResetPasswordRequest) => mutate.mutate({
        token: String(token),
        resetData: values,
    }, {
        onError: (error) => {
            errorHandler(form, error);
        },
        onSuccess: () => {
            showSuccess(t("reset_success", "تمت إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول بكلمة المرور الجديدة."));
            navigate('/auth/login');
        },
    });

    return (
        <div dir={dir}>
            <header className={classes.header}>
                <h2>{t("reset_title", "إنشاء كلمة مرور جديدة")}</h2>
                <p>{t("reset_desc", "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.")}</p>
            </header>
            <div className={classes.resetPasswordCard}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PasswordInput
                        {...form.getInputProps('password')}
                        label={t("new_password_label", "كلمة المرور الجديدة")}
                        placeholder="••••••••"
                        required
                    />
                    <PasswordInput
                        {...form.getInputProps('password_confirmation')}
                        label={t("confirm_password_label", "تأكيد كلمة المرور الجديدة")}
                        placeholder="••••••••"
                        required
                        mt="md"
                    />
                    <Button type="submit" fullWidth loading={mutate.isPending} disabled={mutate.isPending} mt="lg">
                        {mutate.isPending ? t("resetting", "جاري إعادة التعيين...") : t("reset_submit", "إعادة تعيين كلمة المرور")}
                    </Button>
                </form>
                <footer>
                    <NavLink to={'/auth/login'}>{t("back_to_login", "العودة لتسجيل الدخول")}</NavLink>
                </footer>
            </div>
        </div>
    );
}

export default ResetPassword;

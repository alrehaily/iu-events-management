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
import {IconArrowLeft, IconArrowRight} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const ResetPassword = () => {
    const {t, dir, isArabic} = useIULanguage();
    const BackArrow = dir === 'rtl' ? IconArrowRight : IconArrowLeft;
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
            showError(t("reset_invalid_token", isArabic ? "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية." : "This password reset link is invalid or expired."));
            navigate('/auth/login');
        }
    }, [verifyQuery.isError, isArabic]);

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
            showSuccess(t("reset_success", isArabic ? "تمت إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول بكلمة المرور الجديدة." : "Your password has been reset successfully. Please log in with your new password."));
            navigate('/auth/login');
        },
    });

    return (
        <div dir={dir}>
            <header className={classes.header}>
                <h2>{t("reset_title", isArabic ? "إنشاء كلمة مرور جديدة" : "Create New Password")}</h2>
                <p>{t("reset_desc", isArabic ? "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل." : "Your new password must be at least 8 characters long.")}</p>
            </header>
            <div className={classes.resetPasswordCard}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PasswordInput
                        {...form.getInputProps('password')}
                        label={t("new_password_label", isArabic ? "كلمة المرور الجديدة" : "New Password")}
                        placeholder="••••••••"
                        required
                    />
                    <PasswordInput
                        {...form.getInputProps('password_confirmation')}
                        label={t("confirm_password_label", isArabic ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password")}
                        placeholder="••••••••"
                        required
                        mt="md"
                    />
                    <Button type="submit" fullWidth loading={mutate.isPending} disabled={mutate.isPending} mt="lg">
                        {mutate.isPending
                            ? t("resetting", isArabic ? "جاري إعادة التعيين..." : "Resetting...")
                            : t("reset_submit", isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password")}
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

export default ResetPassword;

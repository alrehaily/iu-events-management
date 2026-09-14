import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Button, PasswordInput, SimpleGrid, TextInput } from "@mantine/core";
import { attendeeClient } from "../../../../api/attendee.client";
import { useIULanguage } from "../../../../context/IULanguageContext";
import classes from "./AttendeeRegister.module.scss";

export const AttendeeRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useIULanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("reg_err_match", "كلمتا المرور غير متطابقتين."));
      return;
    }

    if (password.length < 8) {
      setError(t("reg_err_length", "يجب أن تكون كلمة المرور 8 أحرف على الأقل."));
      return;
    }

    setLoading(true);

    try {
      await attendeeClient.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      const redirectUrl = (redirectParam && redirectParam !== '/my-registrations') ? redirectParam : '/';
      navigate(redirectUrl);
    } catch (err: any) {
      const msg = err.response?.data?.message || t("reg_error_default");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={classes.header}>
        <h2>{t("reg_card_title", "إنشاء حساب مستفيد جديد")}</h2>
        <p>
          {t("reg_card_desc", "مخصص لجميع المستفيدين والزوار والمشاركين الراغبين بحضور فعاليات الجامعة.")}
        </p>
      </header>

      {error && (
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
          {error}
        </div>
      )}

      <div className={classes.registerCard}>
        <form onSubmit={handleSubmit}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t("reg_first_name", "الاسم الأول")}
              placeholder={t("first_name_ph", "عبد الله")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextInput
              label={t("reg_last_name", "اسم العائلة")}
              placeholder={t("last_name_ph", "المحمدي")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </SimpleGrid>

          <TextInput
            label={t("reg_email", "البريد الإلكتروني (جامعي أو شخصي)")}
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <PasswordInput
              label={t("reg_password", "كلمة المرور (8 أحرف على الأقل)")}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordInput
              label={t("reg_confirm_password", "تأكيد كلمة المرور")}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </SimpleGrid>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? t("reg_loading", "جاري إنشاء الحساب...") : t("reg_submit", "إنشاء الحساب ومتابعة الفعاليات")}
          </Button>

          <div className={classes.loginPrompt}>
            <span>{t("already_have_account", "لديك حساب بالفعل؟")}</span>
            <NavLink to={`/auth/login${location.search}`} className={classes.loginLink}>
              {t("login_title", "تسجيل الدخول")}
            </NavLink>
          </div>
        </form>

      </div>

      <div className={classes.bottomPrompt}>
        <span>
          {t("attendee_reg_organizer_prompt", "هل أنت منظم أو مسؤول فعالية بالجامعة؟")}
        </span>
        <NavLink to={`/manage/login${location.search}`}>
          {t("attendee_reg_organizer_link", "دخول المنظمين والمسؤولين ←")}
        </NavLink>
      </div>
    </>
  );
};

export default AttendeeRegister;

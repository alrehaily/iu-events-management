import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Button, PasswordInput, SimpleGrid, TextInput } from "@mantine/core";
import { attendeeClient } from "../../../../api/attendee.client";
import { useIULanguage } from "../../../../context/IULanguageContext";
import classes from "./AttendeeRegister.module.scss";

export const AttendeeRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isArabic } = useIULanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = {
    title: isArabic ? "إنشاء حساب مستفيد جديد" : "Create a New Attendee Account",
    description: isArabic
      ? "مخصص لجميع المستفيدين والزوار والمشاركين الراغبين بحضور فعاليات الجامعة."
      : "For all attendees, visitors, and participants joining university events.",
    firstName: isArabic ? "الاسم الأول" : "First Name",
    firstNamePlaceholder: isArabic ? "عبد الله" : "First name",
    lastName: isArabic ? "اسم العائلة" : "Last Name",
    lastNamePlaceholder: isArabic ? "المحمدي" : "Last name",
    email: isArabic ? "البريد الإلكتروني (جامعي أو شخصي)" : "Email (University or Personal)",
    password: isArabic ? "كلمة المرور (8 أحرف على الأقل)" : "Password (at least 8 characters)",
    confirmPassword: isArabic ? "تأكيد كلمة المرور" : "Confirm Password",
    loading: isArabic ? "جاري إنشاء الحساب..." : "Creating account...",
    submit: isArabic ? "إنشاء الحساب ومتابعة الفعاليات" : "Create Account & Explore Events",
    alreadyHaveAccount: isArabic ? "لديك حساب بالفعل؟" : "Already have an account?",
    login: isArabic ? "تسجيل الدخول" : "Log In",
    organizerPrompt: isArabic
      ? "هل أنت منظم أو مسؤول فعالية بالجامعة؟"
      : "Are you an organizer or event administrator?",
    organizerLink: isArabic ? "دخول المنظمين والمسؤولين ←" : "Organizer & staff login →",
    passwordMismatch: isArabic ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.",
    passwordLength: isArabic
      ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل."
      : "Password must be at least 8 characters.",
    error: isArabic
      ? "تعذر إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى."
      : "Unable to create your account. Check your details and try again.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(text.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(text.passwordLength);
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
      const msg = err.response?.data?.message || text.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={classes.header}>
        <h2>{text.title}</h2>
        <p>{text.description}</p>
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
              label={text.firstName}
              placeholder={text.firstNamePlaceholder}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextInput
              label={text.lastName}
              placeholder={text.lastNamePlaceholder}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </SimpleGrid>

          <TextInput
            label={text.email}
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <PasswordInput
              label={text.password}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordInput
              label={text.confirmPassword}
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
            {loading ? text.loading : text.submit}
          </Button>

          <div className={classes.loginPrompt}>
            <span>{text.alreadyHaveAccount}</span>
            <NavLink to={`/auth/login${location.search}`} className={classes.loginLink}>
              {text.login}
            </NavLink>
          </div>
        </form>
      </div>

      <div className={classes.bottomPrompt}>
        <span>{text.organizerPrompt}</span>
        <NavLink to={`/manage/login${location.search}`}>
          {text.organizerLink}
        </NavLink>
      </div>
    </>
  );
};

export default AttendeeRegister;

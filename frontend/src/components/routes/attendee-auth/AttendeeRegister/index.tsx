import React, {useState} from "react";
import {Link, useNavigate} from "react-router";
import {attendeeClient} from "../../../../api/attendee.client";
import "../../../../styles/iu/common.css";
import "../../../../styles/iu/auth.css";

export const AttendeeRegister: React.FC = () => {
  const navigate = useNavigate();
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
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (password.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل.");
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
      navigate("/my-registrations");
    } catch (err: any) {
      const msg = err.response?.data?.message || "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="iu-auth-page" dir="rtl">
      <div className="container">
        <div className="iu-auth-shell">
          {/* Left / Intro Card */}
          <div className="iu-auth-intro">
            <div>
              <img
                className="iu-auth-logo"
                src="/images/IUEvent2.png"
                alt="الجامعة الإسلامية بالمدينة المنورة"
              />
              <h1 className="iu-auth-introTitle">
                انضم إلى منصة فعاليات الجامعة الإسلامية
              </h1>
              <p className="iu-auth-introText">
                أنشئ حسابك الآن للتسجيل بضغطة زر في الفعاليات والأنشطة الأكاديمية والتقنية، وحفظ تذاكرك وإصدار شهادات الحضور المعتمدة.
              </p>
              <div className="iu-auth-introMeta">
                <span className="iu-auth-pill">شهادات حضور معتمدة</span>
                <span className="iu-auth-pill">تسجيل بنقرة واحدة</span>
                <span className="iu-auth-pill">سجل فعاليات متكامل</span>
              </div>
            </div>

            <div style={{marginTop: 32, fontSize: 13, opacity: 0.85}}>
              الجامعة الإسلامية بالمدينة المنورة — نحو تجربة جامعية رقمية متكاملة
            </div>
          </div>

          {/* Right / Register Form Card */}
          <div className="iu-auth-card">
            <div className="iu-auth-cardHeader">
              <div>
                <h2>إنشاء حساب مشارك جديد</h2>
                <p>مخصص للطلاب والباحثين والزوار الراغبين بحضور الفعاليات.</p>
              </div>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <form className="iu-auth-form" onSubmit={handleSubmit}>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                <div className="iu-auth-field">
                  <label htmlFor="firstName">الاسم الأول</label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="مثال: عبد الله"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="iu-auth-field">
                  <label htmlFor="lastName">اسم العائلة</label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="مثال: المحمدي"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="iu-auth-field">
                <label htmlFor="email">البريد الإلكتروني (جامعي أو شخصي)</label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="iu-auth-field">
                <label htmlFor="password">كلمة المرور (8 خانات على الأقل)</label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="iu-auth-field">
                <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="iu-auth-actions" style={{marginTop: 8}}>
                <button
                  type="submit"
                  className="btn solid"
                  disabled={loading}
                  style={{opacity: loading ? 0.7 : 1}}
                >
                  {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب ومتابعة الفعاليات"}
                </button>
                <Link to="/login" className="btn outline" style={{textAlign: "center", textDecoration: "none"}}>
                  لديك حساب بالفعل؟ تسجيل الدخول
                </Link>
              </div>
            </form>

            <div className="iu-auth-alt">
              هل أنت منظم فعاليات تابع لإحدى كليات أو عمادات الجامعة؟{" "}
              <Link to="/auth/register" style={{fontWeight: 700, color: "var(--iu-primary, #084b2f)"}}>
                التسجيل كمنظم
              </Link>
            </div>

            <p className="iu-auth-note">
              جميع الحسابات تخضع لسياسات الخصوصية والأنظمة التقنية المعتمدة لدى الجامعة الإسلامية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeRegister;

import React, {useState} from "react";
import {Link, useNavigate} from "react-router";
import {attendeeClient} from "../../../../api/attendee.client";
import "../../../../styles/iu/common.css";
import "../../../../styles/iu/auth.css";

export const AttendeeLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await attendeeClient.login({email, password});
      navigate("/my-registrations");
    } catch (err: any) {
      const msg = err.response?.data?.message || "تعذر تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.";
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
                بوابة المشاركين والطلاب
              </h1>
              <p className="iu-auth-introText">
                سجل دخولك للوصول إلى حجوزاتك، استعراض تذاكر الفعاليات، وتحميل شهادات الحضور المعتمدة من الجامعة الإسلامية.
              </p>
              <div className="iu-auth-introMeta">
                <span className="iu-auth-pill">تذاكر إلكترونية</span>
                <span className="iu-auth-pill">شهادات معتمدة فورية</span>
                <span className="iu-auth-pill">حساب طالب موحد</span>
              </div>
            </div>

            <div style={{marginTop: 32, fontSize: 13, opacity: 0.85}}>
              منصة إدارة الفعاليات — الجامعة الإسلامية بالمدينة المنورة
            </div>
          </div>

          {/* Right / Login Form Card */}
          <div className="iu-auth-card">
            <div className="iu-auth-cardHeader">
              <div>
                <h2>تسجيل الدخول</h2>
                <p>ادخل بيانات حسابك للمتابعة إلى تذاكرك وفعالياتك.</p>
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
              <div className="iu-auth-field">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  placeholder="student@iu.edu.sa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="iu-auth-field">
                <label htmlFor="password">كلمة المرور</label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="iu-auth-row">
                <label style={{display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer"}}>
                  <input type="checkbox" defaultChecked /> تذكرني
                </label>
                <span style={{fontSize: 12, color: "#9ca3af"}}>بوابة الدخول الموحد للطلاب</span>
              </div>

              <div className="iu-auth-actions">
                <button
                  type="submit"
                  className="btn solid"
                  disabled={loading}
                  style={{opacity: loading ? 0.7 : 1}}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </button>
                <Link to="/register" className="btn outline" style={{textAlign: "center", textDecoration: "none"}}>
                  إنشاء حساب طالب / مشارك جديد
                </Link>
              </div>
            </form>

            <div className="iu-auth-alt">
              هل أنت منظم أو مسؤول فعالية؟{" "}
              <Link to="/auth/login" style={{fontWeight: 700, color: "var(--iu-primary, #084b2f)"}}>
                الدخول من بوابة المنظمين
              </Link>
            </div>

            <p className="iu-auth-note">
              باستخدامك للمنصة فإنك توافق على سياسات ولوائح الجامعة الإسلامية بالمدينة المنورة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeLogin;

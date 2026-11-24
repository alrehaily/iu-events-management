import React, {useEffect, useState} from "react";
import {useParams, Link} from "react-router";
import {t} from "@lingui/macro";
import {
  IconShieldCheck,
  IconAlertCircle,
  IconCertificate,
  IconCalendar,
  IconUser,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import {useIULanguage} from "../../../context/IULanguageContext";
import {IUCertificateModal} from "../../iu/IUCertificateModal";
import {CertificateData} from "../../../api/attendee.client";

interface VerificationResult {
  valid: boolean;
  message?: string;
  certificate_code?: string;
  attendee_name?: string;
  event_title?: string;
  event_date?: string;
  issued_at?: string;
  issuer?: string;
}

export const VerifyCertificate: React.FC = () => {
  const {certificateCode} = useParams<{certificateCode?: string}>();
  const {dir} = useIULanguage();
  const isRtl = dir === "rtl";

  const [code, setCode] = useState(certificateCode || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchVerification = async (targetCode: string) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/public/certificates/verify/${encodeURIComponent(targetCode.trim())}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setResult(data);
      } else {
        setError(data.message || (isRtl ? "لم يتم العثور على شهادة بهذا الرمز" : "Certificate not found"));
      }
    } catch {
      setError(isRtl ? "حدث خطأ أثناء التحقق من الشهادة. يرجى المحاولة مرة أخرى." : "Error verifying certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateCode) {
      setCode(certificateCode);
      fetchVerification(certificateCode);
    }
  }, [certificateCode]);

  const certificateForModal: CertificateData | null = result?.valid ? {
    certificate_code: result.certificate_code || "",
    attendee_name: result.attendee_name || "",
    event_title: result.event_title || "",
    event_date: result.event_date || "",
    issued_at: result.issued_at || "",
  } : null;

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        backgroundColor: "#f8fafc",
      }}
      dir={dir}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 12px 36px rgba(8, 75, 47, 0.08)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Top Decorative Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #084b2f 0%, #0d5a38 50%, #157347 100%)",
            padding: "32px 24px",
            textAlign: "center",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <img
            src="/assets/iu/iu-emblem.png"
            alt="الجامعة الإسلامية"
            style={{
              height: 72,
              width: "auto",
              margin: "0 auto 16px",
              display: "block",
              filter: "brightness(0) invert(1)",
            }}
          />
          <h1 style={{fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5}}>
            {isRtl ? "نظام التحقق من الشهادات الرسمية" : "Official Certificate Verification"}
          </h1>
          <p style={{margin: "6px 0 0", fontSize: 13, opacity: 0.88}}>
            {isRtl ? "الجامعة الإسلامية بالمدينة المنورة" : "Islamic University of Madinah"}
          </p>
        </div>

        {/* Content Body */}
        <div style={{padding: "32px 28px"}}>
          {/* Search / Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchVerification(code);
            }}
            style={{display: "flex", gap: 10, marginBottom: 24}}
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={isRtl ? "أدخل رمز الشهادة (مثال: IU-CERT-XXXXX)" : "Enter certificate code (e.g. IU-CERT-XXXXX)"}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: 14,
                fontFamily: "monospace",
                direction: "ltr",
                textAlign: "center",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                backgroundColor: "#084b2f",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "wait" : "pointer",
                transition: "opacity 0.2s ease",
                opacity: loading || !code.trim() ? 0.6 : 1,
              }}
            >
              {loading ? (isRtl ? "جارٍ التحقق..." : "Verifying...") : (isRtl ? "تحقق" : "Verify")}
            </button>
          </form>

          {/* Error Notice */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                backgroundColor: "#fef2f2",
                borderRadius: 12,
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              <IconAlertCircle size={22} style={{flexShrink: 0}} />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Verified Card */}
          {result?.valid && (
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1.5px solid #86efac",
                borderRadius: 16,
                padding: "24px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#166534",
                  fontWeight: 800,
                  fontSize: 18,
                  marginBottom: 18,
                  borderBottom: "1px solid #bbf7d0",
                  paddingBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#166534",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck size={20} strokeWidth={3} />
                </div>
                <span>
                  {isRtl ? "شهادة صحيحة ومعتمدة رسمياً" : "Officially Verified Certificate"}
                </span>
              </div>

              <div style={{display: "grid", gap: 14, fontSize: 14, color: "#1e293b"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <span style={{color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 6}}>
                    <IconUser size={16} />
                    {isRtl ? "اسم الحاضر:" : "Attendee Name:"}
                  </span>
                  <span style={{fontWeight: 800, fontSize: 16, color: "#0f172a"}}>
                    {result.attendee_name}
                  </span>
                </div>

                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <span style={{color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 6}}>
                    <IconCertificate size={16} />
                    {isRtl ? "عنوان الفعالية / الورشة:" : "Event Title:"}
                  </span>
                  <span style={{fontWeight: 700, color: "#0f172a", textAlign: isRtl ? "left" : "right"}}>
                    {result.event_title}
                  </span>
                </div>

                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <span style={{color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 6}}>
                    <IconCalendar size={16} />
                    {isRtl ? "تاريخ الفعالية:" : "Event Date:"}
                  </span>
                  <span style={{fontWeight: 600, color: "#0f172a"}}>
                    {result.event_date}
                  </span>
                </div>

                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <span style={{color: "#64748b", fontWeight: 600}}>
                    {isRtl ? "الجهة المصدرة:" : "Issuing Authority:"}
                  </span>
                  <span style={{fontWeight: 700, color: "#084b2f"}}>
                    {result.issuer || (isRtl ? "الجامعة الإسلامية بالمدينة المنورة" : "Islamic University of Madinah")}
                  </span>
                </div>

                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <span style={{color: "#64748b", fontWeight: 600}}>
                    {isRtl ? "الرمز المرجعي:" : "Reference Code:"}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      direction: "ltr",
                      backgroundColor: "#dcfce7",
                      padding: "2px 8px",
                      borderRadius: 6,
                      color: "#166534",
                    }}
                  >
                    #{result.certificate_code}
                  </span>
                </div>
              </div>

              {/* View Certificate Modal Button */}
              <div style={{marginTop: 20, paddingTop: 16, borderTop: "1px solid #bbf7d0", textAlign: "center"}}>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(30, 58, 95, 0.25)",
                  }}
                >
                  <IconCertificate size={18} />
                  <span>{isRtl ? "عرض الشهادة الرسمية الكاملة" : "View Full Certificate"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Back Link */}
          <div style={{textAlign: "center", marginTop: 16}}>
            <Link
              to="/my-registrations"
              style={{
                color: "#084b2f",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{isRtl ? "العودة إلى فعالياتي المسجلة" : "Back to My Registrations"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Certificate Viewer Modal */}
      {modalOpen && certificateForModal && (
        <IUCertificateModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          certificate={certificateForModal}
        />
      )}
    </div>
  );
};

export default VerifyCertificate;

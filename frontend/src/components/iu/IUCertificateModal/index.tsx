import React from "react";
import {CertificateData} from "../../../api/attendee.client";
import {IconPrinter, IconX, IconCheck, IconShieldCheck, IconAward, IconQrcode} from "@tabler/icons-react";

interface IUCertificateModalProps {
  opened: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export const IUCertificateModal: React.FC<IUCertificateModalProps> = ({
  opened,
  onClose,
  certificate,
}) => {
  if (!opened || !certificate) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = certificate.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : certificate.event_date;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      dir="rtl"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #iu-certificate-printable, #iu-certificate-printable * {
            visibility: visible !important;
          }
          #iu-certificate-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px 40px !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .iu-cert-modal-header {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 24,
          maxWidth: 900,
          width: "100%",
          maxHeight: "94vh",
          overflowY: "auto",
          boxShadow: "0 28px 75px rgba(0, 0, 0, 0.4)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Controls Header */}
        <div
          className="iu-cert-modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f8faf9",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 10, color: "var(--iu-green-primary, #084b2f)", fontWeight: 700, fontSize: 15}}>
            <IconShieldCheck size={22} color="#084b2f" />
            <span>شهادة حضور معتمدة وموثقة إلكترونياً</span>
          </div>
          <div style={{display: "flex", gap: 10}}>
            <button
              onClick={handlePrint}
              className="btn solid"
              style={{
                padding: "8px 20px",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#084b2f",
                color: "#fff",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <IconPrinter size={18} />
              طباعة / حفظ PDF
            </button>
            <button
              onClick={onClose}
              className="btn outline"
              style={{
                padding: "8px 14px",
                fontSize: 14,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* The Printable Certificate Container */}
        <div
          id="iu-certificate-printable"
          style={{
            padding: "48px 56px",
            margin: "24px auto",
            maxWidth: 820,
            width: "100%",
            backgroundColor: "#ffffff",
            position: "relative",
            textAlign: "center",
            boxSizing: "border-box",
            borderRadius: 20,
            border: "4px solid #084b2f",
            outline: "2px solid #d4af37",
            outlineOffset: "-12px",
            background: "linear-gradient(135deg, #ffffff 0%, #f7faf8 50%, #ffffff 100%)",
            boxShadow: "0 10px 30px rgba(8, 75, 47, 0.08)",
          }}
        >
          {/* Corner Islamic Ornaments */}
          <div style={{position: "absolute", top: 16, right: 20, color: "#d4af37", fontSize: 20, lineHeight: 1}}>❖</div>
          <div style={{position: "absolute", top: 16, left: 20, color: "#d4af37", fontSize: 20, lineHeight: 1}}>❖</div>
          <div style={{position: "absolute", bottom: 16, right: 20, color: "#d4af37", fontSize: 20, lineHeight: 1}}>❖</div>
          <div style={{position: "absolute", bottom: 16, left: 20, color: "#d4af37", fontSize: 20, lineHeight: 1}}>❖</div>

          {/* Certificate Header Section */}
          <div style={{marginBottom: 24}}>
            <img
              src="/images/IUEvent2.png"
              alt="الجامعة الإسلامية بالمدينة المنورة"
              style={{height: 76, width: "auto", margin: "0 auto 12px", display: "block"}}
            />
            <div style={{fontSize: 15, fontWeight: 700, color: "#084b2f", letterSpacing: 0.5}}>
              المملكة العربية السعودية
            </div>
            <div style={{fontSize: 20, fontWeight: 900, color: "#0f172a", marginTop: 2}}>
              الجامعة الإسلامية بالمدينة المنورة
            </div>
            <div style={{fontSize: 13, color: "#475569", marginTop: 2, fontWeight: 600}}>
              وكالة الجامعة للشؤون الأكاديمية والتطوير • عمادة التعليم المستمر والتطوير
            </div>
          </div>

          {/* Decorative Divider Line */}
          <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "16px 0 24px"}}>
            <div style={{flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #d4af37)"}} />
            <IconAward size={28} color="#d4af37" />
            <div style={{flex: 1, height: 1, background: "linear-gradient(-90deg, transparent, #d4af37)"}} />
          </div>

          {/* Certificate Title Badge */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#ffffff",
              backgroundColor: "#084b2f",
              padding: "10px 40px",
              borderRadius: 50,
              display: "inline-block",
              letterSpacing: 1,
              boxShadow: "0 6px 18px rgba(8, 75, 47, 0.25)",
              border: "2px solid #d4af37",
              marginBottom: 24,
            }}
          >
            شهادة حضور واجتياز
          </div>

          {/* Declaration Statement */}
          <p style={{fontSize: 16, color: "#334155", margin: "16px 0 12px", lineHeight: 1.8}}>
            تقر عمادة التطوير والتعليم المستمر بأن المشارك/ة:
          </p>

          {/* Attendee Name Box */}
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#084b2f",
              margin: "12px auto 24px",
              padding: "12px 36px",
              backgroundColor: "#f0f7f3",
              borderRadius: 16,
              display: "inline-block",
              border: "2px dashed #084b2f",
              boxShadow: "inset 0 2px 6px rgba(8, 75, 47, 0.06)",
              minWidth: 320,
            }}
          >
            {certificate.attendee_name}
          </div>

          {/* Detailed Statement */}
          <p style={{fontSize: 16, color: "#334155", lineHeight: 2, margin: "0 auto 32px", maxWidth: 620}}>
            قد حضر/ت وأتم/ت بكفاءة واقتدار كافة متطلبات الفعالية العلمية المقامة بعنوان:
            <br />
            <strong
              style={{
                color: "#0f172a",
                fontSize: 20,
                fontWeight: 900,
                display: "inline-block",
                marginTop: 8,
                padding: "4px 16px",
                background: "rgba(212, 175, 55, 0.12)",
                borderRadius: 8,
                border: "1px solid rgba(212, 175, 55, 0.3)",
              }}
            >
              « {certificate.event_title} »
            </strong>
            <br />
            المنعقدة في <span style={{fontWeight: 700}}>{certificate.location}</span> بتاريخ <span style={{fontWeight: 700}}>{certificate.event_date}</span>.
          </p>

          {/* Footer Seals & Verification Row */}
          <div
            style={{
              marginTop: 36,
              paddingTop: 24,
              borderTop: "2px double #e2e8f0",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              alignItems: "center",
              textAlign: "right",
            }}
          >
            {/* Left Column: Verification Code & QR */}
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div style={{background: "#fff", padding: 8, borderRadius: 10, border: "1px solid #cbd5e1"}}>
                <IconQrcode size={52} color="#084b2f" />
              </div>
              <div>
                <div style={{fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 2}}>
                  رمز التوثيق الإلكتروني للشهادة:
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#084b2f",
                    letterSpacing: 2,
                    direction: "ltr",
                  }}
                >
                  {certificate.certificate_code}
                </div>
                <div style={{fontSize: 11, color: "#94a3b8", marginTop: 4}}>
                  تاريخ الإصدار: {formattedDate}
                </div>
              </div>
            </div>

            {/* Right Column: Seal & Official Signature */}
            <div style={{textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: "3px double #d4af37",
                  backgroundColor: "#084b2f",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(8, 75, 47, 0.25)",
                  padding: 6,
                  textAlign: "center",
                }}
              >
                <IconCheck size={22} color="#d4af37" />
                <span style={{fontSize: 9, fontWeight: 900, marginTop: 2, letterSpacing: 0.5}}>الجامعة الإسلامية</span>
                <span style={{fontSize: 8, opacity: 0.9}}>معتمدة رسمياً</span>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#166534",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "4px 10px",
                  borderRadius: 6,
                  marginTop: 8,
                  fontWeight: 700,
                }}
              >
                <IconCheck size={14} />
                تم التحقق من الحضور عبر المنصة الرسمية
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IUCertificateModal;

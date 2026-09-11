import React from "react";
import {CertificateData} from "../../../api/attendee.client";
import {IconPrinter, IconX, IconCheck, IconShieldCheck} from "@tabler/icons-react";

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      dir="rtl"
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 24,
          maxWidth: 820,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Controls Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 8, color: "#084b2f", fontWeight: 700, fontSize: 15}}>
            <IconShieldCheck size={20} />
            شهادة معتمدة موثقة رقمياً
          </div>
          <div style={{display: "flex", gap: 10}}>
            <button
              onClick={handlePrint}
              className="btn solid"
              style={{padding: "6px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6}}
            >
              <IconPrinter size={16} />
              طباعة / حفظ PDF
            </button>
            <button
              onClick={onClose}
              className="btn outline"
              style={{padding: "6px 12px", fontSize: 13}}
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* The Printable Certificate Container */}
        <div
          id="iu-certificate-printable"
          style={{
            padding: "40px 48px",
            margin: "20px auto",
            maxWidth: 720,
            width: "100%",
            backgroundColor: "#ffffff",
            border: "8px double #084b2f",
            borderRadius: 16,
            position: "relative",
            textAlign: "center",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #ffffff 0%, #f7faf8 100%)",
          }}
        >
          {/* Certificate Header */}
          <div style={{marginBottom: 20}}>
            <img
              src="/images/IUEvent2.png"
              alt="الجامعة الإسلامية"
              style={{height: 70, width: "auto", margin: "0 auto 12px", display: "block"}}
            />
            <div style={{fontSize: 16, fontWeight: 800, color: "#084b2f", letterSpacing: 0.5}}>
              المملكة العربية السعودية
            </div>
            <div style={{fontSize: 18, fontWeight: 800, color: "#111827", marginTop: 2}}>
              الجامعة الإسلامية بالمدينة المنورة
            </div>
            <div style={{fontSize: 13, color: "#4b5563", marginTop: 2}}>
              وكالة الجامعة للشؤون الأكاديمية والتطوير
            </div>
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#084b2f",
              margin: "24px 0 16px",
              borderBottom: "2px solid #1b754b",
              display: "inline-block",
              paddingBottom: 6,
              letterSpacing: 1,
            }}
          >
            شهادة حضور واجتياز
          </div>

          <p style={{fontSize: 16, color: "#374151", margin: "16px 0 12px", lineHeight: 1.8}}>
            تشهد عمادة التطوير والتعليم المستمر بالجامعة الإسلامية بأن المشارك/ة:
          </p>

          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#053320",
              margin: "12px 0 20px",
              padding: "10px 24px",
              background: "#eef7f2",
              borderRadius: 12,
              display: "inline-block",
              border: "1px dashed #1b754b",
            }}
          >
            {certificate.attendee_name}
          </div>

          <p style={{fontSize: 16, color: "#374151", lineHeight: 1.9, margin: "0 auto 24px", maxWidth: 560}}>
            قد حضر/ت وأتم/ت متطلبات الفعالية المقامة بعنوان:
            <br />
            <strong style={{color: "#111827", fontSize: 18, fontWeight: 800, display: "inline-block", marginTop: 6}}>
              « {certificate.event_title} »
            </strong>
            <br />
            المنعقدة في {certificate.location} بتاريخ {certificate.event_date}.
          </p>

          {/* Certificate Footer / Verification */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid #d1fae5",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              alignItems: "center",
              textAlign: "right",
            }}
          >
            <div>
              <div style={{fontSize: 12, color: "#6b7280", marginBottom: 4}}>
                رمز التحقق الرسمي للشهادة:
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#084b2f",
                  letterSpacing: 1.5,
                  direction: "ltr",
                  display: "inline-block",
                }}
              >
                {certificate.certificate_code}
              </div>
              <div style={{fontSize: 11, color: "#9ca3af", marginTop: 4}}>
                تاريخ الإصدار: {new Date(certificate.issued_at).toLocaleDateString("ar-SA")}
              </div>
            </div>

            <div style={{textAlign: "left"}}>
              <div style={{fontSize: 14, fontWeight: 800, color: "#084b2f"}}>
                الجامعة الإسلامية بالمدينة المنورة
              </div>
              <div style={{fontSize: 12, color: "#4b5563", marginTop: 2}}>
                الختم الإلكتروني المعتمد ✓
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#15803d",
                  backgroundColor: "#f0fdf4",
                  padding: "4px 8px",
                  borderRadius: 6,
                  marginTop: 6,
                }}
              >
                <IconCheck size={14} />
                تم التحقق من الحضور عبر النظام
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IUCertificateModal;

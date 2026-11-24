import React from "react";
import {createPortal} from "react-dom";
import {t} from "@lingui/macro";
import {CertificateData} from "../../../api/attendee.client";
import {IconPrinter, IconX, IconShieldCheck} from "@tabler/icons-react";

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
  if (!opened || !certificate || typeof document === "undefined") return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Format date in Arabic
  const eventDateAr = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(new Date(certificate.event_date));

  return createPortal(
    <div
      id="iu-certificate-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      dir="rtl"
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > :not(#iu-certificate-overlay) {
            display: none !important;
          }
          #iu-certificate-overlay {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            backdrop-filter: none !important;
          }
          #iu-certificate-shell {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: none !important;
            max-height: none !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            background: none !important;
            overflow: visible !important;
          }
          .iu-cert-modal-header {
            display: none !important;
          }
          .iu-cert-preview-wrapper {
            padding: 0 !important;
            background: none !important;
          }
          #iu-certificate-printable {
            width: 297mm !important;
            height: 210mm !important;
            max-width: none !important;
            max-height: none !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div
        id="iu-certificate-shell"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 20,
          maxWidth: 1040,
          width: "100%",
          maxHeight: "94vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
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
            flexWrap: "wrap",
            gap: 12,
            padding: "14px 24px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          {/* Certificate Badge and Verification Code */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#084b2f",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <IconShieldCheck size={22} color="#084b2f" />
            <span>شهادة حضور معتمدة وموثقة إلكترونياً</span>
            <span
              style={{
                fontSize: 12,
                color: "#64748b",
                fontFamily: "monospace",
                fontWeight: 600,
                padding: "2px 8px",
                backgroundColor: "#e2e8f0",
                borderRadius: 4,
                direction: "ltr",
              }}
            >
              #{certificate.certificate_code}
            </span>
          </div>

          {/* Actions */}
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              type="button"
              style={{
                padding: "8px 22px",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#084b2f",
                color: "#ffffff",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(8, 75, 47, 0.25)",
                transition: "background-color 0.2s ease",
              }}
            >
              <IconPrinter size={18} />
              <span>طباعة / حفظ PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label={t`Close`}
              type="button"
              style={{
                padding: "8px 12px",
                fontSize: 14,
                borderRadius: 8,
                cursor: "pointer",
                backgroundColor: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#475569",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Outer Padding wrapper for Preview */}
        <div
          className="iu-cert-preview-wrapper"
          style={{
            padding: "24px",
            backgroundColor: "#edf2f7",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          {/* ========================================================================= */}
          {/* Official Canva Certificate Canvas (A4 Landscape Format)                    */}
          {/* ========================================================================= */}
          <div
            id="iu-certificate-printable"
            style={{
              width: "100%",
              maxWidth: 960,
              aspectRatio: "1024 / 723", // Matches the Canva A4 Landscape dimensions
              backgroundColor: "#ffffff",
              backgroundImage: "url('/assets/iu/iu-canva-certificate-base.jpg')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
              boxSizing: "border-box",
              boxShadow: "0 14px 40px rgba(0, 0, 0, 0.16)",
              textAlign: "center",
              fontFamily: "'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif",
              overflow: "hidden",
            }}
            dir="rtl"
          >
            {/* 1. Dynamic Attendee Name (Positioned above golden horizontal divider) */}
            <div
              style={{
                position: "absolute",
                top: "44%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "82%",
                textAlign: "center",
                fontFamily: "'Tajawal', 'Cairo', system-ui, sans-serif",
                fontSize: "2.35rem",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.25,
                wordBreak: "break-word",
                letterSpacing: "-0.5px",
                zIndex: 3,
              }}
            >
              {certificate.attendee_name}
            </div>

            {/* 2. Dynamic Event Title & Date Participation Sentence */}
            <div
              style={{
                position: "absolute",
                top: "58.8%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "78%",
                textAlign: "center",
                fontFamily: "'Tajawal', 'Cairo', system-ui, sans-serif",
                fontSize: "1.02rem",
                fontWeight: 700,
                color: "#1e293b",
                lineHeight: 1.85,
                zIndex: 3,
              }}
            >
              <span>وذلك لمشاركته في ورشة العمل بعنوان: &quot;<strong>{certificate.event_title}</strong>&quot;</span>
              <br />
              <span>والتي أُقيمت بتاريخ {eventDateAr} في رحاب الجامعة الإسلامية بالمدينة المنورة.</span>
            </div>

            {/* 3. Dynamic Date above the "التاريخ" line (Right side in RTL) */}
            <div
              style={{
                position: "absolute",
                bottom: "16.8%",
                right: "21.5%",
                transform: "translateX(50%)",
                textAlign: "center",
                fontFamily: "'Tajawal', 'Cairo', system-ui, sans-serif",
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#334155",
                direction: "rtl",
                whiteSpace: "nowrap",
                zIndex: 3,
              }}
            >
              {eventDateAr}
            </div>

            {/* 4. Electronic Verification Seal above the "التوقيع" line (Left side in RTL) */}
            <div
              style={{
                position: "absolute",
                bottom: "16.2%",
                left: "21.5%",
                transform: "translateX(-50%)",
                textAlign: "center",
                direction: "ltr",
                zIndex: 3,
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  color: "#084b2f",
                  letterSpacing: "0.5px",
                  marginBottom: "1px",
                }}
              >
                ✓ توثيق معتمد
              </div>
              <a
                href={`/certificates/verify/${certificate.certificate_code}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  color: "#475569",
                  textDecoration: "none",
                  display: "inline-block",
                }}
                title="التحقق من صحة الشهادة إلكترونياً"
              >
                #{certificate.certificate_code}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IUCertificateModal;

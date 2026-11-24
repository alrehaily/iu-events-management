import React from "react";
import {createPortal} from "react-dom";
import {t} from "@lingui/macro";
import {useIULanguage} from "../../../context/IULanguageContext";
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
  const {dir, locale} = useIULanguage();
  if (!opened || !certificate || typeof document === "undefined") return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isArabic = locale.startsWith("ar");

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Riyadh",
  });
  const eventDate = formatter.format(new Date(certificate.event_date));

  // Determine issuer text
  const rawIssuer = certificate.issuer?.trim();
  let issuerText = "";
  if (isArabic) {
    if (rawIssuer && !rawIssuer.includes("الجامعة الإسلامية")) {
      issuerText = `${rawIssuer} بالجامعة الإسلامية بالمدينة المنورة`;
    } else if (rawIssuer) {
      issuerText = rawIssuer;
    } else {
      issuerText = "الجامعة الإسلامية بالمدينة المنورة";
    }
  } else {
    issuerText = rawIssuer
      ? `${rawIssuer} at the Islamic University of Madinah`
      : "The Islamic University of Madinah";
  }

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
      dir={dir}
    >
      <style>{`
        @page {
          size: landscape;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body > :not(#iu-certificate-overlay) {
            display: none !important;
          }
          #iu-certificate-overlay {
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            backdrop-filter: none !important;
          }
          #iu-certificate-shell {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            max-height: 100% !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            background: none !important;
          }
          #iu-certificate-printable {
            width: 100vw !important;
            height: 56.25vw !important;
            max-height: 100vh !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .iu-cert-modal-header {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="iu-certificate-shell"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 20,
          maxWidth: 1020,
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
            padding: "14px 24px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#2e3b5d",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <IconShieldCheck size={22} color="#2e3b5d" />
            <span>{t`Verified attendance certificate`}</span>
            <span
              style={{
                fontSize: 12,
                color: "#64748b",
                fontFamily: "monospace",
                fontWeight: 600,
                padding: "2px 8px",
                backgroundColor: "#e2e8f0",
                borderRadius: 4,
              }}
            >
              #{certificate.certificate_code}
            </span>
          </div>
          <div style={{display: "flex", gap: 10}}>
            <button
              onClick={handlePrint}
              type="button"
              style={{
                padding: "8px 20px",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#2e3b5d",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(46, 59, 93, 0.25)",
              }}
            >
              <IconPrinter size={18} />
              {t`Print or save as PDF`}
            </button>
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

        {/* Outer Padding wrapper for Slide preview */}
        <div
          style={{
            padding: "28px",
            backgroundColor: "#edf2f7",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          {/* 16:9 Presentation Slide Certificate */}
          <div
            id="iu-certificate-printable"
            style={{
              width: "100%",
              maxWidth: 960,
              aspectRatio: "16 / 9",
              backgroundColor: "#ffffff",
              position: "relative",
              boxSizing: "border-box",
              border: "2px solid #2e3b5d",
              borderBottom: "18px solid #2e3b5d",
              boxShadow: "0 12px 36px rgba(46, 59, 93, 0.15)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "36px 44px 20px 44px",
              textAlign: "center",
              fontFamily: "'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Top Right Corner Emblem */}
            <div
              style={{
                position: "absolute",
                top: 24,
                right: 32,
                zIndex: 2,
              }}
            >
              <img
                src="/assets/iu/iu-emblem.png"
                alt="شعار الجامعة الإسلامية"
                style={{
                  height: 80,
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Top Section: Title & Intro */}
            <div style={{marginTop: 6}}>
              {/* Certificate Golden Title */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                {isArabic ? (
                  <img
                    src="/assets/iu/iu-certificate-title.png"
                    alt="شهادة حضور"
                    style={{
                      height: 64,
                      width: "auto",
                      display: "block",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      letterSpacing: 2,
                      background: "linear-gradient(135deg, #c59b27 0%, #8c6d2d 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    CERTIFICATE OF ATTENDANCE
                  </div>
                )}
              </div>

              {/* Introductory Greeting Line */}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2e3b5d",
                  lineHeight: 1.6,
                  margin: "0 auto",
                  maxWidth: 720,
                }}
              >
                {isArabic ? (
                  <>تتقدم {issuerText} بالشكر والتقدير للمكرم</>
                ) : (
                  <>{issuerText} extends its sincere gratitude and appreciation to</>
                )}
              </div>
            </div>

            {/* Middle Section: Attendee Name Box with 3 vertical stripes */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                margin: "12px 0",
              }}
            >
              {/* 3 Navy Vertical Bars (▌▌▌) */}
              <div
                style={{
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: 11,
                    height: 38,
                    backgroundColor: "#2e3b5d",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: 11,
                    height: 38,
                    backgroundColor: "#2e3b5d",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: 11,
                    height: 38,
                    backgroundColor: "#2e3b5d",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
              </div>

              {/* Attendee Name Solid Navy Rectangle */}
              <div
                style={{
                  backgroundColor: "#2e3b5d",
                  color: "#ffffff",
                  padding: "8px 36px",
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: 24,
                  letterSpacing: 0.5,
                  minWidth: 280,
                  textAlign: "center",
                  boxShadow: "0 4px 10px rgba(46, 59, 93, 0.2)",
                }}
              >
                {certificate.attendee_name}
              </div>
            </div>

            {/* Participation Text Section */}
            <div
              style={{
                color: "#2e3b5d",
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 2.1,
                maxWidth: 740,
                margin: "0 auto",
              }}
            >
              {isArabic ? (
                <>
                  <div>
                    وذلك لمشاركته في ورشة العمل بعنوان: &quot;{certificate.event_title}&quot;
                  </div>
                  <div>
                    والتي أقيمت بتاريخ {eventDate} في رحاب الجامعة الإسلامية بالمدينة المنورة
                  </div>
                  <div style={{marginTop: 6, fontSize: 16, fontWeight: 700}}>
                    سائلين الله له دوام التوفيق والنجاح
                  </div>
                </>
              ) : (
                <>
                  <div>
                    For active participation in the workshop entitled: &quot;{certificate.event_title}&quot;
                  </div>
                  <div>
                    Held on {eventDate} at the Islamic University of Madinah
                  </div>
                  <div style={{marginTop: 6, fontSize: 16, fontWeight: 700}}>
                    Wishing them continued success and distinction.
                  </div>
                </>
              )}
            </div>

            {/* Bottom Row: Ornament in center, empty signature on left, subtle code on right */}
            <div
              style={{
                position: "relative",
                minHeight: 60,
                marginTop: 10,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              {/* Bottom Left: Completely Empty as requested by user (no dean, no college, no signature) */}
              <div style={{width: 200}} />

              {/* Bottom Center: Golden Islamic 8-Point Rosette Ornament resting on the bottom navy bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }}
              >
                <img
                  src="/assets/iu/iu-ornament.png"
                  alt=""
                  style={{
                    height: 70,
                    width: "auto",
                    display: "block",
                  }}
                />
              </div>

              {/* Bottom Right: Discreet Accreditation Reference Code */}
              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  fontWeight: 600,
                  fontFamily: "monospace",
                  textAlign: dir === "rtl" ? "left" : "right",
                  paddingBottom: 2,
                }}
              >
                {t`Ref:`} {certificate.certificate_code}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IUCertificateModal;


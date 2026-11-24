import React, {useState} from "react";
import {createPortal} from "react-dom";
import {t} from "@lingui/macro";
import {useIULanguage} from "../../../context/IULanguageContext";
import {CertificateData} from "../../../api/attendee.client";
import {IconPrinter, IconX, IconShieldCheck, IconWorld} from "@tabler/icons-react";

interface IUCertificateModalProps {
  opened: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

// Pure SVG Islamic 8-point geometric star rosette
const IslamicRosette: React.FC<{ strokeColor?: string; width?: number; height?: number }> = ({
  strokeColor = "#c59b27",
  width = 170,
  height = 54,
}) => (
  <svg
    viewBox="30 8 140 60"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    <g stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.95">
      {/* 8 radiating Islamic geometric kite petals */}
      <path d="M 112.0,56.0 L 125.9,45.3 L 152.0,56.0 L 125.9,66.7 Z" />
      <path d="M 108.5,64.5 L 125.9,66.7 L 136.8,92.8 L 110.7,81.9 Z" />
      <path d="M 100.0,68.0 L 110.7,81.9 L 100.0,108.0 L 89.3,81.9 Z" />
      <path d="M 91.5,64.5 L 89.3,81.9 L 63.2,92.8 L 74.1,66.7 Z" />
      <path d="M 88.0,56.0 L 74.1,66.7 L 48.0,56.0 L 74.1,45.3 Z" />
      <path d="M 91.5,47.5 L 74.1,45.3 L 63.2,19.2 L 89.3,30.1 Z" />
      <path d="M 100.0,44.0 L 89.3,30.1 L 100.0,4.0 L 110.7,30.1 Z" />
      <path d="M 108.5,47.5 L 110.7,30.1 L 136.8,19.2 L 125.9,45.3 Z" />
      {/* Central 8-pointed polygon star */}
      <polygon points="108.5,52.5 108.5,59.5 103.5,64.5 96.5,64.5 91.5,59.5 91.5,52.5 96.5,47.5 103.5,47.5" fill="none" strokeWidth="1.2" />
    </g>
  </svg>
);

export const IUCertificateModal: React.FC<IUCertificateModalProps> = ({
  opened,
  onClose,
  certificate,
}) => {
  const {dir, locale} = useIULanguage();
  const initialLang = locale.startsWith("ar") ? "ar" : "en";
  const [templateLang, setTemplateLang] = useState<"ar" | "en">(initialLang);

  if (!opened || !certificate || typeof document === "undefined") return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isArabicTemplate = templateLang === "ar";

  // Format dates for both languages
  const eventDateAr = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(new Date(certificate.event_date));

  const eventDateEn = new Intl.DateTimeFormat("en-US", {
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
      dir={isArabicTemplate ? "rtl" : "ltr"}
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
              color: "#1e3a5f",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <IconShieldCheck size={22} color="#1e3a5f" />
            <span>
              {isArabicTemplate
                ? "شهادة حضور معتمدة وموثقة إلكترونياً"
                : "Officially Verified Attendance Certificate"}
            </span>
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

          {/* Template Switcher & Actions */}
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            {/* Arabic / English Template Toggle */}
            <div
              style={{
                display: "inline-flex",
                backgroundColor: "#e2e8f0",
                padding: "3px",
                borderRadius: 8,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setTemplateLang("ar")}
                style={{
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: isArabicTemplate ? 700 : 500,
                  color: isArabicTemplate ? "#1e3a5f" : "#64748b",
                  backgroundColor: isArabicTemplate ? "#ffffff" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  boxShadow: isArabicTemplate ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setTemplateLang("en")}
                style={{
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: !isArabicTemplate ? 700 : 500,
                  color: !isArabicTemplate ? "#1e3a5f" : "#64748b",
                  backgroundColor: !isArabicTemplate ? "#ffffff" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  boxShadow: !isArabicTemplate ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                English
              </button>
            </div>

            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              type="button"
              style={{
                padding: "8px 20px",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#1e3a5f",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(30, 58, 95, 0.25)",
              }}
            >
              <IconPrinter size={18} />
              {isArabicTemplate ? "طباعة / حفظ PDF" : "Print / Save PDF"}
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
          {/* A4 Landscape Certificate Canvas (Independent Arabic or English Template)   */}
          {/* ========================================================================= */}
          <div
            id="iu-certificate-printable"
            style={{
              width: "100%",
              maxWidth: 960,
              aspectRatio: "297 / 210", // A4 Landscape ratio
              backgroundColor: "#ffffff",
              position: "relative",
              boxSizing: "border-box",
              border: "2px solid #1e3a5f",
              borderBottom: "22px solid #1e3a5f",
              boxShadow: "0 14px 40px rgba(30, 58, 95, 0.16)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "36px 48px 16px 48px",
              textAlign: "center",
              fontFamily: isArabicTemplate
                ? "'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif"
                : "'Cinzel', 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
              overflow: "hidden",
            }}
            dir={isArabicTemplate ? "rtl" : "ltr"}
          >
            {/* Subtle 3D Polygonal Texture Overlay (Hero-style with subtle transparency) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/assets/iu/poly-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 0.045,
                mixBlendMode: "multiply",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Elegant Inner Geometric Hairline Border */}
            <div
              style={{
                position: "absolute",
                inset: 10,
                bottom: 14,
                border: "1px solid rgba(197, 155, 39, 0.45)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {/* Top Official Islamic University Sunburst Emblem */}
            <div
              style={{
                position: "absolute",
                top: 24,
                [isArabicTemplate ? "right" : "left"]: 32,
                zIndex: 3,
              }}
            >
              <img
                src="/assets/iu/iu-emblem.png"
                alt="شعار الجامعة الإسلامية بالمدينة المنورة"
                style={{
                  height: 82,
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Content Container (Layered above the 3D polygon watermark) */}
            <div style={{position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between"}}>
              {/* Top Section: Title & Institutional Greeting */}
              <div style={{marginTop: 4}}>
                {/* Pure Vector Golden Certificate Title */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  {isArabicTemplate ? (
                    <svg viewBox="0 0 460 70" width="380" height="60" style={{ display: "block", margin: "0 auto" }}>
                      <defs>
                        <linearGradient id="iuGoldArGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#b8860b" />
                          <stop offset="25%" stopColor="#d4af37" />
                          <stop offset="50%" stopColor="#c59b27" />
                          <stop offset="75%" stopColor="#e8cf78" />
                          <stop offset="100%" stopColor="#b8860b" />
                        </linearGradient>
                      </defs>
                      <text
                        x="50%"
                        y="50"
                        textAnchor="middle"
                        fill="url(#iuGoldArGrad)"
                        fontFamily="'Tajawal', 'Cairo', system-ui, sans-serif"
                        fontWeight="900"
                        fontSize="46"
                        letterSpacing="3"
                      >
                        شـهـادة حـضـور
                      </text>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 560 60" width="460" height="52" style={{ display: "block", margin: "0 auto" }}>
                      <defs>
                        <linearGradient id="iuGoldEnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#996515" />
                          <stop offset="25%" stopColor="#c59b27" />
                          <stop offset="50%" stopColor="#d4af37" />
                          <stop offset="75%" stopColor="#e8cf78" />
                          <stop offset="100%" stopColor="#996515" />
                        </linearGradient>
                      </defs>
                      <text
                        x="50%"
                        y="42"
                        textAnchor="middle"
                        fill="url(#iuGoldEnGrad)"
                        fontFamily="'Cinzel', 'Trajan Pro', 'Cairo', system-ui, sans-serif"
                        fontWeight="800"
                        fontSize="28"
                        letterSpacing="5"
                      >
                        CERTIFICATE OF ATTENDANCE
                      </text>
                    </svg>
                  )}
                </div>

                {/* Institutional Greeting */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1e3a5f",
                    lineHeight: 1.6,
                    margin: "0 auto",
                    maxWidth: 720,
                  }}
                >
                  {isArabicTemplate ? (
                    <>تتقدم الجامعة الإسلامية بالمدينة المنورة بالشكر والتقدير للمكرم</>
                  ) : (
                    <>The Islamic University of Madinah extends its sincere appreciation to</>
                  )}
                </div>
              </div>

              {/* Middle Section: Dynamic Attendee Full Name with 3 Navy Stripes */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  margin: "8px 0",
                }}
              >
                {/* 3 Navy Vertical Bars (▌▌▌) */}
                <div
                  style={{
                    display: "inline-flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 38,
                      backgroundColor: "#1e3a5f",
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 38,
                      backgroundColor: "#1e3a5f",
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 38,
                      backgroundColor: "#1e3a5f",
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  />
                </div>

                {/* Dynamic Attendee Name Solid Navy Rectangle */}
                <div
                  style={{
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    padding: "10px 40px",
                    borderRadius: 4,
                    fontWeight: 800,
                    fontSize: 26,
                    letterSpacing: 0.5,
                    minWidth: 280,
                    maxWidth: "75%",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(30, 58, 95, 0.22)",
                    wordBreak: "break-word",
                  }}
                >
                  {certificate.attendee_name}
                </div>
              </div>

              {/* Dynamic Participation Text Section */}
              <div
                style={{
                  color: "#1e3a5f",
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 2.1,
                  maxWidth: 740,
                  margin: "0 auto",
                }}
              >
                {isArabicTemplate ? (
                  <>
                    <div>
                      وذلك لمشاركته في ورشة العمل بعنوان: &quot;{certificate.event_title}&quot;
                    </div>
                    <div>
                      والتي أقيمت بتاريخ {eventDateAr} في رحاب الجامعة الإسلامية بالمدينة المنورة
                    </div>
                    <div style={{marginTop: 6, fontSize: 16, fontWeight: 700}}>
                      سائلين الله له دوام التوفيق والنجاح
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      For active participation in the event entitled: &quot;{certificate.event_title}&quot;
                    </div>
                    <div>
                      Held on {eventDateEn} at the Islamic University of Madinah
                    </div>
                    <div style={{marginTop: 6, fontSize: 16, fontWeight: 700}}>
                      Wishing them continued success and distinction.
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Row: Ornament resting on bottom navy bar, empty signatures, reference code */}
              <div
                style={{
                  position: "relative",
                  minHeight: 52,
                  marginTop: 8,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                {/* Bottom Left / Corner: Discreet Certificate Verification Code */}
                <a
                  href={`/certificates/verify/${certificate.certificate_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontFamily: "monospace",
                    direction: "ltr",
                    paddingBottom: 2,
                    textDecoration: "none",
                  }}
                  title={isArabicTemplate ? "التحقق من صحة الشهادة" : "Verify Certificate Online"}
                >
                  Ref: {certificate.certificate_code}
                </a>

                {/* Bottom Center: Pure Vector SVG Islamic Geometric Rosette resting on bottom navy bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                    zIndex: 4,
                  }}
                >
                  <IslamicRosette width={180} height={56} strokeColor="#c59b27" />
                </div>

                {/* Empty balanced spacer opposite to ref code (Strict: No dean, no signatures, no college) */}
                <div style={{width: 120}} />
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



import React, {useEffect} from "react";
import {IconLoader2, IconX} from "@tabler/icons-react";
import {useIULanguage} from "../../../context/IULanguageContext";

export interface IUConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}

export const IUConfirmModal: React.FC<IUConfirmModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
}) => {
  const {isArabic, t} = useIULanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && opened && !loading) {
        onClose();
      }
    };

    if (opened) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [opened, loading, onClose]);

  if (!opened) return null;

  const defaultConfirmText = confirmLabel || t("confirm_btn", "تأكيد");
  const defaultCancelText = cancelLabel || t("cancel_btn", "إلغاء");
  const modalText = title || message || t("confirm_default_msg", "هل أنت متأكد من رغبتك في إتمام هذا الإجراء؟");

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: 16,
        animation: "iuFadeIn 0.2s ease-out forwards",
      }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes iuFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes iuModalScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes iuSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 24,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          position: "relative",
          animation: "iuModalScale 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          fontFamily: "var(--font-primary, inherit)",
          overflow: "hidden",
        }}
      >
        {/* Header / Body Section */}
        <div
          style={{
            padding: "28px 32px 24px",
            position: "relative",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {/* Close Button X */}
          {!loading && (
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 20,
                left: isArabic ? 20 : "auto",
                right: isArabic ? "auto" : 20,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.color = "#111827";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <IconX size={20} stroke={2} />
            </button>
          )}

          {/* Text content */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.6,
              textAlign: "center",
              marginTop: 6,
              paddingInline: 12,
            }}
          >
            {modalText}
          </div>

          {title && message && (
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: 1.5,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer Buttons Section */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          {/* Confirm Button (Solid Green Pill) */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "9px 28px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#10b981",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.18s ease",
              opacity: loading ? 0.75 : 1,
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#059669";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#10b981";
              }
            }}
          >
            {loading ? (
              <>
                <IconLoader2
                  size={18}
                  style={{animation: "iuSpin 1s linear infinite"}}
                />
                <span>{t("processing", "جاري...")}</span>
              </>
            ) : (
              defaultConfirmText
            )}
          </button>

          {/* Cancel Button (Outline Green Pill) */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "9px 28px",
              borderRadius: 999,
              border: "1.5px solid #10b981",
              backgroundColor: "#ffffff",
              color: "#10b981",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.18s ease",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#ecfdf5";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }
            }}
          >
            {defaultCancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IUConfirmModal;

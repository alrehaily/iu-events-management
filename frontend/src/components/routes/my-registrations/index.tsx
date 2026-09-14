import React, {useEffect, useState} from "react";
import {Link} from "react-router";
import {
  attendeeClient,
  AttendeeRegistrationData,
  AttendeeUser,
  CertificateData,
} from "../../../api/attendee.client";
import {IUCertificateModal} from "../../iu/IUCertificateModal";
import {IUHero} from "../../iu/IUHero";
import {
  IconCalendar,
  IconCheck,
  IconFileCertificate,
  IconMapPin,
  IconQrcode,
  IconTicket,
} from "@tabler/icons-react";
import "../../../styles/iu/common.css";
import {useIULanguage} from "../../../context/IULanguageContext";
import {useScrollReveal} from "../../../hooks/useScrollReveal";

export const MyRegistrationsPage: React.FC = () => {
  const {t, formatDate} = useIULanguage();
  const [user, setUser] = useState<AttendeeUser | null>(null);
  const [registrations, setRegistrations] = useState<AttendeeRegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "past">("all");

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("iu_attendee_token") || localStorage.getItem("token"));
    }
    return false;
  });

  useEffect(() => {
    const storedUser = attendeeClient.getStoredUser();
    const token = typeof window !== "undefined" ? (localStorage.getItem("iu_attendee_token") || localStorage.getItem("token")) : null;
    if (storedUser) {
      setUser(storedUser);
    }
    const authed = Boolean(token || storedUser);
    setIsLoggedIn(authed);
    if (authed) {
      loadRegistrations(storedUser?.email);
    } else {
      setLoading(false);
    }
  }, []);

  const loadRegistrations = async (email?: string) => {
    setLoading(true);
    try {
      const data = await attendeeClient.getRegistrations(email);
      setRegistrations(data.registrations || []);
    } catch (err: any) {
      // If unauthorized, they can still look up by email
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (orderShortId: string) => {
    if (!window.confirm(t("confirm_cancel_msg", "هل أنت متأكد من رغبتك في إلغاء هذا التسجيل والتذكرة؟"))) {
      return;
    }

    try {
      await attendeeClient.cancelRegistration(orderShortId);
      alert(t("cancel_success_msg", "تم إلغاء التسجيل بنجاح."));
      loadRegistrations(user?.email);
    } catch (err: any) {
      alert(err.response?.data?.message || "تعذر إلغاء التسجيل.");
    }
  };

  const handleFetchCertificate = async (attendeeIdentifier: string) => {
    setCertLoading(true);
    try {
      const cert = await attendeeClient.getCertificate(attendeeIdentifier);
      setSelectedCert(cert);
      setCertModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "غير مؤهل للشهادة: يلزم تأكيد حضور الفعالية أولاً.");
    } finally {
      setCertLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === "all") return true;
    const isCancelled = reg.status === "CANCELLED";
    if (activeTab === "active") return !isCancelled;
    if (activeTab === "past") return isCancelled;
    return true;
  });

  useScrollReveal([filteredRegistrations.length, loading, activeTab]);

  return (
    <div>
      {/* 1. Hero Section */}
      <IUHero
        title={t("my_reg_hero_title", "تذاكري وحجوزاتي")}
        description={t("my_reg_hero_desc", "استعرض فعالياتك المسجلة، رموز الدخول المباشر (QR)، وتحقق من الشهادات المعتمدة وحالة الحضور.")}
      />

      <div className="container" style={{paddingBlock: "40px", minHeight: "65vh"}}>
        {!isLoggedIn ? (
          <div
            className="iu-reveal"
            style={{
              background: "#fff",
              border: "1px dashed #d1d5db",
              borderRadius: 24,
              padding: "64px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{marginBottom: 16, display: "flex", justifyContent: "center"}}>
              <IconTicket size={52} stroke={1.5} color="var(--iu-icon, #0f172a)" />
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "22px",
                color: "#111827",
                fontWeight: 700,
                textAlign: "center",
                width: "100%",
              }}
            >
              {t("login_required_title", "يرجى تسجيل الدخول لعرض تذاكرك وحجوزاتك")}
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                color: "#6b7280",
                fontSize: "15px",
                textAlign: "center",
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              {t("login_required_desc", "قم بتسجيل الدخول إلى حسابك للوصول التلقائي إلى كافة تذاكر الفعاليات، رموز الدخول (QR)، والشهادات المعتمدة.")}
            </p>
            <Link
              to="/auth/login?redirect=/my-registrations"
              className="btn solid iu-interactive-pill"
              style={{padding: "10px 28px", textDecoration: "none", fontSize: "14px"}}
            >
              {t("nav_login", "تسجيل الدخول")}
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div style={{display: "flex", gap: 10, marginBottom: 24}}>
              <button
                onClick={() => setActiveTab("all")}
                className={`btn ${activeTab === "all" ? "solid" : "outline"} iu-interactive-pill`}
                style={{padding: "6px 20px", fontSize: 13, borderRadius: 999}}
              >
                {t("tab_all", "الكل")} ({registrations.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`btn ${activeTab === "active" ? "solid" : "outline"} iu-interactive-pill`}
                style={{padding: "6px 20px", fontSize: 13, borderRadius: 999}}
              >
                {t("tab_active", "الحجوزات النشطة")}
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`btn ${activeTab === "past" ? "solid" : "outline"} iu-interactive-pill`}
                style={{padding: "6px 20px", fontSize: 13, borderRadius: 999}}
              >
                {t("tab_cancelled", "الملغية")}
              </button>
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{textAlign: "center", padding: "60px 0", color: "#6b7280", fontSize: 15}}>
                {t("loading_events", "جاري تحميل الحجوزات والتذاكر...")}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredRegistrations.length === 0 && (
              <div
                className="iu-reveal"
                style={{
                  background: "#fff",
                  border: "1px dashed #d1d5db",
                  borderRadius: 24,
                  padding: "64px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{marginBottom: 16, display: "flex", justifyContent: "center"}}>
                  <IconTicket size={52} stroke={1.5} color="var(--iu-icon, #0f172a)" />
                </div>
                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: "22px",
                    color: "#111827",
                    fontWeight: 800,
                    textAlign: "center",
                    width: "100%",
                    display: "block",
                  }}
                >
                  {t("no_registrations_title", "لا توجد حجوزات مسجلة حالياً")}
                </h3>
                <p
                  style={{
                    margin: "0 0 24px",
                    color: "#6b7280",
                    fontSize: "15px",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: 500,
                    marginInline: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  {t("no_registrations_desc", "استكشف الفعاليات المتاحة في الجامعة الإسلامية وسجل حضورك الآن.")}
                </p>
                <Link
                  to="/events"
                  className="btn solid iu-interactive-pill"
                  style={{padding: "10px 28px", textDecoration: "none", fontSize: "14px"}}
                >
                  {t("browse_catalog_btn", "تصفح دليل الفعاليات")}
                </Link>
              </div>
            )}

            {/* Registrations List */}
            {!loading && filteredRegistrations.length > 0 && (
              <div style={{display: "grid", gap: 20}}>
                {filteredRegistrations.map((reg, idx) => {
                  const isCancelled = reg.status === "CANCELLED";
                  const eventDate = reg.event?.start_date
                    ? formatDate(reg.event.start_date)
                    : t("status_upcoming", "قريباً");

                  return (
                    <div
                      key={reg.order_id}
                      className={`iu-reveal iu-stagger-${(idx % 4) + 1} iu-hover-lift`}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 24,
                        padding: 24,
                        boxShadow: "0 10px 30px rgba(8, 75, 47, 0.05)",
                        opacity: isCancelled ? 0.65 : 1,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              backgroundColor: isCancelled ? "#fee2e2" : "#e0f2fe",
                              color: isCancelled ? "#991b1b" : "#075985",
                              marginBottom: 6,
                            }}
                          >
                            {isCancelled
                              ? t("booking_cancelled", "حجز ملغى")
                              : t("booking_confirmed", "حجز مؤكد ✓")}
                          </span>
                          <h3 style={{margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: "var(--iu-heading, #0f172a)"}}>
                            {reg.event?.title || t("brand_title", "فعالية في الجامعة الإسلامية")}
                          </h3>
                        </div>

                        <div style={{fontSize: 13, color: "var(--iu-text-muted, #64748b)"}}>
                          {t("order_number", "رقم الطلب:")} <span style={{fontFamily: "monospace", fontWeight: 700}}>#{reg.short_id}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 16,
                          fontSize: 13,
                          color: "#4b5563",
                          marginBottom: 20,
                          padding: "10px 14px",
                          background: "#f9fafb",
                          borderRadius: 14,
                        }}
                      >
                        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
                          <IconCalendar size={16} color="var(--iu-icon, #0f172a)" />
                          {eventDate}
                        </span>
                        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
                          <IconMapPin size={16} color="var(--iu-icon, #0f172a)" />
                          {reg.event?.location || t("default_location", "الجامعة الإسلامية بالمدينة المنورة")}
                        </span>
                      </div>

                      {/* Attendees / Tickets in this Order */}
                      <div style={{display: "grid", gap: 12}}>
                        {reg.attendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 12,
                              padding: "12px 16px",
                              border: "1px solid #f1f5f9",
                              borderRadius: 16,
                              backgroundColor: "#ffffff",
                            }}
                          >
                            <div>
                              <div style={{fontSize: 15, fontWeight: 700, color: "#1e293b"}}>
                                {attendee.first_name} {attendee.last_name}
                              </div>
                              <div style={{fontSize: 12, color: "#64748b", marginTop: 2}}>
                                {attendee.product_title} — {t("ticket_code", "رمز التذكرة:")} {attendee.short_id}
                              </div>
                              {attendee.checked_in ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 11,
                                    color: "#15803d",
                                    backgroundColor: "#dcfce7",
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    marginTop: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  <IconCheck size={13} /> {t("checked_in_badge", "تم تسجيل الحضور في القاعة")}
                                </span>
                              ) : (
                                <span style={{fontSize: 11, color: "#94a3b8", display: "inline-block", marginTop: 4}}>
                                  {t("awaiting_checkin", "بانتظار تسجيل الحضور عند الوصول")}
                                </span>
                              )}
                            </div>

                            {/* Action buttons per attendee */}
                            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                              {/* Certificate Button */}
                              <button
                                onClick={() => handleFetchCertificate(attendee.public_id)}
                                className="btn outline iu-interactive-pill"
                                disabled={certLoading || isCancelled || !attendee.checked_in}
                                title={
                                  !attendee.checked_in
                                    ? "يلزم تأكيد الحضور في موقع الفعالية لإصدار الشهادة"
                                    : "تحميل الشهادة المعتمدة"
                                }
                                style={{
                                  padding: "6px 14px",
                                  fontSize: 12,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  borderColor: attendee.checked_in ? "var(--iu-green-secondary)" : "#e2e8f0",
                                  color: attendee.checked_in ? "var(--iu-green-secondary)" : "#94a3b8",
                                }}
                              >
                                <IconFileCertificate size={16} />
                                {t("cert_btn", "شهادة الحضور")}
                              </button>

                              {/* Print / QR Ticket */}
                              {reg.event && (
                                <a
                                  href={`/order/${reg.event.id}/${reg.short_id}/print`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn outline iu-interactive-pill"
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: 12,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    textDecoration: "none",
                                  }}
                                >
                                  <IconQrcode size={16} />
                                  {t("view_ticket_qr", "عرض التذكرة / QR")}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Order Actions */}
                      {!isCancelled && (
                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 12,
                            borderTop: "1px dashed #e2e8f0",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleCancelRegistration(reg.short_id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              fontSize: 12,
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            {t("cancel_booking_btn", "إلغاء هذا الحجز والتذاكر")}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Certificate Modal */}
        <IUCertificateModal
          opened={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          certificate={selectedCert}
        />
      </div>
    </div>
  );
};

export default MyRegistrationsPage;

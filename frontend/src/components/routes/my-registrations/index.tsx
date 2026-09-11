import React, {useEffect, useState} from "react";
import {Link} from "react-router";
import {
  attendeeClient,
  AttendeeRegistrationData,
  AttendeeUser,
  CertificateData,
} from "../../../api/attendee.client";
import {IUCertificateModal} from "../../iu/IUCertificateModal";
import {
  IconCalendar,
  IconCheck,
  IconFileCertificate,
  IconMapPin,
  IconQrcode,
  IconUser,
} from "@tabler/icons-react";
import "../../../styles/iu/common.css";

export const MyRegistrationsPage: React.FC = () => {
  const [user, setUser] = useState<AttendeeUser | null>(null);
  const [registrations, setRegistrations] = useState<AttendeeRegistrationData[]>([]);
  const [lookupEmail, setLookupEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "past">("all");

  useEffect(() => {
    const storedUser = attendeeClient.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    loadRegistrations(storedUser?.email);
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

  const handleEmailLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupEmail.trim()) {
      loadRegistrations(lookupEmail.trim());
    }
  };

  const handleCancelRegistration = async (orderShortId: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في إلغاء هذا التسجيل والتذكرة؟")) {
      return;
    }

    try {
      await attendeeClient.cancelRegistration(orderShortId);
      alert("تم إلغاء التسجيل بنجاح.");
      loadRegistrations(user?.email || lookupEmail);
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

  const handleLogout = () => {
    attendeeClient.logout();
    setUser(null);
    setRegistrations([]);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === "all") return true;
    const isCancelled = reg.status === "CANCELLED";
    if (activeTab === "active") return !isCancelled;
    if (activeTab === "past") return isCancelled;
    return true;
  });

  return (
    <div className="container" style={{paddingBlock: "48px", minHeight: "75vh"}} dir="rtl">
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <div>
          <h1 style={{margin: "0 0 6px", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, color: "#111827"}}>
            تذاكري وحجوزاتي
          </h1>
          <p style={{margin: 0, color: "#6b7280", fontSize: 15}}>
            استعرض فعالياتك المسجلة، رموز الدخول (QR)، والشهادات المعتمدة فور صدورها.
          </p>
        </div>

        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              padding: "8px 16px",
              borderRadius: 16,
            }}
          >
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#084b2f",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <IconUser size={18} />
              </div>
              <div>
                <div style={{fontSize: 14, fontWeight: 700, color: "#065f46"}}>
                  {user.first_name} {user.last_name}
                </div>
                <div style={{fontSize: 12, color: "#047857"}}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn outline"
              style={{padding: "4px 10px", fontSize: 12, marginRight: 8}}
            >
              تسجيل خروج
            </button>
          </div>
        ) : (
          <div style={{display: "flex", gap: 10}}>
            <Link to="/login" className="btn solid" style={{padding: "8px 18px", fontSize: 13, textDecoration: "none"}}>
              تسجيل دخول الطالب
            </Link>
            <Link to="/register" className="btn outline" style={{padding: "8px 16px", fontSize: 13, textDecoration: "none"}}>
              حساب جديد
            </Link>
          </div>
        )}
      </div>

      {/* Guest Email Lookup Bar if not logged in */}
      {!user && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
            boxShadow: "0 8px 24px rgba(8, 75, 47, 0.05)",
          }}
        >
          <div style={{fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6}}>
            البحث عن التذاكر عبر البريد الإلكتروني
          </div>
          <p style={{fontSize: 13, color: "#6b7280", margin: "0 0 16px"}}>
            إذا قمت بالتسجيل في فعالية كزائر دون تسجيل دخول، ادخل بريدك الإلكتروني المستخدم لاسترجاع تذاكرك وشهاداتك.
          </p>
          <form onSubmit={handleEmailLookup} style={{display: "flex", gap: 12, maxWidth: 520}}>
            <input
              type="email"
              placeholder="name@example.com"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 14,
                outline: "none",
              }}
              required
            />
            <button type="submit" className="btn solid" style={{padding: "10px 20px", fontSize: 14}}>
              بحث
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{display: "flex", gap: 10, marginBottom: 24}}>
        <button
          onClick={() => setActiveTab("all")}
          className={`btn ${activeTab === "all" ? "solid" : "outline"}`}
          style={{padding: "6px 18px", fontSize: 13, borderRadius: 999}}
        >
          الكل ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`btn ${activeTab === "active" ? "solid" : "outline"}`}
          style={{padding: "6px 18px", fontSize: 13, borderRadius: 999}}
        >
          الحجوزات النشطة
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`btn ${activeTab === "past" ? "solid" : "outline"}`}
          style={{padding: "6px 18px", fontSize: 13, borderRadius: 999}}
        >
          الملغية
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{textAlign: "center", padding: "60px 0", color: "#6b7280"}}>
          جاري تحميل الحجوزات والتذاكر...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRegistrations.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px dashed #d1d5db",
            borderRadius: 24,
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div style={{fontSize: 48, marginBottom: 12}}>🎟️</div>
          <h3 style={{margin: "0 0 8px", fontSize: 20, color: "#111827", fontWeight: 700}}>
            لا توجد حجوزات مسجلة حالياً
          </h3>
          <p style={{margin: "0 0 24px", color: "#6b7280", fontSize: 14}}>
            استكشف الفعاليات المتاحة في الجامعة الإسلامية وسجل حضورك الآن.
          </p>
          <Link to="/events" className="btn solid" style={{padding: "10px 24px", textDecoration: "none"}}>
            تصفح دليل الفعاليات
          </Link>
        </div>
      )}

      {/* Registrations List */}
      {!loading && filteredRegistrations.length > 0 && (
        <div style={{display: "grid", gap: 20}}>
          {filteredRegistrations.map((reg) => {
            const isCancelled = reg.status === "CANCELLED";
            const eventDate = reg.event?.start_date
              ? new Date(reg.event.start_date).toLocaleDateString("ar-SA", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "قريباً";

            return (
              <div
                key={reg.order_id}
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
                      {isCancelled ? "حجز ملغى" : "حجز مؤكد ✓"}
                    </span>
                    <h3 style={{margin: 0, fontSize: 20, fontWeight: 800, color: "#111827"}}>
                      {reg.event?.title || "فعالية في الجامعة الإسلامية"}
                    </h3>
                  </div>

                  <div style={{fontSize: 13, color: "#6b7280", textAlign: "left"}}>
                    رقم الطلب: <span style={{fontFamily: "monospace", fontWeight: 700}}>#{reg.short_id}</span>
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
                    <IconCalendar size={16} color="#084b2f" />
                    {eventDate}
                  </span>
                  <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
                    <IconMapPin size={16} color="#084b2f" />
                    {reg.event?.location || "الجامعة الإسلامية بالمدينة المنورة"}
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
                          {attendee.product_title} — رمز التذكرة: {attendee.short_id}
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
                            <IconCheck size={13} /> تم تسجيل الحضور في القاعة
                          </span>
                        ) : (
                          <span style={{fontSize: 11, color: "#94a3b8", display: "inline-block", marginTop: 4}}>
                            بانتظار تسجيل الحضور عند الوصول
                          </span>
                        )}
                      </div>

                      {/* Action buttons per attendee */}
                      <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                        {/* Certificate Button */}
                        <button
                          onClick={() => handleFetchCertificate(attendee.public_id)}
                          className="btn outline"
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
                            borderColor: attendee.checked_in ? "#084b2f" : "#e2e8f0",
                            color: attendee.checked_in ? "#084b2f" : "#94a3b8",
                          }}
                        >
                          <IconFileCertificate size={16} />
                          شهادة الحضور
                        </button>

                        {/* Print / QR Ticket */}
                        {reg.event && (
                          <a
                            href={`/order/${reg.event.id}/${reg.short_id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn outline"
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
                            عرض التذكرة / QR
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
                      إلغاء هذا الحجز والتذاكر
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      <IUCertificateModal
        opened={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default MyRegistrationsPage;

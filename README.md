# منصة الفعاليات — الجامعة الإسلامية بالمدينة المنورة
## Islamic University of Madinah — Events Management Platform

> A university-grade Arabic-first event management platform built as a graduation project, powered by the [Hi.Events](https://hi.events) open-source engine.

---

## About

This platform is the official Events Management System for the **Islamic University of Madinah (IU)**. It provides a unified experience for:

- **Visitors** — Browse and discover upcoming university events
- **Students / Attendees** — Register for events, manage bookings, view tickets (QR codes) and certificates
- **Organizers / Admins** — Create and manage events, track attendance, generate reports and exports

The interface is fully **Arabic-first (RTL)**, built with the IU visual identity (green palette, Tajawal typography), and follows the university's design standards.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend Engine | [Hi.Events](https://github.com/HiEventsDev/Hi.Events) — Laravel 13 / PHP ≥8.3 |
| Database | PostgreSQL |
| Frontend | React 19 + TypeScript + Vite (SSR-capable) |
| Styling | Mantine UI + Custom IU Design Tokens (CSS Variables) |
| Auth | JWT — dual-model (Organizer + Attendee) |
| i18n | LinguiJS — Arabic (primary), English |

---

## Key Features

- 🌐 **Arabic-first RTL** layout with professional government/university composition
- 🎫 **Attendee authentication** — separate from organizer accounts
- 📋 **My Registrations** — view booked events, QR tickets, and certificates
- 🔍 **Public event catalog** — searchable, filterable platform-wide events
- 📊 **Organizer dashboard** — full event management, check-in, reports, exports
- 🟢 **IU Design System** — centralized green palette + Tajawal typography

---

## Hi.Events Attribution

This project is built on top of **Hi.Events**, which is licensed under **AGPL-3.0 with additional terms**.  
See [LICENCE](LICENCE) for the full license text.

> Original project: [https://github.com/HiEventsDev/Hi.Events](https://github.com/HiEventsDev/Hi.Events)  
> Hi.Events is © Hi.Events Ltd. All rights reserved.

---

## التشغيل السريع بنقرة واحدة (Windows One-Click Quick Start) ⚡

لتشغيل المشروع فوراً بعد تحميله (Clone) بدون أي إعداد يدوي معقد:
1. انقر نقراً مزدوجاً على ملف **`Start All.cmd`** (أو شغّل `start_all.cmd` من الطرفية).
2. سيقوم السكربت تلقائياً بـ:
   - فحص بيئة العمل وتثبيت أو إرشاد تثبيت أي متطلبات ناقصة (Node.js, PHP, Composer, PostgreSQL).
   - تفعيل إضافات PHP المطلوبة تلقائياً.
   - إنشاء ملفات البيئة `.env` للباك إند والفرونت إند وضبط الإعدادات تلقائياً.
   - تثبيت حزم npm وحزم Composer.
   - توليد المفاتيح (`APP_KEY` و `JWT_SECRET`).
   - فحص قاعدة البيانات وإنشائها تلقائياً إذا لم تكن موجودة ثم تشغيل المايجريشنز (`php artisan migrate`).
   - إنشاء رابط التخزين (`storage:link`).
   - تشغيل خادم الباك إند (Laravel) على `http://127.0.0.1:8000`.
   - تشغيل واجهة الفرونت إند (React) على `http://localhost:5678`.
   - فتح المتصفح تلقائياً على واجهة المنصة!

---

## Local Development (Manual Setup)

### Prerequisites
- PHP ≥ 8.3
- PostgreSQL
- Node.js ≥ 18 / npm or yarn

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## License

This project inherits the **AGPL-3.0** license from Hi.Events.  
See [LICENCE](LICENCE) for details.

---

*Graduation Project — Islamic University of Madinah — Department of Computer Science*

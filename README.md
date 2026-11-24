# منصة إدارة وتنظيم الفعاليات — الجامعة الإسلامية بالمدينة المنورة
## IU Events Management Platform — Islamic University of Madinah

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11%2F12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

> **مشروع التخرج (GP2) — كلية الحاسب الآلي ونظم المعلومات — الجامعة الإسلامية بالمدينة المنورة**  
> **Graduation Project — College of Computer Science & Information Systems — Islamic University of Madinah**  
> نظام مؤسسي متكامل لإدارة وتنظيم الفعاليات والمؤتمرات والأنشطة الأكاديمية والطلابية بهوية رقمية جامعية أصيلة وتجربة استخدام ثنائية اللغة (العربية والإنجليزية).

---

## الفهرس (Table of Contents)
1. [نبذة عن المنصة (Project Overview)](#نبذة-عن-المنصة-project-overview)
2. [المميزات الرئيسية (Key Features)](#المميزات-الرئيسية-key-features)
3. [البنية التقنية والمعمارية (Architecture & Tech Stack)](#البنية-التقنية-والمعمارية-architecture--tech-stack)
4. [هيكل المشروع ومجلداته (Repository Structure)](#هيكل-المشروع-ومجلداته-repository-structure)
5. [المتطلبات الأساسية (Prerequisites)](#المتطلبات-الأساسية-prerequisites)
6. [التثبيت والإعداد السريع (Installation & Setup)](#التثبيت-والإعداد-السريع-installation--setup)
7. [طرق التشغيل (Running the Platform)](#طرق-التشغيل-running-the-platform)
   - [التشغيل التلقائي عبر Start All.cmd (ويندوز)](#1-التشغيل-التلقائي-عبر-start-allcmd-نظام-windows)
   - [التشغيل اليدوي (Manual Setup - Windows / Linux / macOS)](#2-التشغيل-اليدوي-خطوة-بخطوة-manual-setup)
8. [الروابط والمنافذ المحلية (Local URLs & Ports)](#الروابط-والمنافذ-المحلية-local-urls--ports)
9. [كتالوج الفعاليات المعتمدة للجنة (Curated Demo Catalog)](#كتالوج-الفعاليات-المعتمدة-للجنة-curated-demo-catalog)
10. [الفحص وضمان الجودة (Testing & Quality Assurance)](#الفحص-وضمان-الجودة-testing--quality-assurance)
11. [حل المشكلات الشائعة (Troubleshooting)](#حل-المشكلات-الشائعة-troubleshooting)
12. [الأمان وحماية البيانات (Security & Data Protection)](#الأمان-وحماية-البيانات-security--data-protection)
13. [فريق العمل والإشراف الأكاديمي (Project Team & Supervision)](#فريق-العمل-والإشراف-الأكاديمي-project-team--supervision)
14. [الرخصة والإسناد البرمجي (Licence & Attribution)](#الرخصة-والإسناد-البرمجي-licence--attribution)

---

## نبذة عن المنصة (Project Overview)

تمثل **منصة إدارة وتنظيم الفعاليات بالجامعة الإسلامية** حلاً رقمياً مركزياً متطوراً يهدف إلى رقمنة وأتمتة كافة مراحل تنظيم الفعاليات الأكاديمية، وورش العمل، والندوات، والمؤتمرات، والمعارض الطلابية داخل حرم الجامعة الإسلامية بالمدينة المنورة.

صُممت المنصة لتلبي احتياجات ثلاثة أطراف رئيسية:
- **الزوار والعموم (Public Visitors):** استكشاف دليل الفعاليات، والبحث المتقدم بالكلمات المفتاحية، وتصفية الفعاليات حسب التصنيف، والتاريخ، ونوع الحضور (حضوري / افتراضي).
- **الحضور والطلاب (Attendees):** تسجيل الحضور السريع، إصدار تذاكر إلكترونية ذكية مشفرة برمز QR، إدارة الحجوزات وإلغاؤها ذاتياً، استعراض الملف الشخصي وسجل المشاركات، وتحميل شهادات الحضور الرقمية.
- **اللجان المنظمة والمسؤولون (Organizers):** لوحة تحكم متقدمة لإدارة الفعاليات وجدولتها، تخصيص التذاكر والطاقات الاستيعابية، تتبع التسجيل والتحضير المباشر عبر مسح رمز QR، وإرسال إشعارات البريد الإلكتروني للمسجلين، واستخراج تقارير إحصائية دقيقة.

---

## المميزات الرئيسية (Key Features)

- 🎨 **هوية بصرية أكاديمية أصيلة (Authentic IU Branding):** تصميم مخصص يعتمد اللون الأخضر الجامعي الزمردي (`#084b2f` / `#18734b`)، وخط Tajawal العربي، مع أيقونات Tabler SVG الرسمية أحادية اللون الخالية تماماً من الرموز التعبيرية غير الرسمية.
- 🌐 **دعم كامل للغتين (Arabic & English Localization):** دعم ثنائي متكامل ومباشر بين العربية والإنجليزية مع محاذاة تلقائية لعناصر الواجهة (RTL / LTR) لكافة الحقول، البطاقات، والنوافذ المنبثقة عبر LinguiJS.
- 🔐 **معمارية مصادقة مزدوجة معزولة (Dual-Auth System):** فصل كامل بين حسابات الحضور وحسابات المنظمين لمنع تصعيد الصلاحيات وضمان حماية بيانات الحسابات الأكاديمية والإدارية.
- 🎫 **تذاكر إلكترونية ذكية وتحضير فوري (QR Ticketing & Check-in):** إصدار فوري لبطاقات الدخول برمز QR مشفر قابل للمسح والتحقق الفوري مع إمكانية إلغاء الحجز بسلاسة من لوحة الحضور.
- 🔔 **نظام تنبيهات طبقي ذكي (Layered Toast Notifications):** طبقة تنبيهات عامة عبر React Portal تعلو شريط التنقل (Navbar) وتظل مرئية بالكامل في كافة مواضع التمرير على مختلف الشاشات.
- 📊 **كتالوج تجريبي متكامل معتمد (8 Curated Demo Events):** جاهزية تامة للعرض أمام لجنة المناقشة بثمان فعاليات أكاديمية وتقنية متنوعة بأغلفتها وتفاصيلها الكاملة.

---

## البنية التقنية والمعمارية (Architecture & Tech Stack)

| الطبقة (Layer) | التقنية (Technology) | الدور والتفاصيل |
|---|---|---|
| **الواجهة الأمامية (Frontend)** | React 19 + TypeScript + Vite | معمارية SSR هجينة، أداء فائق وتصيير متجاوب |
| **مكونات الواجهة (UI Framework)** | Mantine UI + SCSS Modules | تصميم مرن ونظيف يدعم الوضعين الفاتح والداكن والهوية الأكاديمية |
| **الترجمة والتدويل (i18n)** | LinguiJS v4/v5 | قواميس رسائل مجمعة ومحسنة مع دعم RTL كامل |
| **الواجهة الخلفية (Backend API)** | PHP 8.3+ / Laravel 11/12 | تصميم النطاق الموجه (Domain-Driven Design) مع واجهات RESTful |
| **قاعدة البيانات (Database)** | PostgreSQL 16+ | علاقات متكاملة، استعلامات مُحسّنة، ودعم UTF-8 الشامل |
| **المصادقة والأمان (Security)** | JWT (JSON Web Tokens) | جلسات مشفرة ومحمية من هجمات XSS و CSRF |
| **خادم البريد المحلي (Mail)** | Mailpit | التقاط رسائل التذاكر والتحقق محلياً عبر منفذ SMTP |

---

## هيكل المشروع ومجلداته (Repository Structure)

```text
iu-events-management/
├── backend/                       # الواجهة الخلفية (Laravel / PHP)
│   ├── app/                       # طبقات التطبيق والنطاق والمجال (DDD)
│   │   ├── Console/Commands/      # أوامر Artisan (بذر الفعاليات وتجهيز المنظمين)
│   │   ├── DomainObjects/         # كائنات النطاق المجردة والمولدة
│   │   ├── Http/Actions/          # إجراءات الـ API المستقلة لكل مسار
│   │   ├── Models/                # نماذج Eloquent للبيانات
│   │   ├── Repository/            # واجهات وتطبيقات مستودع البيانات
│   │   └── Services/              # منطق الأعمال والخدمات التطبيقية
│   ├── config/                    # ملفات إعدادات Laravel
│   ├── database/                  # الهجرات (Migrations) والبذور (Seeders)
│   ├── resources/demo/            # بيانات وأغلفة الفعاليات الثمانية المعتمدة
│   ├── routes/                    # مسارات الواجهة البرمجية (api.php)
│   └── tests/                     # الاختبارات الآلية (Unit & Feature Tests)
├── frontend/                      # الواجهة الأمامية (React / TypeScript / Vite)
│   ├── src/                       # الكود المصدري للواجهة
│   │   ├── api/                   # عملاء استدعاء API المعتمدة على Axios
│   │   ├── components/            # مكونات الواجهة المشتركة والمسارات
│   │   ├── context/               # سياقات الحالة العامة واللغات والمصادقة
│   │   ├── hooks/                 # الخطافات المخصصة (Custom Hooks)
│   │   ├── locales/               # ملفات وقواميس الترجمة (ar / en)
│   │   └── theme/                 # ثيم وألوان وهوية الجامعة الإسلامية
│   ├── server.js                  # خادم التصيير السريع للواجهة
│   └── package.json               # حزم واعتماديات الواجهة
├── scripts/                       # سكربتات التشغيل والتحقق الآلي المستقلة
│   ├── start-windows.ps1          # سكربت التشغيل المتقدم لويندوز
│   └── verify-gp2-demo-catalog.mjs # فحص كتالوج الفعاليات آلياً
├── Start All.cmd                  # ملف التشغيل السريع بنقرة واحدة لويندوز
├── LICENCE                        # رخصة AGPL-3.0 وبيان الحقوق
└── README.md                      # التوثيق الشامل للمشروع
```

---

## المتطلبات الأساسية (Prerequisites)

قبل البدء في تثبيت المنصة على بيئة العمل المحلية، تأكد من توفر البرمجيات التالية:

1. **PHP:** الإصدار `8.3` أو `8.4` مع تفعيل الإضافات التالية في ملف `php.ini`:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   extension=mbstring
   extension=openssl
   extension=curl
   extension=gd
   extension=intl
   extension=fileinfo
   extension=zip
   ```
2. **Composer:** الإصدار `2.7` أو أحدث لإدارة مكتبات PHP.
3. **Node.js:** الإصدار `18.x` أو `20.x` أو أحدث مع مدير الحزم `npm`.
4. **PostgreSQL:** الإصدار `16` أو أحدث قيد التشغيل محلياً.
5. **(اختياري) Mailpit:** لالتقاط رسائل البريد الإلكتروني محلياً عبر منفذ SMTP `1025` أو `1125`.

---

## التثبيت والإعداد السريع (Installation & Setup)

### 1. استنساخ المستودع (Clone Repository)

يمكن استنساخ المشروع في أي مجلد عمل محلي ترغب به، مثل `iu-events-management`:

```bash
git clone <repository-url> iu-events-management
cd iu-events-management
```

### 2. إعداد الواجهة الخلفية (Backend Setup)

```bash
cd backend

# إنشاء ملف البيئة من النموذج الآمن
copy .env.example .env     # على Windows
# cp .env.example .env     # على Linux / macOS

# تثبيت الحزم وتوليد المفاتيح
composer install
php artisan key:generate
php artisan jwt:secret

# إنشاء الجداول وتوليد الرابط التخزيني للأغلفة والملفات
php artisan migrate
php artisan storage:link
```

> **ملاحظة حول قاعدة البيانات:**  
> افتح ملف `backend/.env` وتأكد من مطابقة إعدادات الاتصال بقاعدة بيانات PostgreSQL المحلية لديك:
> ```env
> DB_CONNECTION=pgsql
> DB_HOST=127.0.0.1
> DB_PORT=5432
> DB_DATABASE=iu_events
> DB_USERNAME=postgres
> DB_PASSWORD=your_password
> ```

### 3. إعداد الواجهة الأمامية (Frontend Setup)

```bash
cd ../frontend

# إنشاء ملف البيئة
copy .env.example .env     # على Windows
# cp .env.example .env     # على Linux / macOS

# تثبيت الاعتماديات وتجميع قواميس الترجمة
npm install
npm run messages:compile
```

---

## طرق التشغيل (Running the Platform)

### 1. التشغيل التلقائي عبر Start All.cmd (نظام Windows) ⚡

تم تضمين مشغل تلقائي متقدم يفحص البيئة ويشغل كافة الخدمات بنقرة واحدة:

1. انقر نقراً مزدوجاً على الملف: **`Start All.cmd`**
2. يقوم السكربت تلقائياً بالآتي:
   - فحص وجود PHP و Node.js في متغيرات النظام (`PATH`).
   - التحقق من جاهزية خادم PostgreSQL واستجابته.
   - تشغيل خادم البريد Mailpit محلياً (في حال توفره).
   - تشغيل خادم الواجهة الخلفية (Laravel) على المنفذ `8010`.
   - تشغيل خادم الواجهة الأمامية (React SSR) على المنفذ `5680`.
   - فتح المتصفح تلقائياً على واجهة المنصة!

---

### 2. التشغيل اليدوي خطوة بخطوة (Manual Setup)

للتشغيل اليدوي عبر نافذتي موجه أوامر منفصلتين:

#### الطرفية الأولى — تشغيل الواجهة الخلفية (Backend):
```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8010
```

#### الطرفية الثانية — تشغيل الواجهة الأمامية (Frontend):
```bash
cd frontend
# وضع التطوير
npm run dev:ssr
# أو وضع الإنتاج عالي الأداء
npm run build && node --import ./instrument.mjs server.js --port 5680
```

---

## الروابط والمنافذ المحلية (Local URLs & Ports)

بمجرد تشغيل المنصة، يمكنك الوصول للخدمات عبر الروابط التالية:

| الخدمة | الرابط المحلي (Local URL) | الوصف |
|---|---|---|
| 🌐 **منصة الفعاليات (Frontend)** | `http://127.0.0.1:5680` | الواجهة العامة ودليل الفعاليات وبوابة الحضور |
| ⚙️ **الواجهة البرمجية (API)** | `http://127.0.0.1:8010` | خادم Laravel ونقاط نهاية REST API |
| 🔐 **لوحة المنظمين (Organizer Portal)** | `http://127.0.0.1:5680/auth/login` | تسجيل دخول مسؤولي ومنظمي الفعاليات |
| 📬 **واجهة فحص البريد (Mailpit UI)** | `http://127.0.0.1:8225` | استعراض رسائل البريد والتذاكر الصادرة محلياً |

---

## كتالوج الفعاليات المعتمدة للجنة (Curated Demo Catalog)

تتضمن المنصة كتالوجاً معتمداً يضم **8 فعاليات جامعية مميزة** مصممة خصيصاً للمناقشة وتغطي اهتمامات أكاديمية وتقنية متنوعة داخل الحرم الجامعي:

1. **تطبيقات الذكاء الاصطناعي في البحث العلمي** (Artificial Intelligence Applications)
2. **ورشة التوعية بالأمن السيبراني وحماية البيانات** (Cybersecurity Awareness Workshop)
3. **ملتقى الابتكار الجامعي ونقل التقنية** (University Innovation Forum)
4. **ورشة الحوسبة السحابية وبنية الأنظمة الموزعة** (Cloud Computing Workshop)
5. **ورشة التأهيل لسوق العمل وبناء المسار المهني** (Career Preparation Workshop)
6. **مبادرة التطوع الطلابي وخدمة المجتمع** (Student Volunteering Initiative)
7. **ندوة الأدلة الرقمية والتحقيق الجنائي الرقمي** (Digital Forensics Seminar)
8. **ملتقى ريادة الأعمال وحاضنات التقنية** (Entrepreneurship Forum)

### أمر بذر وتحديث الفعاليات التجريبية:
```bash
cd backend
php artisan gp2:seed-committee --apply
```
> يضمن هذا الأمر تهيئة الفعاليات الثمانية بأغلفتها المتجهية عالية الدقة وأوصافها الأكاديمية والتواريخ المحدثة تلقائياً.

---

## الفحص وضمان الجودة (Testing & Quality Assurance)

للتحقق من سلامة الأداء وخلو الشيفرة البرمجية من الأخطاء:

### 1. فحص كتالوج الفعاليات واستجابة الـ API آلياً:
```bash
node scripts/verify-gp2-demo-catalog.mjs
```
*يتحقق السكربت من استجابة الخادم، وجود الفعاليات الثمانية، وتحميل الصور المتجهية بنجاح.*

### 2. فحص بناء الواجهة الأمامية للإنتاج:
```bash
cd frontend
npm run build
```

### 3. تشغيل اختبارات الواجهة الخلفية (PHPUnit):
```bash
cd backend
php artisan test --testsuite=Unit
```

---

## حل المشكلات الشائعة (Troubleshooting)

- **المنافذ قيد الاستخدام (Port Conflict):**  
  إذا كان المنفذ `8010` أو `5680` مشغولاً بتطبيق آخر، تحقق من العمليات الجارية باستخدام `netstat -ano | findstr :8010` وأنهِ العملية، أو حدد منافذ بديلة في ملفات `.env`.
- **خطأ امتدادات PHP (Missing Extensions):**  
  تأكد من فتح ملف `php.ini` وإزالة علامة التعليق (`;`) من أمام الإضافات المطلوبة مثل `pdo_pgsql` و `gd` و `intl`، ثم أعد تشغيل موجه الأوامر.
- **مشكلة الاتصال بقاعدة البيانات (Database Connection Failed):**  
  تأكد من تشغيل خدمة PostgreSQL وصحة اسم المستخدم وكلمة المرور في `backend/.env`.
- **صور الأغلفة لا تظهر (Missing Images):**  
  تأكد من تنفيذ أمر الربط التخزيني `php artisan storage:link` داخل مجلد `backend`.

---

## الأمان وحماية البيانات (Security & Data Protection)

- **عزل الصلاحيات:** فصل بنيوي كامل بين جلسات الحضور والمشرفين لمنع أي وصول غير مصرح به.
- **الحماية من الهجمات الشائعة:** حماية متكاملة ضد هجمات حقن SQL (عبر PDO Prepared Statements)، وهجمات CSRF و XSS.
- **تشفير كلمات المرور:** استخدام خوارزمية Bcrypt لتشفير كلمات المرور مع إمكانية استعادة كلمة المرور عبر رموز مؤقتة مشفرة.
- **حماية التذاكر:** توليد رموز دخول فريدة مع توقيع رقمي للتحقق من مصداقية كل تذكرة إلكترونية.

---

## فريق العمل والإشراف الأكاديمي (Project Team & Supervision)

تم إنجاز هذا المشروع كمتطلب لنيل درجة البكالوريوس في علوم الحاسب الآلي:

- **المشروع:** منصة إدارة وتنظيم الفعاليات (IU Events Management Platform)
- **المؤسسة:** الجامعة الإسلامية بالمدينة المنورة (Islamic University of Madinah)
- **الكلية:** كلية الحاسب الآلي ونظم المعلومات (College of Computer Science & Information Systems)
- **القسم:** قسم علوم الحاسب والذكاء الاصطناعي (Department of Computer Science & AI)
- **الفريق:** المجموعة الخامسة (Group 5)
- **مطور المشروع:** أنس الرحيلي (Anas Alrehaily)
- **العام الجامعي:** 1446 هـ / 2024–2025 م

---

## الرخصة والإسناد البرمجي (Licence & Attribution)

- هذا النظام مرخص بموجب **رخصة جنو أفيرو العمومية الإصدار 3 (GNU Affero General Public License v3.0 - AGPL-3.0)**.
- تم بناء النظام وتطويره بالاستناد إلى محرك [Hi.Events](https://hi.events) مفتوح المصدر بموجب أحكام رخصة AGPL-3.0، مع إعادة تصميم شاملة للواجهات وهوية الجامعة الإسلامية، ونظام ترجمة متكامل، وتطوير خصائص إضافية مخصصة.
- للمزيد من التفاصيل والشروط القانونية الكاملة، يُرجى مراجعة ملف [LICENCE](LICENCE).

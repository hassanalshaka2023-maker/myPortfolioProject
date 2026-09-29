# دليل نشر الموقع على Vercel

هذا الدليل يأخذك من المشروع على جهازك إلى موقع منشور على الإنترنت، خطوة بخطوة.
المدة المتوقعة: 20–30 دقيقة.

---

## قبل البدء — ما تحتاجه

- حساب على [GitHub](https://github.com)
- حساب على [Vercel](https://vercel.com) (سجّل الدخول بحساب GitHub نفسه — أسهل)
- ملف `.env` الموجود على جهازك (فيه كل القيم التي ستحتاجها)
- اختياري: دومين خاص (مثل `hassan.dev`)، وحساب على [Resend](https://resend.com) لإشعارات البريد

> قاعدة البيانات جاهزة مسبقاً على Supabase — الجداول والمحتوى وحساب الأدمن وbucket الصور كلها موجودة. لن تحتاج لتكرار ذلك.

---

## الخطوة 1 — رفع الكود على GitHub

1. على GitHub اضغط **New repository**.
2. الاسم: `hassan-portfolio`. اختر **Private** (مستحسن) أو Public.
3. **لا** تضف README أو .gitignore (موجودة مسبقاً). اضغط **Create repository**.
4. في تيرمنال VS Code داخل مجلد المشروع:

   ```bash
   git checkout master
   git merge rebuild
   git branch -M main
   git remote add origin https://github.com/<اسم-المستخدم>/hassan-portfolio.git
   git push -u origin main
   ```

> ملف `.env` **لن يُرفع** — هو مستثنى في `.gitignore`، وهذا مقصود لحماية مفاتيحك.

---

## الخطوة 2 — إنشاء المشروع على Vercel

1. من لوحة Vercel اضغط **Add New… ← Project**.
2. اختر مستودع `hassan-portfolio` واضغط **Import**.
3. **Framework Preset**: سيتعرّف تلقائياً على Next.js. لا تغيّر أوامر البناء.
4. **لا تضغط Deploy بعد** — أولاً أضف المتغيرات (الخطوة 3).

---

## الخطوة 3 — متغيرات البيئة

في نفس الصفحة افتح قسم **Environment Variables**. انسخ القيم من ملف `.env` على جهازك:

| المتغير | القيمة |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | رابط موقعك النهائي. إن لم يكن لديك دومين بعد: `https://hassan-portfolio.vercel.app` (ستعدّله لاحقاً) |
| `DATABASE_URL` | نفس القيمة في `.env` |
| `DIRECT_URL` | نفس القيمة في `.env` |
| `NEXT_PUBLIC_SUPABASE_URL` | نفس القيمة في `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | نفس القيمة في `.env` |
| `SUPABASE_STORAGE_BUCKET` | `portfolio` |
| `AUTH_SECRET` | نفس القيمة في `.env` |
| `RESEND_API_KEY` | اختياري — انظر الخطوة 6 |
| `CONTACT_TO_EMAIL` | اختياري — بريدك |
| `CONTACT_FROM_EMAIL` | اختياري — `Portfolio <onboarding@resend.dev>` |

> **لا تضف** `ADMIN_EMAIL` و`ADMIN_PASSWORD` — هذه تُستخدم فقط عند تشغيل الـ seed من جهازك.

**طريقة سريعة:** Vercel يسمح بلصق محتوى ملف `.env` كاملاً دفعة واحدة في أول خانة — سيقسّمه تلقائياً. بعدها احذف `ADMIN_EMAIL` و`ADMIN_PASSWORD` وعدّل `NEXT_PUBLIC_SITE_URL`.

---

## الخطوة 4 — النشر

1. اضغط **Deploy**.
2. سيقوم Vercel بـ: تثبيت الحزم ← تطبيق تغييرات قاعدة البيانات ← بناء الموقع. يستغرق 2–4 دقائق.
3. عند النجاح ستحصل على رابط مثل `https://hassan-portfolio.vercel.app` 🎉

**إن فشل البناء:** افتح **Deployments ← (آخر نشر) ← Build Logs** وأرسل لي آخر 30 سطراً.

---

## الخطوة 5 — الدومين الخاص (اختياري)

1. في Vercel: **Project ← Settings ← Domains ← Add**، واكتب دومينك.
2. Vercel سيعطيك سجلات DNS (عادةً `A` أو `CNAME`). أضفها في لوحة الشركة التي اشتريت منها الدومين.
3. انتظر التفعيل (من دقائق إلى ساعات). الـ HTTPS يُفعّل تلقائياً.
4. **مهم:** عدّل `NEXT_PUBLIC_SITE_URL` في **Settings ← Environment Variables** إلى الدومين الجديد، ثم **Deployments ← ⋯ ← Redeploy**.

---

## الخطوة 6 — إشعارات البريد عند وصول رسالة (اختياري)

الرسائل تُحفظ دائماً في الداشبورد، البريد فقط تنبيه إضافي.

1. أنشئ حساباً على [resend.com](https://resend.com) **بنفس بريدك** `hassanalshaka2023@gmail.com`.
2. **API Keys ← Create API Key** ← انسخ المفتاح إلى `RESEND_API_KEY` في Vercel.
3. ضع `CONTACT_TO_EMAIL` = `hassanalshaka2023@gmail.com`.
4. أبقِ `CONTACT_FROM_EMAIL` = `Portfolio <onboarding@resend.dev>`.
5. أعد النشر (Redeploy).

> بدون دومين مُوثّق، Resend يرسل فقط إلى البريد الذي سجّلت به — وهذا بالضبط ما نريده.
> إذا اشتريت دوميناً لاحقاً: وثّقه في Resend ثم غيّر `CONTACT_FROM_EMAIL` إلى مثل `Portfolio <hello@دومينك>`.

---

## الخطوة 7 — بعد النشر (قائمة تحقق)

- [ ] افتح `/login` وسجّل الدخول.
- [ ] **الإعدادات ← الأمان**: غيّر كلمة المرور.
- [ ] **الإعدادات**: أضف GitHub وLinkedIn، الصورة الشخصية، ملف الـ CV، سنوات الخبرة.
- [ ] **الإعدادات ← نبذة عنّي**: استبدل نص `[TODO]` بقصتك.
- [ ] **المشاريع**: لكل مشروع أضف صورة غلاف، روابط GitHub/الموقع، دورك، ووصفاً كاملاً بدل `[TODO]`.
- [ ] **الخبرات**: أضف جامعة دمشق (تعليم) وأي عمل سابق.
- [ ] أرسل رسالة تجريبية من نموذج التواصل وتأكد أنها وصلت للداشبورد (وللبريد إن فعّلته).
- [ ] شارك رابط الموقع في محادثة واتساب مع نفسك وتأكد من ظهور صورة المعاينة.
- [ ] [Google Search Console](https://search.google.com/search-console): أضف موقعك وأرسل `https://<دومينك>/sitemap.xml`.

---

## العمل اليومي بعد النشر

- **إضافة/تعديل مشروع:** من الداشبورد مباشرة — يظهر على الموقع فوراً، **بدون** إعادة نشر.
- **تعديل الكود:** عدّل على جهازك ← `git push` ← Vercel ينشر تلقائياً خلال دقائق.
- **تغيير في قاعدة البيانات (schema):** عدّل `prisma/schema.prisma` ← `npm run db:diff -- اسم_التغيير` ← `git push`. Vercel يطبّق التغيير تلقائياً عند النشر.

## حل المشاكل الشائعة

| المشكلة | الحل |
| --- | --- |
| البناء فشل عند `prisma migrate deploy` | تأكد من `DIRECT_URL` (البورت 5432) وأن كلمة السر صحيحة |
| الصور لا تظهر | تأكد من `NEXT_PUBLIC_SUPABASE_URL` ثم أعد النشر (يُقرأ وقت البناء) |
| لا أستطيع تسجيل الدخول | تأكد من `AUTH_SECRET`. نسيت كلمة السر؟ عدّل `ADMIN_PASSWORD` في `.env` على جهازك وشغّل `npm run db:seed` |
| الروابط في Google أو صور المشاركة تشير لرابط خاطئ | عدّل `NEXT_PUBLIC_SITE_URL` ثم Redeploy |
| الموقع بطيء عند أول طلب | طبيعي أحياناً (cold start). تأكد أن المنطقة `fra1` في `vercel.json` |

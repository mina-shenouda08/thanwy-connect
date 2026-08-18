# Thanwy Connect

Act as a Senior Full-Stack Engineer and Lead UX/UI Designer. Build a production-ready, mobile-first web app ("Thanwy Meetings") in React (TypeScript), Tailwind CSS, Lucide React icons, Recharts, and Supabase. Follow the screen specs below exactly.





1. DESIGN SYSTEM

Palette is a red/green pair pulled from the logo (not a single accent color):

Background (base canvas):        #121212
Card / surface:                  #1E1E1E
Surface (elevated / picker):     #2C2C2C
Border (subtle, on focus/active): #333333

Primary (Vibrant Red — logo):     #E61919   | on-primary: #FFFFFF
Primary soft (CTA pill buttons):  #FFB4AA   | on-primary-soft: #690003   ← salmon Login/Signup buttons
Secondary (Vibrant Green):        #1DB954 (accents) / #29C902 ("present"/success states)
Tertiary (ID-card blue):          #A1C9FF   | on-tertiary: #00325A       ← profile header card

Text primary:    #F5F5F5 (90% white)
Text secondary:  #A0A0A0





Typography: Be Vietnam Pro. lang="ar", dir="rtl", right-aligned text by default.



Shape: cards/inputs = 16px radius; bottom sheets/large headers = 24px radius; all buttons pill-shaped.



Elevation: tonal layering, no heavy shadows. Pressed state = scale 98% + brightness bump.



Top bars / bottom nav: backdrop-filter: blur(20px) over 60%-opacity surface color.



Spacing: 20px outer margin, 16px between cards, 24px between sections, 80px bottom-nav clearance.



Logo: circular white badge with the uploaded Thanwy Meetings logo (red cross + green swoosh) — used on Login (large, centered) and the Student QR ID card (small, corner).





2. SCREEN — LOGIN (/login)





Circular white logo badge, centered, ~140px.



Headline: "أهلاً بك في اجتماع ثانوي"



Subtext: "يرجى تسجيل الدخول للوصول إلى حسابك"



Dark card (#1E1E1E, 24px radius) with:





"البريد الإلكتروني" → email input, mail icon.



"كلمة المرور" → password input, lock icon + eye/eye-off toggle.



Right-aligned link: "نسيت كلمة المرور؟"



Full-width salmon pill button: "تسجيل الدخول" (with arrow icon).



Below card: "لسة معملتش حساب؟" → /signup.

On submit: authenticate via Supabase, read users.role, redirect student → /student, servant → /servant.





3. SCREEN — SIGN UP (/signup)





Top bar: centered "اجتماعات ثانوي", back-arrow (RTL, right edge) → /login.



Heading: "إنشاء حساب جديد" + subtext (soft glow effect per wireframe).



Card, in order:





"الاسم الرباعي" — full name, person icon.



"البريد الإلكتروني (اختياري)" — optional email, example@domain.com placeholder.



"المرحلة الدراسية / الفصل" — two dropdowns side by side:





Grade level: "اختر المرحلة" (أولى / ثانية / ثالثة ثانوي), graduation-cap icon.



Class: "اختر الفصل" — disabled until grade is chosen, then populated live from Supabase classes filtered by grade_level (pre-seeded + servant-added).



"كلمة المرور" and "تأكيد كلمة المرور" — masked, eye toggle.



Full-width salmon pill button: "إنشاء الحساب".



Below card: "لديك حساب بالفعل؟ سجل دخولك" → /login.

Creates Supabase auth user + users row, role = 'student'.





4. STUDENT SECTION — 4 SCREENS BEHIND THE BOTTOM NAV

Nav bar (bottom, 4 icons, persistent across all 4 screens):
Home · Bible (book icon) · Notebook (bookmark icon) · QR (qr icon)

Golden rule: Home is a read-only overview that links out. Nothing on Home is directly editable — every checkbox, log form, or submission button lives on its own dedicated screen (Bible / Notebook / QR), each of which shows history and lets the student add a new entry on that same screen.

4.1 Home (/student) — overview only, non-interactive previews





Profile/ID header — tertiary-blue card: barcode/QR generated from user.id (left), full_name / grade_level / class name (right, stacked).



"الفعاليات القادمة" — horizontally-scrollable upcoming-event cards (title, type badge, date, time, location). View-only feed; tapping a card opens a read-only detail sheet (not an edit action — students don't manage events).



Compact preview of recent spiritual-notebook activity (last few days, read-only) with a "عرض الكل" link → routes to the Notebook screen (4.3). No checkboxes live here.



Compact preview of recent Bible readings (read-only) with a "عرض الكل" link → routes to the Bible screen (4.2). No log form lives here.



4.2 Bible screen (/student/bible) — nav icon: book

This is where the student actually records what he read, not just views it:





Full history list of past logged readings: testament badge, book, chapter, date.



"+ سجل قراءة جديدة" button opens the logging form on this same screen (bottom sheet or inline expand):
Testament (عهد قديم/جديد) dropdown → dynamic Book dropdown (filtered by testament) → Chapter number → optional تأمل/notes field → Save. Writes to spiritual_journal.



"دراسة كتاب" (Book Study assignments) live on this same screen (folded in, not a separate nav item): list of servant-assigned weekly readings, each with due date and status badge — green "تم تسليم" or red "فاضل [n] يوم". Tapping an unsubmitted one opens a submission form right here. Writes to book_study_submissions.



4.3 Notebook screen (/student/notebook) — nav icon: bookmark

This is where the student logs whether he prayed, not just sees a record:





Weekly/calendar grid of past days — read-only, locked (shows what was logged).



Today's row is live and editable: tappable checkboxes for باكر, غروب, نوم, ارتجالي, تناول, اخر اعتراف. Tapping toggles the value and immediately writes/updates spiritual_journal.prayers (JSONB) for student_id + today's date.



4.4 QR / Attendance screen (/student/qr) — nav icon: QR

Personal code plus his own attendance record, on one screen:





Large, high-contrast, brightness-boosted QR/barcode (user.id) for scanning at check-in.



Below it: his own attendance history — list of events attended with dates, and a summary stat (overall attendance %, total sessions attended).





5. SERVANT SECTION — SAME 4-ICON NAV, GROUP-LEVEL DATA

Nav bar (bottom, identical 4 icons): Home · Bible · Notebook · QR

Same golden rule: Home only overviews and links out (plus event management, which is an admin action distinct from the three diary features, so it stays here). Bible/Notebook/QR each show the whole group with drill-in per student, and each is where the servant actually manages that feature — not Home.

5.1 Home (/servant) — overview + event management only





Profile header — same tertiary card component, servant's name/grade/class.



Event action row — three pill buttons:





"أضافة" (green) → Add Event modal: title, type (chip selector: Sunday School/Activity/Recreation/Liturgy/Tasbeha), time range, recurrence (Once / Weekly-pick day / Custom-multi-date). Writes to events.



"تعديل" (purple) → pick existing event → Edit Event modal, pre-filled.



"الغاء" (red) → pick existing event → confirm → soft-cancel (events.status = 'cancelled', never hard-delete, so attendance history stays intact).



"الفعاليات القادمة" — same horizontally-scrollable event-card feed as student view, tap-through into the edit modal above.



Nothing about attendance, prayers, or reading progress appears here — those live on their own screens below.



5.2 Bible screen (/servant/bible) — "see what the whole group read, across the weeks"





Class/grade filter (if servant manages more than one class).



Table: student × week, showing what each logged (book/chapter/testament) — scannable at a glance for who's behind.



"اضافة دراسة كتاب" (create/edit Book Study assignments) lives here: title, testament, book, chapter, due date, target grade/class. This populates the assignment list on every matching student's Bible screen (4.2).



Tap a student row → drill into their individual reading history (read-only for the servant).



5.3 Notebook screen (/servant/notebook) — "open the group, see who prayed"





List of students in the servant's class(es), with an at-a-glance completion indicator (e.g. % of this week's prayer checklist completed).



Tap a student → their individual prayer calendar (read-only history).



Private Follow-up Notes ("ملاحظات الافتقاد") live in this same student drill-in: editable text log with quick-chips ("محتاج افتقاد", "مريض", "عنده امتحانات") plus free text. Writes to followup_notes. Never visible to the student. This is the natural home for pastoral notes since it's opened from the same per-student spiritual view.



5.4 QR / Attendance screen (/servant/qr) — "scan, and see the whole group's attendance"





Scan button (camera icon) → launches in-browser QR/barcode scanner to check a student in against the currently active event. Manual fallback: search-and-tap a student's name if the camera can't be used. Writes to attendance.



Group attendance list: each student's name, attendance percentage (progress bar, green fill), and count of sessions attended out of total held.



"إنذار افتقاد" red badge auto-applied to any student with 2+ consecutive absences.



Tap a student → full event-by-event attendance log for that individual.



Export button (PDF/XLSX) for the currently filtered class/date range — this is where "Export Reports" now lives, since it's attendance data.





6. SUPABASE SCHEMA

Keep the original six tables (users, classes, events, attendance, spiritual_journal, followup_notes) and add:

-- 7. book_study_assignments
id            uuid primary key
title         text
testament     text check (testament in ('old','new'))
book          text
chapter       int
due_date      date
grade_level   text
class_id      uuid references classes(id)   -- nullable
created_by    uuid references users(id)
created_at    timestamp

-- 8. book_study_submissions
id              uuid primary key
assignment_id   uuid references book_study_assignments(id)
student_id      uuid references users(id)
answer_text     text
submitted_at    timestamp

Add status ('scheduled' | 'cancelled') to events so "الغاء" soft-cancels instead of destroying attendance history.

RLS:





followup_notes — readable only by servants for their own class(es); never by the student.



book_study_submissions — student can read/write only their own rows; servant can read all rows for assignments they created or that target their class.



spiritual_journal — student can read/write only their own rows (today's entry only for writes); servant has read-only access for their class.





7. AUTH, ROUTING, PWA (unchanged)





Hidden servant signup: /servant-register-secret-89xq, gated by a passcode (Supabase Edge Function or env var), sets role = 'servant', servant selects their assigned grade level.



"إضافة فصل جديد" (Add New Class) — a modal reachable from a settings/overflow menu on the servant Home (not a persistent button, keep Home uncluttered): class name + grade → writes to classes → immediately available in Signup's class dropdown for that grade.



PWA manifest + service worker for "Add to Home Screen" (iOS/Android).



Offline attendance scans queue in IndexedDB, auto-sync to attendance on reconnect.





8. EXPLICIT INSTRUCTION TO PASTE AT THE END OF THE LOVABLE PROMPT



"Home screens (both student and servant) are overview-only — they preview and link out, they do not contain checkboxes, logging forms, or submission buttons. Every diary/tracking feature (Bible, Notebook, QR/Attendance) is its own full screen reachable from the bottom nav, and each of those screens must both display history AND let the user add/edit a new entry on that same screen — do not split 'view' and 'edit' across different screens, and do not render any of them as static/read-only lists."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/240b53e9-8135-4ff7-b917-3a1e0e1e028d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

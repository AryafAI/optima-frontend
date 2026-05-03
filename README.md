# Optima Frontend

Frontend dashboard for the **Optima** retail decision support system — a React + Vite app
with a chat-based interface for what-if pricing simulations and a live visualization of
baseline vs predicted sales. Connects to the FastAPI backend at `api.py` in the main
Optima repo.

---

## Features

- AI Chat Sidebar — natural-language interface, calls `POST /chat`
- 3 KPI Cards with sparklines (total sales / top product / growth)
- Scenario Simulation — three what-if modes in one dropdown (Price Increase, Discount Change, Extended Discount)
- Bar Chart — Baseline vs Predicted sales by month with gradient bars
- Summary Cards — Baseline total, Predicted total, % change with trend line
- **Auto-fallback to mock data** if the backend is offline (perfect for demos)
- Responsive — sidebar + dashboard on large screens, stacked on mobile

---

## How to Run Locally — خطوة بخطوة

### الخطوة 0 — حلّي مشكلة PowerShell (مرة وحدة فقط)

لو طلعت لك `running scripts is disabled on this system`:

افتحي **PowerShell** (مو لازم Admin) وكتبي:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

اضغطي `Y` ثم `Enter`. سكري PowerShell وافتحيها من جديد.

### الخطوة 1 — التحقق من Node.js

```powershell
node --version
npm --version
```

لو ما طلع رقم، نزلي Node.js LTS من https://nodejs.org

### الخطوة 2 — ادخلي مجلد المشروع

```powershell
cd $env:USERPROFILE\Desktop\optima-frontend
```

أو بالكامل:

```powershell
cd C:\Users\Aryaf\Desktop\optima-frontend
```

### الخطوة 3 — تثبيت المكتبات

```powershell
npm install
```

أول مرة تاخذ دقيقة أو دقيقتين.

### الخطوة 4 — تشغيل المشروع

```powershell
npm run dev
```

المتصفح يفتح تلقائيًا على **http://localhost:5173**

### الخطوة 5 (اختياري) — Build للنشر

```powershell
npm run build
npm run preview
```

---

## ربط الباك إند (FastAPI)

الكود معدّ مسبقًا للاتصال بالـ backend، ويستخدم mock data تلقائيًا لو الباك إند مو شغال.

### تفعيل الاتصال:

1. شغلي `api.py` من مشروع Optima:
   ```powershell
   cd C:\path\to\Optima
   uvicorn api:app --reload
   ```
   (يشتغل على http://localhost:8000)

2. في مجلد `optima-frontend`، انسخي `.env.example` لـ `.env`:
   ```powershell
   copy .env.example .env
   ```

3. تأكدي إن `.env` فيه:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. أعيدي تشغيل `npm run dev` (لازم بعد كل تعديل في `.env`).

### كيف يشتغل الـ fallback؟

- لو `VITE_API_URL` فاضي أو ملف `.env` غير موجود → mock data مباشرة.
- لو معبّأ بس الباك إند مو شغال → banner أصفر "Backend not reachable" + سقوط على mock data.
- لو الباك إند شغال → نتائج حقيقية من الـ XGBoost model.

---

## مشاركة المشروع مع الفريق

### الطريقة 1: GitHub في ريبو منفصل (الأنظف)

#### أنتي (مرة وحدة):

1. روحي https://github.com/new
2. سمي الريبو: `optima-frontend`
3. اضغطي Create (بدون README)
4. في PowerShell:

```powershell
cd $env:USERPROFILE\Desktop\optima-frontend
git init
git add .
git commit -m "Initial frontend dashboard"
git branch -M main
git remote add origin https://github.com/AryafAI/optima-frontend.git
git push -u origin main
```

أول push يطلب login. استخدمي **Personal Access Token** من
https://github.com/settings/tokens/new (scope: `repo`) بدل كلمة المرور.

#### كل عضو فريق (مرة وحدة):

```powershell
cd Desktop
git clone https://github.com/AryafAI/optima-frontend.git
cd optima-frontend
npm install
npm run dev
```

### الطريقة 2: داخل ريبو Optima الموجود

```powershell
cd C:\path\to\Optima         # ريبو Optima الموجود عندك
git clone https://github.com/AryafAI/Optima.git  # لو مو موجود
mkdir frontend
xcopy /E /I $env:USERPROFILE\Desktop\optima-frontend frontend\
git add frontend
git commit -m "Add frontend dashboard"
git push
```

أعضاء الفريق:
```powershell
git pull
cd frontend
npm install
npm run dev
```

### الطريقة 3: ZIP مباشرة (لو الفريق ما عندهم Git)

كبسي يمين على مجلد `optima-frontend` → **Send to → Compressed (zipped) folder** → ارسليه واتساب/إيميل/Drive.

العضو يفك الضغط، ثم:

```powershell
cd C:\path\to\optima-frontend
npm install
npm run dev
```

### مهم لكل أعضاء الفريق:

- يحتاجون **Node.js** مثبت (https://nodejs.org)
- لو على Windows، يطبقون **الخطوة 0** (PowerShell execution policy)
- ملف `.env` ما يتنزل من Git (موجود في `.gitignore`) — كل واحد يسوي نسخة من `.env.example` لو يبي يربط على الـ backend

---

## Project Structure

```
optima-frontend/
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx
    ├── App.jsx               ← scenario state + API calls
    ├── App.css
    ├── index.css             ← global styles + CSS variables
    ├── data/
    │   └── data.js           ← mock data (fallback)
    ├── api/
    │   └── client.js         ← FastAPI client
    └── components/
        ├── Logo.jsx + .css
        ├── SidebarChat.jsx + .css
        ├── ChatMessage.jsx + .css
        ├── KPICard.jsx + .css
        ├── ScenarioControls.jsx + .css
        ├── ScenarioChart.jsx + .css
        └── SummaryCards.jsx + .css
```

---

## Customization Tips

| تبين تغيري | روحي لـ |
|-----------|---------|
| الألوان | `src/index.css` — متغيرات `:root` |
| KPIs الفوقية | `src/data/data.js` — `KPIS` |
| المنتجات والأسعار | `src/data/data.js` — `PRODUCTS` |
| نتائج الـ mock | `src/data/data.js` — `MOCK_SCENARIO_RESULTS` |
| ردود الشات في offline | `src/data/data.js` — `generateMockBotReply` |
| الـ logo | `src/components/Logo.jsx` |

---

## Tech Stack

- React 18 + Vite 5
- recharts (charts)
- Plain CSS with CSS variables
- Inter font from Google Fonts

---

## Troubleshooting

| المشكلة | الحل |
|--------|------|
| `running scripts is disabled` | شغلي `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` ثم `Y` |
| `cd: cannot find path` | استخدمي `cd $env:USERPROFILE\Desktop\optima-frontend` |
| `npm: command not found` | نزلي Node.js من https://nodejs.org |
| `EADDRINUSE 5173` | البورت مشغول. سكري ترمنال آخر أو غيري `port` في `vite.config.js` |
| صفحة فاضية | F12 → Console |
| Banner أصفر دائم | تأكدي إن `uvicorn api:app --reload` شغال على port 8000 |
| تعديل `.env` ما اشتغل | لازم Ctrl+C ثم `npm run dev` من جديد |

---

Built for graduation project — **Aryaf**, May 2026.

# 📌 Smart Bookmark App

### Supabase × Next.js (App Router) × Google OAuth

A secure, real-time bookmark manager built with **Next.js (App Router)** and **Supabase**.

Users can sign in using **Google OAuth only**, add private bookmarks, delete them, and see real-time updates across tabs.

---

## 🚀 Live Demo

🔗 Vercel URL: *[Add your deployed link here]*

📂 GitHub Repo: *[Add your repo link here]*

---

# 📖 Project Overview

This project fulfills the following requirements:

1. ✅ User can sign up and log in using **Google (OAuth only)**
2. ✅ A logged-in user can **add bookmarks** (URL + Title)
3. ✅ Bookmarks are **private to each user**
4. ✅ Bookmark list **updates in real-time**
5. ✅ User can **delete their own bookmarks**
6. ✅ App deployed on **Vercel**

---

# 🛠️ Tech Stack

* **Next.js 15+ (App Router)**
* **Supabase**

  * Authentication (Google OAuth)
  * Realtime
  * Row Level Security (RLS)
* **Tailwind CSS**
* **TypeScript**
* **Vercel Deployment**

---

# 🔐 Authentication Flow

It was implemented **Google OAuth only** login using:

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
})
```

### Flow:

1. User clicks **Sign in with Google**
2. Redirected to Google
3. After login → redirected back to app
4. Session handled via:

   * `supabase.auth.getUser()`
   * `supabase.auth.onAuthStateChange()`

---

# 🗄️ Database Schema

## Table: `bookmarks`

| Column     | Type                      |
| ---------- | ------------------------- |
| id         | uuid (PK)                 |
| created_at | timestamptz               |
| user_id    | uuid (FK → auth.users.id) |
| title      | text                      |
| url        | text                      |

---

# 🔒 Row Level Security (RLS)

RLS is **enabled** on the `bookmarks` table.

### Policies:

## ✅ SELECT

Users can view only their own bookmarks:

## ✅ INSERT

Users can insert bookmarks only for themselves:

## ✅ DELETE

Users can delete only their own bookmarks:


This ensures:

* User A cannot see User B's bookmarks
* Data privacy is guaranteed at database level

---

# ⚡ Real-Time Implementation

We use Supabase Realtime:

```ts
supabase
  .channel("bookmarks-realtime")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "bookmarks",
      filter: `user_id=eq.${user.id}`,
    },
    () => fetchBookmarks()
  )
  .subscribe()
```

This ensures:

* If you open 2 tabs
* Add a bookmark in Tab 1
* It appears instantly in Tab 2

---

# 🎨 UI Features

* Modern gradient UI using Tailwind
* Responsive design
* Glassmorphism style cards
* Animated hover states
* Clean user session header
* Interactive bookmark cards

---

# 🧠 Key Challenges Faced

### 1️⃣ Next.js cookies() async issue

New Next.js versions require:

```ts
const cookieStore = await cookies()
```

Instead of direct `cookies()` usage.

### 2️⃣ Supabase SSR vs Browser client confusion

Fixed by:

* Using browser client for client components
* Using server client only when needed

### 3️⃣ RLS not showing data

Initially bookmarks didn’t appear because:

* RLS was enabled but policies were missing
  After adding proper policies, issue resolved.

### 4️⃣ Real-time filter issue

Without filtering by `user_id`, all users’ events were triggering updates.
Fixed using:

```ts
filter: `user_id=eq.${user.id}`
```

---

# 🧪 How to Test Privacy (User A vs User B)

1. Login with Account A
2. Add bookmarks
3. Logout
4. Open Incognito window
5. Login with Account B
6. Confirm:

   * Account B cannot see Account A bookmarks

---

# 🏗️ Project Structure

```
app/
  page.tsx
  google-login/
  auth/
lib/
  supabase/
    client.ts
    server.ts
proxy.ts
```

This project uses **App Router**, not Pages Router.

---

# 🛠️ Local Setup

## 1️⃣ Clone Repo

```bash
git clone <your-repo-url>
cd smart-bookmark-app
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Add Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 4️⃣ Run Dev Server

```bash
npm run dev
```

---

# 📌 Final Thoughts

This project demonstrates:

* Secure authentication
* Proper database-level security (RLS)
* Real-time systems
* Modern Next.js App Router architecture
* Clean UI design
* Production-ready deployment

---

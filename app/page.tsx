"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [bookmarks, setBookmarks] = useState<any[]>([])

  // 🔹 Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // 🔹 Fetch bookmarks
  const fetchBookmarks = async () => {
    if (!user) return

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // 🔹 Realtime
  useEffect(() => {
    if (!user) return

    fetchBookmarks()

    const channel = supabase
      .channel(`bookmarks-${user.id}`)
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const addBookmark = async () => {
    if (!title || !url || !user) return

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    setTitle("")
    setUrl("")
  }

  const deleteBookmark = async (id: string) => {
    if (!user) return

    await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white relative overflow-hidden">

    {/* Background Glow Effects */}
    <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

    <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 space-y-14">

      {/* HEADER */}
      <header className="space-y-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Supabase × Next.js 
        </p>

        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Smart Bookmark App
        </h1>

        <p className="text-slate-400 text-lg">
          Secure. Real-time. Private bookmarks powered by Supabase.
        </p>
      </header>

      {/* LOGIN SECTION */}
      {!user ? (
        <div className="flex justify-center">
          <button
            onClick={signIn}
            className="group relative px-10 py-4 text-lg font-semibold rounded-xl 
                       bg-gradient-to-r from-blue-500 to-purple-600
                       hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <span className="absolute inset-0 bg-white/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition" />
            🚀 Sign in with Google
          </button>
        </div>
      ) : (
        <div className="space-y-10">

          {/* USER HEADER */}
          <div className="flex justify-between items-center bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div>
              <h2 className="text-2xl font-semibold">
                Welcome, {user.user_metadata?.full_name || "User"}
              </h2>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>

            <button
              onClick={logout}
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          {/* ADD BOOKMARK */}
          <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">

            <h3 className="text-xl font-semibold text-blue-400">
              Add New Bookmark
            </h3>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Website Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-600 focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <button
                onClick={addBookmark}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition-all duration-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* BOOKMARK LIST */}
          <div className="grid gap-6 md:grid-cols-2">

            {bookmarks.length === 0 && (
              <div className="col-span-full text-center text-slate-400 py-10">
                No bookmarks yet. Add your first one 🚀
              </div>
            )}

            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group bg-slate-800/60 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-blue-400 transition">
                      {bookmark.title}
                    </h3>

                    <a
                      href={bookmark.url}
                      target="_blank"
                      className="text-sm text-slate-400 hover:text-purple-400 transition break-all"
                    >
                      {bookmark.url}
                    </a>
                  </div>

                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  </div>
)
}
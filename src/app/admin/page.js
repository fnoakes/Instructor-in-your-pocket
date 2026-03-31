"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client.js";
import { getCurrentUser, signOutUser } from "../../lib/supabase/auth.js";

const BRAND = {
  blue: "#7acef4",
  blueLight: "#eef9ff",
  navy: "#47778f",
  yellow: "#fcfd06",
  yellowLight: "#fffed1",
  greenLight: "#eafbf0",
  green: "#1f9d55",
  redLight: "#fff1f1",
  red: "#d9534f",
  slate: "#5c6874",
  border: "#d9ebf5",
  white: "#ffffff",
};

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [replies, setReplies] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const [replyDrafts, setReplyDrafts] = useState({});
  const [ticketFilter, setTicketFilter] = useState("all");
  const [ticketSearch, setTicketSearch] = useState("");

  const [communitySearch, setCommunitySearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState("newest");

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadAdminDashboard();
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  async function loadAdminDashboard() {
    try {
      setIsLoading(true);

      const { data, error } = await getCurrentUser();

      if (error || !data?.user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      let me = null;

const { data: meById } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", data.user.id)
  .maybeSingle();

me = meById || null;

if (!me && data.user.email) {
  const { data: meByEmail } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", data.user.email)
    .maybeSingle();

  me = meByEmail || null;
}

const adminEmails = ["f.noakes1@gmail.com"];

if (!me) {
  if (adminEmails.includes((data.user.email || "").toLowerCase())) {
    setProfile({
      name: "Francis",
      email: data.user.email,
      transmission: "manual",
      is_admin: true,
    });
    setIsAdmin(true);
  } else {
    console.error("ADMIN PROFILE LOAD ERROR: no matching profile found");
    setIsAdmin(false);
    setIsLoading(false);
    return;
  }
} else if (me.is_admin || adminEmails.includes((data.user.email || "").toLowerCase())) {
  setProfile(me);
  setIsAdmin(true);
} else {
  setProfile(me);
  setIsAdmin(false);
  setIsLoading(false);
  return;
}

      const [ticketsRes, repliesRes, communityRes, usersRes] = await Promise.all([
        supabase.from("ask_francis_tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("ask_francis_replies").select("*").order("created_at", { ascending: true }),
        supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);

      if (ticketsRes.error) console.error("ADMIN TICKETS ERROR:", ticketsRes.error);
      if (repliesRes.error) console.error("ADMIN REPLIES ERROR:", repliesRes.error);
      if (communityRes.error) console.error("ADMIN COMMUNITY ERROR:", communityRes.error);
      if (usersRes.error) console.error("ADMIN USERS ERROR:", usersRes.error);

      setTickets(ticketsRes.data || []);
      setReplies(repliesRes.data || []);
      setCommunityPosts(communityRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReply(ticketId) {
    const replyText = (replyDrafts[ticketId] || "").trim();
    if (!replyText) return;

    try {
      const supabase = createClient();

      const { error: replyError } = await supabase.from("ask_francis_replies").insert({
        ticket_id: ticketId,
        reply_text: replyText,
      });

      if (replyError) {
        console.error(replyError);
        return;
      }

      const { error: ticketUpdateError } = await supabase
        .from("ask_francis_tickets")
        .update({ status: "Answered" })
        .eq("id", ticketId);

      if (ticketUpdateError) {
        console.error(ticketUpdateError);
      }

      setReplyDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleHidden(post) {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("community_posts")
        .update({
          is_hidden: !post.is_hidden,
          hidden_at: !post.is_hidden ? new Date().toISOString() : null,
        })
        .eq("id", post.id);

      if (error) {
        console.error(error);
        return;
      }

      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    }
  }

  async function deletePost(postId) {
    const confirmed = window.confirm("Delete this community post permanently?");
    if (!confirmed) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("community_posts").delete().eq("id", postId);

      if (error) {
        console.error(error);
        return;
      }

      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    }
  }

  async function signOut() {
    try {
      await signOutUser();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  }

  const filteredTickets = useMemo(() => {
    const query = ticketSearch.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesFilter =
        ticketFilter === "all" ||
        (ticketFilter === "awaiting" && ticket.status !== "Answered") ||
        (ticketFilter === "answered" && ticket.status === "Answered");

      const matchesSearch =
        !query ||
        ticket.subject?.toLowerCase().includes(query) ||
        ticket.message?.toLowerCase().includes(query) ||
        ticket.links?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tickets, ticketFilter, ticketSearch]);

  const filteredCommunityPosts = useMemo(() => {
    const query = communitySearch.trim().toLowerCase();

    return communityPosts.filter((post) => {
      return (
        !query ||
        post.author_name?.toLowerCase().includes(query) ||
        post.subject?.toLowerCase().includes(query) ||
        post.body?.toLowerCase().includes(query) ||
        post.tag?.toLowerCase().includes(query)
      );
    });
  }, [communityPosts, communitySearch]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    let next = users.filter((user) => {
      return (
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.transmission?.toLowerCase().includes(query)
      );
    });

    next.sort((a, b) => {
      if (userSort === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (userSort === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (userSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (userSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      return 0;
    });

    return next;
  }, [users, userSearch, userSort]);

  function repliesForTicket(ticketId) {
    return replies.filter((reply) => reply.ticket_id === ticketId);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: BRAND.blueLight }}>
        <div className="mx-auto max-w-7xl rounded-[32px] bg-white p-8 ring-1" style={{ borderColor: BRAND.border }}>
          <p style={{ color: BRAND.slate }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: BRAND.blueLight }}>
        <div className="mx-auto max-w-4xl rounded-[32px] bg-white p-8 ring-1" style={{ borderColor: BRAND.border }}>
          <h1 className="text-3xl font-black" style={{ color: BRAND.navy }}>
            Not authorised
          </h1>
          <p className="mt-3" style={{ color: BRAND.slate }}>
            This page is admin only.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
          >
            Back to app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, ${BRAND.blueLight} 0%, ${BRAND.white} 35%, ${BRAND.yellowLight} 100%)`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header
          className="mb-6 rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1"
          style={{ borderColor: BRAND.border }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
                Admin dashboard
              </p>
              <h1 className="mt-1 text-4xl font-black" style={{ color: BRAND.navy }}>
                Instructor In Your Pocket
              </h1>
              <p className="mt-2 text-sm" style={{ color: BRAND.slate }}>
                Signed in as {profile?.name || profile?.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadAdminDashboard}
                className="rounded-2xl px-4 py-3 text-sm font-bold"
                style={{ backgroundColor: BRAND.blueLight, color: BRAND.navy, border: `1px solid ${BRAND.border}` }}
              >
                Refresh
              </button>
              <button
                onClick={signOut}
                className="rounded-2xl px-4 py-3 text-sm font-bold"
                style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Ask Francis tickets" value={tickets.length} />
          <SummaryCard label="Community posts" value={communityPosts.length} />
          <SummaryCard label="Users" value={users.length} />
        </section>

        <section className="mt-6 rounded-[32px] bg-white p-6 ring-1" style={{ borderColor: BRAND.border }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
                Ask Francis
              </p>
              <h2 className="mt-1 text-2xl font-black">All questions</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search questions"
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: BRAND.border }}
              />
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: BRAND.border }}
              >
                <option value="all">All tickets</option>
                <option value="awaiting">Awaiting reply</option>
                <option value="answered">Answered</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-[28px] p-5 ring-1"
                style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">{ticket.subject}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.slate }}>
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                      User ID: {ticket.user_id}
                    </p>
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      backgroundColor: ticket.status === "Answered" ? BRAND.greenLight : BRAND.yellowLight,
                      color: ticket.status === "Answered" ? BRAND.green : BRAND.navy,
                      border: `1px solid ${BRAND.border}`,
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6" style={{ color: BRAND.slate }}>
                  {ticket.message}
                </p>

                {ticket.links ? (
                  <div
                    className="mt-4 rounded-2xl p-3 ring-1"
                    style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: BRAND.navy }}>
                      Links
                    </p>
                    <p className="mt-1 text-sm break-words" style={{ color: BRAND.slate }}>
                      {ticket.links}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 space-y-3">
                  {repliesForTicket(ticket.id).map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-2xl p-3 ring-1"
                      style={{ backgroundColor: BRAND.greenLight, borderColor: BRAND.border }}
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: BRAND.green }}>
                        Your reply
                      </p>
                      <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                        {reply.reply_text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-bold" style={{ color: BRAND.navy }}>
                    Reply
                  </label>
                  <textarea
                    value={replyDrafts[ticket.id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                    rows={4}
                    placeholder="Write your reply here..."
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: BRAND.border }}
                  />
                  <button
                    onClick={() => handleReply(ticket.id)}
                    className="mt-3 rounded-2xl px-4 py-3 text-sm font-bold"
                    style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
                  >
                    Send reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[32px] bg-white p-6 ring-1" style={{ borderColor: BRAND.border }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
                Community moderation
              </p>
              <h2 className="mt-1 text-2xl font-black">Posts</h2>
            </div>

            <input
              value={communitySearch}
              onChange={(e) => setCommunitySearch(e.target.value)}
              placeholder="Search community posts"
              className="rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: BRAND.border }}
            />
          </div>

          <div className="mt-6 space-y-4">
            {filteredCommunityPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-[28px] p-5 ring-1"
                style={{
                  backgroundColor: post.is_hidden ? BRAND.redLight : BRAND.white,
                  borderColor: BRAND.border,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
                        style={{ backgroundColor: BRAND.yellowLight, color: BRAND.navy }}
                      >
                        {post.tag}
                      </span>
                      {post.is_hidden ? (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{ backgroundColor: BRAND.redLight, color: BRAND.red, border: `1px solid ${BRAND.border}` }}
                        >
                          Hidden
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-xl font-black">{post.subject}</h3>
                    <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                      by {post.author_name} · {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleHidden(post)}
                      className="rounded-2xl px-4 py-3 text-sm font-bold"
                      style={{ backgroundColor: BRAND.blueLight, color: BRAND.navy, border: `1px solid ${BRAND.border}` }}
                    >
                      {post.is_hidden ? "Unhide" : "Hide"}
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded-2xl px-4 py-3 text-sm font-bold"
                      style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6" style={{ color: BRAND.slate }}>
                  {post.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[32px] bg-white p-6 ring-1" style={{ borderColor: BRAND.border }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
                Users
              </p>
              <h2 className="mt-1 text-2xl font-black">All users</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users"
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: BRAND.border }}
              />
              <select
                value={userSort}
                onChange={(e) => setUserSort(e.target.value)}
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: BRAND.border }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr style={{ color: BRAND.navy }}>
                  <th className="pb-3 pr-4 font-black">Name</th>
                  <th className="pb-3 pr-4 font-black">Email</th>
                  <th className="pb-3 pr-4 font-black">Transmission</th>
                  <th className="pb-3 pr-4 font-black">Admin</th>
                  <th className="pb-3 pr-4 font-black">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t" style={{ borderColor: BRAND.border }}>
                    <td className="py-3 pr-4">{user.name || "—"}</td>
                    <td className="py-3 pr-4">{user.email || "—"}</td>
                    <td className="py-3 pr-4">{user.transmission || "—"}</td>
                    <td className="py-3 pr-4">{user.is_admin ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[28px] bg-white p-5 ring-1" style={{ borderColor: BRAND.border }}>
      <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: BRAND.navy }}>
        {label}
      </p>
      <p className="mt-2 text-4xl font-black" style={{ color: BRAND.navy }}>
        {value}
      </p>
    </div>
  );
}
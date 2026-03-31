"use client";

import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../../lib/supabase/auth.js";
import { createClient } from "../../lib/supabase/client.js";

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

function isPaidStatus(status) {
  return status === "active" || status === "trialing";
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const [ticketSearch, setTicketSearch] = useState("");
  const [archiveSearch, setArchiveSearch] = useState("");
  const [communitySearch, setCommunitySearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState("newest");

  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [hideBusyId, setHideBusyId] = useState(null);
  const [userAdminBusyId, setUserAdminBusyId] = useState(null);
  const [userPaidBusyId, setUserPaidBusyId] = useState(null);

  const [openSections, setOpenSections] = useState({
    inbox: false,
    archive: false,
    community: false,
    users: false,
  });

  function toggleSection(sectionKey) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }

  async function loadAdminDashboard() {
    try {
      setIsLoading(true);

      const { data: authData, error: authError } = await getCurrentUser();
      if (authError || !authData?.user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const user = authData.user;

      const { data: meById } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      let me = meById || null;

      if (!me && user.email) {
        const { data: meByEmail } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        me = meByEmail || null;
      }

      if (!me || !me.is_admin) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsAdmin(true);

      const [ticketsRes, repliesRes, communityRes, communityRepliesRes, communityLikesRes, usersRes] =
        await Promise.all([
          supabase.from("ask_francis_tickets").select("*").order("created_at", { ascending: false }),
          supabase.from("ask_francis_replies").select("*").order("created_at", { ascending: true }),
          supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
          supabase.from("community_replies").select("*").order("created_at", { ascending: true }),
          supabase.from("community_likes").select("*"),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        ]);

      if (ticketsRes.error) console.error("ADMIN TICKETS LOAD ERROR:", ticketsRes.error);
      if (repliesRes.error) console.error("ADMIN TICKET REPLIES LOAD ERROR:", repliesRes.error);
      if (communityRes.error) console.error("ADMIN COMMUNITY LOAD ERROR:", communityRes.error);
      if (communityRepliesRes.error) console.error("ADMIN COMMUNITY REPLIES LOAD ERROR:", communityRepliesRes.error);
      if (communityLikesRes.error) console.error("ADMIN COMMUNITY LIKES LOAD ERROR:", communityLikesRes.error);
      if (usersRes.error) console.error("ADMIN USERS LOAD ERROR:", usersRes.error);

      const ticketReplies = repliesRes.data || [];
      const communityReplies = communityRepliesRes.data || [];
      const communityLikes = communityLikesRes.data || [];

      const builtTickets = (ticketsRes.data || []).map((ticket) => ({
        ...ticket,
        replies: ticketReplies.filter((reply) => reply.ticket_id === ticket.id),
      }));

      const builtCommunityPosts = (communityRes.data || []).map((post) => ({
        ...post,
        replies: communityReplies.filter((reply) => reply.post_id === post.id),
        likesCount: communityLikes.filter((like) => like.post_id === post.id).length,
      }));

      setTickets(builtTickets);
      setCommunityPosts(builtCommunityPosts);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error(error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  async function handleReply(ticketId) {
    const replyText = (replyDrafts[ticketId] || "").trim();
    if (!replyText) return;

    try {
      setSavingReplyId(ticketId);
      const supabase = createClient();

      const { error: replyError } = await supabase.from("ask_francis_replies").insert({
        ticket_id: ticketId,
        reply_text: replyText,
      });

      if (replyError) {
        console.error("ADMIN REPLY INSERT ERROR:", replyError);
        return;
      }

      const { error: updateError } = await supabase
        .from("ask_francis_tickets")
        .update({
          status: "Archived",
        })
        .eq("id", ticketId);

      if (updateError) {
        console.error("ADMIN TICKET ARCHIVE ERROR:", updateError);
        return;
      }

      setReplyDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    } finally {
      setSavingReplyId(null);
    }
  }

  async function toggleCommunityHidden(post) {
    try {
      setHideBusyId(post.id);
      const supabase = createClient();

      const { error } = await supabase
        .from("community_posts")
        .update({
          is_hidden: !post.is_hidden,
        })
        .eq("id", post.id);

      if (error) {
        console.error("ADMIN COMMUNITY TOGGLE ERROR:", error);
        return;
      }

      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    } finally {
      setHideBusyId(null);
    }
  }

  async function toggleUserAdmin(userRow) {
    try {
      setUserAdminBusyId(userRow.id);
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: !userRow.is_admin,
        })
        .eq("id", userRow.id);

      if (error) {
        console.error("ADMIN USER ROLE TOGGLE ERROR:", error);
        return;
      }

      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    } finally {
      setUserAdminBusyId(null);
    }
  }

  async function toggleUserPaid(userRow) {
    try {
      setUserPaidBusyId(userRow.id);
      const supabase = createClient();

      const nextPaid = !isPaidStatus(userRow.subscription_status);

      const payload = nextPaid
        ? {
            subscription_status: "active",
            current_period_end: null,
          }
        : {
            subscription_status: "free",
            current_period_end: null,
          };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userRow.id);

      if (error) {
        console.error("ADMIN USER PAID TOGGLE ERROR:", error);
        return;
      }

      await loadAdminDashboard();
    } catch (error) {
      console.error(error);
    } finally {
      setUserPaidBusyId(null);
    }
  }

  const activeTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const archived = (ticket.status || "").toLowerCase() === "archived";
      if (archived) return false;

      if (!q) return true;

      return (
        (ticket.subject || "").toLowerCase().includes(q) ||
        (ticket.message || "").toLowerCase().includes(q) ||
        (ticket.links || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, ticketSearch]);

  const archivedTickets = useMemo(() => {
    const q = archiveSearch.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const archived = (ticket.status || "").toLowerCase() === "archived";
      if (!archived) return false;

      if (!q) return true;

      return (
        (ticket.subject || "").toLowerCase().includes(q) ||
        (ticket.message || "").toLowerCase().includes(q) ||
        (ticket.links || "").toLowerCase().includes(q) ||
        ticket.replies.some((reply) => (reply.reply_text || "").toLowerCase().includes(q))
      );
    });
  }, [tickets, archiveSearch]);

  const filteredCommunityPosts = useMemo(() => {
    const q = communitySearch.trim().toLowerCase();
    return communityPosts.filter((post) => {
      if (!q) return true;
      return (
        (post.subject || "").toLowerCase().includes(q) ||
        (post.body || "").toLowerCase().includes(q) ||
        (post.author_name || "").toLowerCase().includes(q) ||
        (post.tag || "").toLowerCase().includes(q)
      );
    });
  }, [communityPosts, communitySearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();

    const filtered = users.filter((user) => {
      if (!q) return true;
      return (
        (user.name || "").toLowerCase().includes(q) ||
        (user.email || "").toLowerCase().includes(q) ||
        (user.transmission || "").toLowerCase().includes(q) ||
        (user.subscription_status || "").toLowerCase().includes(q)
      );
    });

    if (userSort === "name-az") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (userSort === "name-za") {
      filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (userSort === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    } else {
      filtered.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }

    return filtered;
  }, [users, userSearch, userSort]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: BRAND.blueLight }}>
        <div
          className="mx-auto max-w-7xl rounded-[28px] bg-white p-8 ring-1"
          style={{ borderColor: BRAND.border }}
        >
          <p style={{ color: BRAND.slate }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: BRAND.blueLight }}>
        <div
          className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 ring-1"
          style={{ borderColor: BRAND.border }}
        >
          <h1 className="text-3xl font-black" style={{ color: BRAND.navy }}>
            Not authorised
          </h1>
          <p className="mt-3" style={{ color: BRAND.slate }}>
            This page is admin only.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-2xl px-4 py-3 text-sm font-bold"
            style={{
              backgroundColor: BRAND.navy,
              color: BRAND.white,
            }}
          >
            Back to app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{
        background: `linear-gradient(180deg, ${BRAND.blueLight} 0%, ${BRAND.white} 50%, ${BRAND.yellowLight} 100%)`,
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <section
          className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1"
          style={{ borderColor: BRAND.border }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
                Admin dashboard
              </p>
              <h1 className="mt-1 text-4xl font-black tracking-tight" style={{ color: BRAND.navy }}>
                Instructor In Your Pocket admin
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: BRAND.slate }}>
                Reply to Ask Francis tickets, archive handled support messages, moderate community posts, search users, and manually control paid access.
              </p>
            </div>

            <a
              href="/"
              className="inline-block rounded-2xl px-4 py-3 text-sm font-bold"
              style={{ backgroundColor: BRAND.navy, color: BRAND.white }}
            >
              Back to main app
            </a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open tickets" value={activeTickets.length} />
          <StatCard label="Archived tickets" value={archivedTickets.length} />
          <StatCard label="Community posts" value={communityPosts.length} />
          <StatCard label="Users" value={users.length} />
        </section>

        <CollapsibleSection
          title="Ask Francis inbox"
          subtitle="Replying to a ticket will archive it automatically."
          isOpen={openSections.inbox}
          onToggle={() => toggleSection("inbox")}
          right={
            <input
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder="Search open tickets..."
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none lg:max-w-sm"
              style={{ borderColor: BRAND.border }}
            />
          }
        >
          <div className="space-y-4">
            {activeTickets.length === 0 ? (
              <EmptyCard text="No open tickets right now." />
            ) : (
              activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-[24px] p-5 ring-1"
                  style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{ backgroundColor: BRAND.yellowLight, color: BRAND.navy }}
                        >
                          {ticket.status || "Awaiting reply"}
                        </span>
                        <span className="text-xs" style={{ color: BRAND.slate }}>
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-black">{ticket.subject}</h3>
                      <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
                        {ticket.message}
                      </p>

                      {ticket.links ? (
                        <div
                          className="mt-3 rounded-2xl p-3 ring-1"
                          style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
                        >
                          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: BRAND.navy }}>
                            Links
                          </p>
                          <p className="mt-1 break-words text-sm" style={{ color: BRAND.slate }}>
                            {ticket.links}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div
                      className="rounded-2xl px-3 py-2 text-xs font-semibold"
                      style={{ backgroundColor: BRAND.blueLight, color: BRAND.navy }}
                    >
                      {ticket.replies.length} replies
                    </div>
                  </div>

                  {ticket.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {ticket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl p-3 ring-1"
                          style={{ backgroundColor: BRAND.greenLight, borderColor: BRAND.border }}
                        >
                          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: BRAND.green }}>
                            Previous reply
                          </p>
                          <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                            {reply.reply_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <textarea
                      value={replyDrafts[ticket.id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Write your reply..."
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: BRAND.border }}
                    />

                    <button
                      onClick={() => handleReply(ticket.id)}
                      disabled={savingReplyId === ticket.id}
                      className="mt-3 rounded-2xl px-4 py-3 text-sm font-bold"
                      style={{
                        backgroundColor: BRAND.navy,
                        color: BRAND.white,
                        opacity: savingReplyId === ticket.id ? 0.7 : 1,
                      }}
                    >
                      {savingReplyId === ticket.id ? "Sending..." : "Send reply and archive"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Archived Ask Francis tickets"
          subtitle="Search old replies and previously handled support threads."
          isOpen={openSections.archive}
          onToggle={() => toggleSection("archive")}
          right={
            <input
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              placeholder="Search archive..."
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none lg:max-w-sm"
              style={{ borderColor: BRAND.border }}
            />
          }
        >
          <div className="space-y-4">
            {archivedTickets.length === 0 ? (
              <EmptyCard text="No archived tickets found." />
            ) : (
              archivedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-[24px] p-5 ring-1"
                  style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-black"
                      style={{ backgroundColor: BRAND.greenLight, color: BRAND.green }}
                    >
                      Archived
                    </span>
                    <span className="text-xs" style={{ color: BRAND.slate }}>
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-black">{ticket.subject}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
                    {ticket.message}
                  </p>

                  {ticket.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {ticket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl p-3 ring-1"
                          style={{ backgroundColor: BRAND.greenLight, borderColor: BRAND.border }}
                        >
                          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: BRAND.green }}>
                            Reply
                          </p>
                          <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                            {reply.reply_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Community moderation"
          subtitle="Search posts, review replies and likes, and hide or restore posts."
          isOpen={openSections.community}
          onToggle={() => toggleSection("community")}
          right={
            <input
              value={communitySearch}
              onChange={(e) => setCommunitySearch(e.target.value)}
              placeholder="Search community posts..."
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none lg:max-w-sm"
              style={{ borderColor: BRAND.border }}
            />
          }
        >
          <div className="space-y-4">
            {filteredCommunityPosts.length === 0 ? (
              <EmptyCard text="No community posts found." />
            ) : (
              filteredCommunityPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-[24px] p-5 ring-1"
                  style={{ backgroundColor: BRAND.white, borderColor: BRAND.border }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{
                            backgroundColor: post.is_hidden ? BRAND.redLight : BRAND.yellowLight,
                            color: post.is_hidden ? BRAND.red : BRAND.navy,
                          }}
                        >
                          {post.is_hidden ? "Hidden" : post.tag || "General"}
                        </span>
                        <span className="text-xs" style={{ color: BRAND.slate }}>
                          by {post.author_name || "Learner"} · {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-black">{post.subject}</h3>
                      <p className="mt-2 text-sm leading-6" style={{ color: BRAND.slate }}>
                        {post.body}
                      </p>

                      <p className="mt-3 text-xs" style={{ color: BRAND.slate }}>
                        {post.likesCount} likes · {post.replies.length} replies
                      </p>
                    </div>

                    <button
                      onClick={() => toggleCommunityHidden(post)}
                      disabled={hideBusyId === post.id}
                      className="rounded-2xl px-4 py-3 text-sm font-bold"
                      style={{
                        backgroundColor: post.is_hidden ? BRAND.green : BRAND.red,
                        color: BRAND.white,
                        opacity: hideBusyId === post.id ? 0.7 : 1,
                      }}
                    >
                      {hideBusyId === post.id
                        ? "Saving..."
                        : post.is_hidden
                        ? "Restore post"
                        : "Hide post"}
                    </button>
                  </div>

                  {post.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {post.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-2xl p-3 ring-1"
                          style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
                        >
                          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: BRAND.navy }}>
                            {reply.author_name || "Learner"}
                          </p>
                          <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>
                            {reply.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Users"
          subtitle="Search users, sort them, and manually control both admin and paid access."
          isOpen={openSections.users}
          onToggle={() => toggleSection("users")}
          right={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[280px,220px]">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
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
                <option value="name-az">Name A-Z</option>
                <option value="name-za">Name Z-A</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr style={{ color: BRAND.navy }}>
                  <th className="px-3 py-3 font-black">Name</th>
                  <th className="px-3 py-3 font-black">Email</th>
                  <th className="px-3 py-3 font-black">Transmission</th>
                  <th className="px-3 py-3 font-black">Joined</th>
                  <th className="px-3 py-3 font-black">Role</th>
                  <th className="px-3 py-3 font-black">Access</th>
                  <th className="px-3 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const paid = isPaidStatus(user.subscription_status);

                  return (
                    <tr key={user.id} className="border-t" style={{ borderColor: BRAND.border }}>
                      <td className="px-3 py-3">{user.name || "—"}</td>
                      <td className="px-3 py-3">{user.email || "—"}</td>
                      <td className="px-3 py-3 capitalize">{user.transmission || "—"}</td>
                      <td className="px-3 py-3">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{
                            backgroundColor: user.is_admin ? BRAND.greenLight : BRAND.blueLight,
                            color: user.is_admin ? BRAND.green : BRAND.navy,
                          }}
                        >
                          {user.is_admin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{
                            backgroundColor: paid ? BRAND.greenLight : BRAND.yellowLight,
                            color: paid ? BRAND.green : BRAND.navy,
                          }}
                        >
                          {paid ? "Paid" : "Free"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleUserAdmin(user)}
                            disabled={userAdminBusyId === user.id}
                            className="rounded-2xl px-3 py-2 text-xs font-bold"
                            style={{
                              backgroundColor: BRAND.navy,
                              color: BRAND.white,
                              opacity: userAdminBusyId === user.id ? 0.7 : 1,
                            }}
                          >
                            {userAdminBusyId === user.id
                              ? "Saving..."
                              : user.is_admin
                              ? "Remove admin"
                              : "Make admin"}
                          </button>

                          <button
                            onClick={() => toggleUserPaid(user)}
                            disabled={userPaidBusyId === user.id}
                            className="rounded-2xl px-3 py-2 text-xs font-bold"
                            style={{
                              backgroundColor: paid ? BRAND.red : BRAND.green,
                              color: BRAND.white,
                              opacity: userPaidBusyId === user.id ? 0.7 : 1,
                            }}
                          >
                            {userPaidBusyId === user.id
                              ? "Saving..."
                              : paid
                              ? "Make free"
                              : "Make paid"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="mt-4">
                <EmptyCard text="No users found." />
              </div>
            )}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, subtitle, isOpen, onToggle, right, children }) {
  return (
    <section
      className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(71,119,143,0.08)] ring-1"
      style={{ borderColor: BRAND.border }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <button onClick={onToggle} className="text-left">
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{ color: BRAND.navy }}>
            {title}
          </p>
          <p className="mt-2 text-sm" style={{ color: BRAND.slate }}>
            {subtitle}
          </p>
          <p className="mt-3 text-sm font-bold" style={{ color: BRAND.navy }}>
            {isOpen ? "Hide section" : "Open section"}
          </p>
        </button>

        {isOpen ? right : null}
      </div>

      {isOpen ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      className="rounded-[24px] bg-white p-5 shadow-[0_20px_60px_rgba(71,119,143,0.06)] ring-1"
      style={{ borderColor: BRAND.border }}
    >
      <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: BRAND.slate }}>
        {label}
      </p>
      <p className="mt-2 text-4xl font-black" style={{ color: BRAND.navy }}>
        {value}
      </p>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div
      className="rounded-[24px] p-5 ring-1"
      style={{ backgroundColor: BRAND.blueLight, borderColor: BRAND.border }}
    >
      <p style={{ color: BRAND.slate }}>{text}</p>
    </div>
  );
}
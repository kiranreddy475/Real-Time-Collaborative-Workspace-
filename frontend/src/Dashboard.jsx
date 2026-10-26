"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  Activity,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  FilePlus2,
  FileText,
  History,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Share2,
  Shield,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const demoPages = [
  {
    id: "welcome",
    title: "Welcome to CollabSpace",
    workspace: "Design Studio",
    updatedAt: "Just now",
    content:
      "<h1>Welcome to your shared canvas</h1><p>This is a live document. Open another browser window and sign in as another teammate to see edits and cursors appear in real time.</p><h2>What you can do</h2><ul><li>Edit this document with your team</li><li>Leave a comment on the page</li><li>Review saved snapshots</li></ul><p>Every keystroke is synced through Yjs, a conflict-free replicated data type. Concurrent changes merge automatically, even if someone briefly loses their connection.</p>",
  },
  {
    id: "roadmap",
    title: "Product roadmap",
    workspace: "Design Studio",
    updatedAt: "1 hour ago",
    content:
      "<h1>Product roadmap</h1><p>Plan, discuss, and ship together.</p><h2>Now</h2><ul><li>Real-time collaboration</li><li>Comment threads</li></ul>",
  },
  {
    id: "notes",
    title: "Team notes",
    workspace: "Design Studio",
    updatedAt: "Yesterday",
    content:
      "<h1>Team notes</h1><p>Capture decisions and keep everyone in the loop.</p>",
  },
];
const palette = ["#7357e8", "#ed7a53", "#2c9e86", "#db6294", "#3975cc"];
const initial = (name = "Guest") =>
  name
    .split(/\s+/)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function CollaborativeEditor({ page, user, token, onPresence, editable }) {
  const [connection, setConnection] = useState("connecting");
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState(null);
  useEffect(() => {
    const connection = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234",
      page.id,
      doc,
      { connect: true, params: { token: token || "" } },
    );
    // The provider must be constructed after mount so it can access the browser WebSocket API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProvider(connection);
    return () => {
      connection.destroy();
      doc.destroy();
    };
  }, [page.id, token, doc]);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: doc }),
        ...(provider
          ? [
              CollaborationCaret.configure({
                provider,
                user: {
                  name: user?.username || user?.name || "Guest",
                  color: palette[(user?.id || 0) % palette.length],
                },
              }),
            ]
          : []),
      ],
      editable,
      editorProps: {
        attributes: {
          class: "editor-prose",
          "aria-label": "Collaborative document editor",
          spellcheck: "false",
        },
      },
    },
    [page.id, provider, editable],
  );

  useEffect(() => {
    if (!provider) return;
    const connect = (value) => setConnection(value.status);
    const awareness = () =>
      onPresence(
        Array.from(provider.awareness.getStates().values())
          .map((state) => state.user)
          .filter(Boolean),
      );
    provider.on("status", connect);
    provider.awareness.on("change", awareness);
    return () => {
      provider.off("status", connect);
      provider.awareness.off("change", awareness);
    };
  }, [provider, doc, onPresence]);

  useEffect(() => {
    if (!editor || !provider || !editable) return;

    const fragment = doc.getXmlFragment("prosemirror");

    // Don't initialize content until the editor instance exists.
    if (editor.isDestroyed) return;

    if (fragment.length === 0) {
      editor.commands.setContent(
        page.content || "<p>Start writing together…</p>",
      );
    }
  }, [editor, provider, editable, doc, page.id, page.content]);

  return (
    <>
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive("bold") ? "tool active" : "tool"}
            aria-label="Bold"
          >
            B
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={
              editor?.isActive("italic") ? "tool active italic" : "tool italic"
            }
            aria-label="Italic"
          >
            I
          </button>
          <span className="tool-divider" />
          <button
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className="tool heading-tool"
          >
            H1
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className="tool"
            aria-label="Bullet list"
          >
            ☷
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className="tool"
            aria-label="Quote"
          >
            “
          </button>
        </div>
        <span className="toolbar-hint">Changes save as you type</span>
      </div>
      <EditorContent editor={editor} />
      <div className="editor-footer">
        <span
          className={
            connection === "connected" ? "live-status" : "offline-status"
          }
        >
          {connection === "connected" ? (
            <>
              <Wifi size={13} /> Live sync
            </>
          ) : (
            <>
              <WifiOff size={13} />{" "}
              {connection === "connecting" ? "Connecting…" : "Reconnecting…"}
            </>
          )}
        </span>
        <span>Yjs collaborative document</span>
      </div>
    </>
  );
}

export default function Dashboard({ onLogout }) {
  const [user] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    } catch {
      return null;
    }
  });
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [pages, setPages] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("collab-pages") || "null") ||
            demoPages
        : demoPages;
    } catch {
      return demoPages;
    }
  });
  const [activeId, setActiveId] = useState(null),
    [query, setQuery] = useState(""),
    [workspace, setWorkspace] = useState("Design Studio"),
    [workspaceId, setWorkspaceId] = useState(null),
    [workspaces, setWorkspaces] = useState([]),
    [workspaceRole, setWorkspaceRole] = useState("owner"),
    [tab, setTab] = useState("document");
  const [comments, setComments] = useState([]),
    [comment, setComment] = useState(""),
    [snapshots, setSnapshots] = useState([]),
    [presence, setPresence] = useState([]),
    [shareOpen, setShareOpen] = useState(false),
    [copied, setCopied] = useState(false),
    [permission, setPermission] = useState("edit"),
    [inviteEmail, setInviteEmail] = useState(""),
    [inviteStatus, setInviteStatus] = useState("");
  const activePage = pages.find((p) => p.id === activeId);
  const activePageId = activePage?.id;
  const filtered = useMemo(
    () =>
      pages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [pages, query],
  );
  useEffect(() => {
    localStorage.setItem("collab-pages", JSON.stringify(pages));
  }, [pages]);
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((items) => {
        const home = items[0];
        setWorkspaces(items);
        if (!home) return;
        setWorkspace(home.name);
        setWorkspaceId(home.id);
        setWorkspaceRole(
          home.ownerId === user?.id
            ? "owner"
            : home.memberships?.find((m) => m.userId === user?.id)?.role ||
                "view",
        );
        setPages(
          home.pages.map((p) => ({
            id: p.id,
            title: p.title,
            workspace: home.name,
            updatedAt: "Recently",
            content:
              p.title === "Welcome to CollabSpace"
                ? demoPages[0].content
                : "<h1>" + p.title + "</h1><p>Start writing together…</p>",
          })),
        );
      })
      .catch(() => {});
  }, [token, user?.id]);
  useEffect(() => {
    if (!activePageId || !token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API}/api/pages/${activePageId}/comments`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then(setComments)
      .catch(() => {});
    fetch(`${API}/api/pages/${activePageId}/snapshots`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then(setSnapshots)
      .catch(() => {});
  }, [activePageId, token]);
  const rename = (id, title) =>
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, title, updatedAt: "Just now" } : p,
      ),
    );
  const persistTitle = async (id) => {
    const page = pages.find((p) => p.id === id);
    if (token && page)
      fetch(`${API}/api/pages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: page.title }),
      }).catch(() => {});
  };
  const createPage = async () => {
    if (token && !["owner", "edit"].includes(workspaceRole)) {
      setInviteStatus("Edit access is required to create pages.");
      setShareOpen(true);
      return;
    }
    const title = "Untitled page";
    let id = `page-${Date.now()}`;
    if (token && workspaceId) {
      try {
        const response = await fetch(
          `${API}/api/workspaces/${encodeURIComponent(workspace)}/pages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
          },
        );
        if (!response.ok)
          throw new Error("Unable to create page in this workspace.");
        id = (await response.json()).id;
      } catch (error) {
        setInviteStatus(error.message);
        setShareOpen(true);
        return;
      }
    }
    const item = {
      id,
      title,
      workspace,
      updatedAt: "Just now",
      content: "<h1>Untitled page</h1><p>Start writing together…</p>",
    };
    setPages((prev) => [item, ...prev]);
    setActiveId(id);
  };
  const selectWorkspace = (id) => {
    const selected = workspaces.find((item) => item.id === id);
    if (!selected) return;
    setWorkspace(selected.name);
    setWorkspaceId(selected.id);
    setWorkspaceRole(
      selected.ownerId === user?.id
        ? "owner"
        : selected.memberships?.find((m) => m.userId === user?.id)?.role ||
            "view",
    );
    setPages(
      selected.pages.map((p) => ({
        id: p.id,
        title: p.title,
        workspace: selected.name,
        updatedAt: "Recently",
        content:
          p.title === "Welcome to CollabSpace"
            ? demoPages[0].content
            : `<h1>${p.title}</h1><p>Start writing together…</p>`,
      })),
    );
    setActiveId(null);
  };
  const createWorkspace = async () => {
    const name = window.prompt("Name your workspace");
    if (!name?.trim()) return;
    try {
      const response = await fetch(`${API}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to create workspace.");
      const next = {
        ...data,
        pages: [],
        memberships: [{ userId: user.id, role: "owner" }],
      };
      setWorkspaces((prev) => [...prev, next]);
      setWorkspace(next.name);
      setWorkspaceId(next.id);
      setWorkspaceRole("owner");
      setPages([]);
      setActiveId(null);
    } catch (error) {
      setInviteStatus(error.message);
      setShareOpen(true);
    }
  };
  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const entry = {
      id: Date.now(),
      body: comment.trim(),
      author: user?.username || "You",
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, entry]);
    setComment("");
    if (token)
      fetch(`${API}/api/pages/${activeId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: entry.body }),
      }).catch(() => {});
  };
  const saveSnapshot = async () => {
    const item = {
      id: Date.now(),
      label: `Snapshot ${snapshots.length + 1}`,
      createdAt: new Date().toISOString(),
      author: user?.username || "You",
    };
    setSnapshots((prev) => [item, ...prev]);
    if (token)
      fetch(`${API}/api/pages/${activeId}/snapshots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label: item.label }),
      }).catch(() => {});
  };
  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const invite = async (e) => {
    e.preventDefault();
    setInviteStatus("");
    if (!token || !workspaceId) {
      setInviteStatus("Sign in to invite a teammate.");
      return;
    }
    try {
      const response = await fetch(
        `${API}/api/workspaces/${workspaceId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: inviteEmail, role: permission }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to add teammate.");
      setInviteStatus(
        `${data.membership.username} added with ${data.membership.role} access.`,
      );
      setInviteEmail("");
    } catch (error) {
      setInviteStatus(error.message);
    }
  };
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <button className="brand-lockup" onClick={() => setActiveId(null)}>
          <span className="brand-icon">
            <Command size={17} />
          </span>
          <span>CollabSpace</span>
          <ChevronDown size={14} className="brand-chevron" />
        </button>
        <div className="workspace-switcher">
          <span className="workspace-mark">D</span>
          {workspaces.length > 1 ? (
            <select
              aria-label="Switch workspace"
              value={workspaceId || ""}
              onChange={(e) => selectWorkspace(e.target.value)}
            >
              {workspaces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.ownerId === user?.id
                    ? item.name
                    : `${item.name} · ${item.owner?.username || "Shared"}`}
                </option>
              ))}
            </select>
          ) : (
            <span className="switcher-copy">
              <b>{workspace}</b>
              <small>Free workspace</small>
            </span>
          )}
          <button
            className="workspace-add"
            onClick={createWorkspace}
            aria-label="Create workspace"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="side-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick find"
          />
          <kbd>⌘ K</kbd>
        </div>
        <div className="side-section-label">
          WORKSPACE{" "}
          <button onClick={createPage} aria-label="Create page">
            <Plus size={14} />
          </button>
        </div>
        <nav className="page-nav">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveId(p.id);
                setTab("document");
              }}
              className={
                activeId === p.id ? "page-nav-item selected" : "page-nav-item"
              }
            >
              <FileText size={15} />
              <span>{p.title}</span>
            </button>
          ))}
          <button className="page-nav-item muted" onClick={createPage}>
            <Plus size={15} />
            New page
          </button>
        </nav>
        <div className="side-bottom">
          <button className="side-link">
            <CircleHelp size={16} /> Help & support
          </button>
          <button className="profile-card" onClick={onLogout}>
            <span className="profile-avatar">
              {initial(user?.username || user?.name)}
            </span>
            <span>
              <b>{user?.username || user?.name || "Guest user"}</b>
              <small>{user?.email || "Free plan"}</small>
            </span>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumbs">
            <span>{workspace}</span>
            <span className="crumb-slash">/</span>
            <span className="current-crumb">{activePage?.title || "Home"}</span>
          </div>
          <div className="top-actions">
            <div
              className="avatar-stack"
              title={`${presence.length} collaborators online`}
            >
              {presence.slice(0, 3).map((person) => (
                <span
                  key={person.name}
                  className="collab-avatar"
                  style={{ backgroundColor: person.color || "#7357e8" }}
                >
                  {initial(person.name)}
                </span>
              ))}
            </div>
            <span className="online-count">
              <i /> {presence.length} online
            </span>
            <button className="share-button" onClick={() => setShareOpen(true)}>
              <Share2 size={14} /> Share
            </button>
            <button className="icon-button" aria-label="Settings">
              <Settings2 size={17} />
            </button>
          </div>
        </header>
        {activePage ? (
          <div className="document-layout">
            <div className="document-main">
              <div className="document-heading">
                <div className="page-icon">✳</div>
                <input
                  className="document-title"
                  aria-label="Page title"
                  value={activePage.title}
                  readOnly={!["owner", "edit"].includes(workspaceRole)}
                  onChange={(e) => rename(activePage.id, e.target.value)}
                  onBlur={() => persistTitle(activePage.id)}
                />
                <button className="icon-button">
                  <MoreHorizontal size={19} />
                </button>
              </div>
              <div className="document-meta">
                <span>Edited just now</span>
                <span className="meta-dot">·</span>
                <span>
                  {workspaceRole === "owner"
                    ? "Workspace owner"
                    : `Can ${workspaceRole}`}
                </span>
              </div>
              <div className="doc-tabs">
                <button
                  onClick={() => setTab("document")}
                  className={tab === "document" ? "doc-tab active" : "doc-tab"}
                >
                  Document
                </button>
                <button
                  onClick={() => setTab("comments")}
                  className={tab === "comments" ? "doc-tab active" : "doc-tab"}
                >
                  Comments <span className="tab-count">{comments.length}</span>
                </button>
                <button
                  onClick={() => setTab("history")}
                  className={tab === "history" ? "doc-tab active" : "doc-tab"}
                >
                  History
                </button>
              </div>
              {tab === "document" ? (
                <section className="paper">
                  <CollaborativeEditor
                    page={activePage}
                    user={user}
                    token={token}
                    onPresence={setPresence}
                    editable={["owner", "edit"].includes(workspaceRole)}
                  />
                </section>
              ) : tab === "comments" ? (
                <section className="side-panel inline-panel">
                  <h2>Comments</h2>
                  <p className="panel-description">
                    Discuss this page with your team.
                  </p>
                  <div className="comments-list">
                    {comments.length ? (
                      comments.map((c) => (
                        <article className="comment-card" key={c.id}>
                          <span className="comment-avatar">
                            {initial(c.author || "Teammate")}
                          </span>
                          <div>
                            <b>{c.author || "Teammate"}</b>
                            <small>
                              {new Date(c.createdAt).toLocaleString()}
                            </small>
                            <p>{c.body}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">
                        <MessageCircle size={22} />
                        <b>Start a conversation</b>
                        <span>Leave the first comment on this page.</span>
                      </div>
                    )}
                  </div>
                  {["owner", "edit", "comment"].includes(workspaceRole) && (
                    <form className="comment-form" onSubmit={addComment}>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment…"
                      />
                      <button type="submit" disabled={!comment.trim()}>
                        Comment
                      </button>
                    </form>
                  )}
                </section>
              ) : (
                <section className="side-panel inline-panel">
                  <div className="history-heading">
                    <div>
                      <h2>Version history</h2>
                      <p className="panel-description">
                        Save and revisit important milestones.
                      </p>
                    </div>
                    {["owner", "edit"].includes(workspaceRole) && (
                      <button className="primary-small" onClick={saveSnapshot}>
                        <History size={14} /> Save snapshot
                      </button>
                    )}
                  </div>
                  {snapshots.length ? (
                    snapshots.map((s) => (
                      <article className="snapshot-row" key={s.id}>
                        <span className="snapshot-icon">
                          <Clock3 size={16} />
                        </span>
                        <div>
                          <b>{s.label}</b>
                          <small>
                            {s.author} ·{" "}
                            {new Date(s.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      <History size={22} />
                      <b>No snapshots yet</b>
                      <span>Create a named checkpoint for this document.</span>
                      {["owner", "edit"].includes(workspaceRole) && (
                        <button
                          className="primary-small"
                          onClick={saveSnapshot}
                        >
                          Save first snapshot
                        </button>
                      )}
                    </div>
                  )}
                </section>
              )}
              <div className="document-footnote">
                <Shield size={14} /> Your changes are encrypted in transit and
                synced as you type.
              </div>
            </div>
            <aside className="right-sidebar">
              <section className="right-card">
                <div className="right-card-title">
                  <span>LIVE COLLABORATION</span>
                  <Activity size={15} />
                </div>
                <div className="live-indicator">
                  <i />
                  <b>
                    {presence.length}{" "}
                    {presence.length === 1 ? "teammate" : "teammates"} here
                  </b>
                </div>
                <p>Changes from everyone appear instantly in this document.</p>
                {presence.map((person, index) => (
                  <div className="teammate-row" key={`${person.name}-${index}`}>
                    <span
                      className="collab-avatar"
                      style={{ backgroundColor: person.color || "#7357e8" }}
                    >
                      {initial(person.name)}
                    </span>
                    <span>
                      <b>{person.name}</b>
                      <small>Online now</small>
                    </span>
                    <i className="presence-dot" />
                  </div>
                ))}
              </section>
              <section className="right-card">
                <div className="right-card-title">
                  <span>PAGE ACCESS</span>
                  <Shield size={15} />
                </div>
                <div className="permission-label">
                  Your role
                  <select value={workspaceRole} disabled>
                    <option value="owner">Workspace owner</option>
                    <option value="edit">Can edit</option>
                    <option value="comment">Can comment</option>
                    <option value="view">Can view</option>
                  </select>
                </div>
                <p>
                  Workspace owner controls member roles when inviting teammates.
                </p>
              </section>
              <section className="hint-card">
                <span className="hint-sparkle">
                  <Sparkles size={15} />
                </span>
                <b>Made for momentum</b>
                <p>
                  One shared space for ideas, decisions, and work in progress.
                </p>
              </section>
            </aside>
          </div>
        ) : (
          <section className="home-view">
            <span className="eyebrow">
              <Sparkles size={14} /> YOUR TEAM WORKSPACE
            </span>
            <h1>
              Good work happens <span>together.</span>
            </h1>
            <p>Pick up where your team left off.</p>
            <div className="home-toolbar">
              <h2>
                Recent pages <span>{pages.length}</span>
              </h2>
              <button className="share-button" onClick={createPage}>
                <FilePlus2 size={15} /> New page
              </button>
            </div>
            <div className="page-grid">
              {pages.map((p, i) => (
                <button
                  className="page-card"
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                >
                  <div className={`card-cover cover-${i % 3}`}>
                    <FileText size={19} />
                    <span>{p.workspace}</span>
                  </div>
                  <div className="card-info">
                    <b>{p.title}</b>
                    <small>Edited {p.updatedAt}</small>
                    <div className="card-members">
                      <span className="collab-avatar avatar-two">MK</span>
                      <span className="collab-avatar avatar-three">AL</span>
                      <span>Shared with your team</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="project-brief">
              <div className="brief-icon">
                <Sparkles size={19} />
              </div>
              <div>
                <b>Built for real-time teamwork</b>
                <p>
                  Concurrent edits merge automatically, teammates stay visible,
                  and every important decision has a place.
                </p>
              </div>
              <span className="brief-tag">YJS POWERED</span>
            </div>
          </section>
        )}
        <footer className="app-footer">
          <span>
            <span className="footer-mark">✳</span> CollabSpace
          </span>
          <span>Real-time collaboration, made simple</span>
          <span>Project demo · Full-stack collaboration</span>
        </footer>
      </main>
      {shareOpen && (
        <div className="modal-backdrop" onClick={() => setShareOpen(false)}>
          <section className="share-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShareOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="modal-icon">
              <Share2 size={18} />
            </div>
            <h2>Share this workspace</h2>
            <p>Add a registered teammate with a workspace role.</p>
            <form onSubmit={invite}>
              <label className="invite-label">
                Invite by email
                <div>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    required
                  />
                  <button>Invite</button>
                </div>
              </label>
            </form>
            {inviteStatus && (
              <p className="invite-status" role="status">
                {inviteStatus}
              </p>
            )}
            <label className="invite-label">
              Workspace link
              <div>
                <input readOnly value={window.location.href} />
                <button type="button" onClick={share}>
                  {copied ? <Check size={15} /> : "Copy"}
                </button>
              </div>
            </label>
            <div className="modal-permission">
              <span>Invitee access</span>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="edit">Can edit</option>
                <option value="comment">Can comment</option>
                <option value="view">Can view</option>
              </select>
            </div>
            <div className="modal-note">
              <Shield size={14} /> Only the workspace owner can add members.
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

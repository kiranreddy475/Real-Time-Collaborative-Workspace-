
import { useMemo, useState } from "react";
import {
  Home,
  Search,
  Inbox,
  Plus,
  ChevronDown,
  FileText,
  Users,
  MessageSquare,
  Clock3,
  MoreHorizontal,
  ArrowUpRight,
  Settings,
  Sparkles,
  Command,
} from "lucide-react";

const initialPages = [
  {
    id: 1,
    title: "Project Plan",
    workspace: "Design Team",
    edited: "2 minutes ago",
    icon: "📋",
    cover: "bg-violet-100",
    accent: "text-violet-600 bg-violet-50",
    members: ["SC", "DP", "LW"],
  },
  {
    id: 2,
    title: "Product Roadmap",
    workspace: "Product",
    edited: "1 hour ago",
    icon: "🚀",
    cover: "bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-400",
    accent: "text-blue-600 bg-blue-50",
    members: ["DP", "SC"],
  },
  {
    id: 3,
    title: "Meeting Notes",
    workspace: "Personal",
    edited: "3 hours ago",
    icon: "📝",
    cover: "bg-gradient-to-br from-orange-100 to-rose-200",
    accent: "text-orange-600 bg-orange-50",
    members: ["LW", "JM", "SC"],
  },
  {
    id: 4,
    title: "Marketing Ideas",
    workspace: "Marketing",
    edited: "5 hours ago",
    icon: "💡",
    cover: "bg-gradient-to-br from-emerald-100 to-teal-200",
    accent: "text-emerald-600 bg-emerald-50",
    members: ["JM", "DP"],
  },
];

const workspaces = [
  { name: "Personal", icon: "◈", color: "bg-violet-100 text-violet-600" },
  { name: "Design Team", icon: "✳", color: "bg-blue-100 text-blue-600" },
  { name: "Product", icon: "◉", color: "bg-orange-100 text-orange-600" },
  { name: "Marketing", icon: "◇", color: "bg-emerald-100 text-emerald-600" },
];

const people = [
  { name: "Sarah Kim", initials: "SK", color: "bg-pink-100 text-pink-700", task: "Editing Project Plan" },
  { name: "David Park", initials: "DP", color: "bg-blue-100 text-blue-700", task: "Editing Product Roadmap" },
  { name: "Lisa Wong", initials: "LW", color: "bg-emerald-100 text-emerald-700", task: "Viewing Meeting Notes" },
];

const stats = [
  { label: "Total pages", value: "12", note: "Across your workspaces", icon: FileText, color: "bg-violet-100 text-violet-600" },
  { label: "Collaborators", value: "5", note: "People in your workspace", icon: Users, color: "bg-emerald-100 text-emerald-600" },
  { label: "Comments", value: "8", note: "Across recent documents", icon: MessageSquare, color: "bg-orange-100 text-orange-600" },
  { label: "Recent edits", value: "3", note: "In the last hour", icon: Clock3, color: "bg-pink-100 text-pink-600" },
];

function Dashboard() {
  const [pages, setPages] = useState(initialPages);
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Home");
  const [activeWorkspace, setActiveWorkspace] = useState("All workspaces");
  const [selectedPage, setSelectedPage] = useState(null);
  const [showInbox, setShowInbox] = useState(false);

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesQuery =
        `${page.title} ${page.workspace}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesWorkspace =
        activeWorkspace === "All workspaces" ||
        page.workspace === activeWorkspace;

      const matchesShared =
        activeNav !== "Shared with me" ||
        page.workspace !== "Personal";

      return matchesQuery && matchesWorkspace && matchesShared;
    });
  }, [pages, query, activeWorkspace, activeNav]);

  function createPage() {
    const page = {
      id: Date.now(),
      title: "Untitled",
      workspace: activeWorkspace === "All workspaces" ? "Personal" : activeWorkspace,
      edited: "Just now",
      icon: "📄",
      cover: "bg-violet-100",
      accent: "text-violet-600 bg-violet-50",
      members: ["AC"],
    };

    setPages((current) => [page, ...current]);
    setSelectedPage(page);
  }

  function renamePage(id, title) {
    setPages((current) =>
      current.map((page) => page.id === id ? { ...page, title } : page)
    );
  }

  const navItem = (label, Icon, onClick, active = false, suffix = null) => (
    <button
      key={label}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-violet-50 font-semibold text-violet-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <Icon size={18} />
      <span className="flex-1 text-left">{label}</span>
      {suffix}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 md:grid md:grid-cols-[245px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="flex min-h-screen flex-col border-r border-slate-200/80 bg-white px-4 py-6">
        <button
          onClick={() => {
            setActiveNav("Home");
            setSelectedPage(null);
          }}
          className="mb-9 flex items-center gap-3 px-2 text-left"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
            <Command size={21} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">CollabSpace</span>
        </button>

        <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
          WORKSPACE
        </p>

        <nav className="space-y-1">
          {navItem("Home", Home, () => {
            setActiveNav("Home");
            setSelectedPage(null);
          }, activeNav === "Home")}

          {navItem("Search", Search, () => {
            setActiveNav("Search");
            document.querySelector('input[aria-label="Search pages"]')?.focus();
          }, activeNav === "Search")}

          {navItem("Shared with me", Users, () => {
            setActiveNav("Shared with me");
            setActiveWorkspace("All workspaces");
            setSelectedPage(null);
          }, activeNav === "Shared with me")}

          {navItem("Inbox", Inbox, () => setShowInbox(!showInbox), false,
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">3</span>
          )}
        </nav>

        {showInbox && (
          <div className="my-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Recent notifications</p>
            <p className="mt-2">Sarah commented on Project Plan.</p>
            <p className="mt-2">David shared Product Roadmap.</p>
            <p className="mt-2">Lisa mentioned you in Meeting Notes.</p>
          </div>
        )}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
              YOUR WORKSPACES
            </p>
            <button
              title="Create workspace"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
              onClick={() => window.alert("Workspace creation will be connected to the API next.")}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.name}
                onClick={() => {
                  setActiveWorkspace(workspace.name);
                  setActiveNav("Home");
                  setSelectedPage(null);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  activeWorkspace === workspace.name
                    ? "bg-violet-50 font-medium text-violet-700"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${workspace.color}`}>
                  {workspace.icon}
                </span>
                <span>{workspace.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => window.alert("Workspace creation will be connected to the API next.")}
            className="mt-3 flex items-center gap-2 px-3 py-2 text-xs text-slate-400 transition hover:text-violet-600"
          >
            <Plus size={16} /> Create workspace
          </button>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          {navItem("Settings", Settings, () => setActiveNav("Settings"), activeNav === "Settings")}

          <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-slate-50">
            <span className="grid size-10 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              AC
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Alex Chen</span>
              <span className="block truncate text-xs text-slate-400">alex@example.com</span>
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="min-w-0 px-5 pb-12 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">
              {selectedPage?.title || activeNav}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-400 sm:w-64 sm:flex-none">
              <Search size={17} />
              <input
                aria-label="Search pages"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages..."
                className="w-full min-w-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              onClick={createPage}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <Plus size={16} /> New page
            </button>
          </div>
        </header>

        {selectedPage ? (
          <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <button
              onClick={() => setSelectedPage(null)}
              className="text-xs font-medium text-violet-600 hover:text-violet-800"
            >
              ← Back to dashboard
            </button>

            <div className="mt-8 flex items-center gap-4">
              <span className={`grid size-12 place-items-center rounded-xl text-xl ${selectedPage.accent}`}>
                {selectedPage.icon}
              </span>
              <input
                value={selectedPage.title}
                onChange={(event) => {
                  const title = event.target.value;
                  renamePage(selectedPage.id, title);
                  setSelectedPage((current) => ({ ...current, title }));
                }}
                className="min-w-0 flex-1 border-0 text-2xl font-bold tracking-tight outline-none sm:text-3xl"
                aria-label="Page title"
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {selectedPage.workspace} · Edited {selectedPage.edited}
            </p>

            <div className="mt-10 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-5 py-16 text-center">
              <Sparkles className="mx-auto text-violet-500" size={28} />
              <h2 className="mt-4 text-lg font-semibold">Your document starts here</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                This is a placeholder for your TipTap editor. We'll add live collaborative editing next.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-col justify-between gap-5 py-9 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-violet-600">
                  <Sparkles size={14} /> YOUR CREATIVE WORKSPACE
                </span>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Good morning, Alex <span>👋</span>
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Here's what's happening in your workspace today.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500">
                <Clock3 size={15} /> Your workspace, in sync
              </span>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, note, icon: Icon, color }) => (
                <article key={label} className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/20 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
                    <Icon size={21} />
                  </div>
                  <div>
                    <strong className="text-2xl font-extrabold tracking-tight text-slate-900">
                      {label === "Total pages" ? pages.length : value}
                    </strong>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{label}</p>
                    <p className="mt-2 text-[10px] text-slate-400">{note}</p>
                  </div>
                </article>
              ))}
            </section>

            {/* Recent pages */}
            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Recent pages</h2>
                  <p className="mt-1 text-xs text-slate-400">Your team's work, all in one place.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveWorkspace("All workspaces");
                    setActiveNav("Home");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
                >
                  View all <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
                {["All workspaces", ...workspaces.map((workspace) => workspace.name)].map((name) => (
                  <button
                    key={name}
                    onClick={() => setActiveWorkspace(name)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs transition ${
                      activeWorkspace === name
                        ? "bg-violet-100 font-semibold text-violet-700"
                        : "text-slate-500 hover:bg-white"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {filteredPages.length ? (
                <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredPages.map((page) => (
                    <article
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className="group min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/20 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
                    >
                      <div className={`relative flex h-28 items-end bg-cover bg-center p-3 ${page.cover}`}>
                        <span className={`grid size-9 place-items-center rounded-xl border-2 border-white bg-white text-base shadow-sm ${page.accent}`}>
                          {page.icon}
                        </span>
                        <button
                          aria-label={`Rename ${page.title}`}
                          title="Rename page"
                          onClick={(event) => {
                            event.stopPropagation();
                            const title = window.prompt("Rename page", page.title);
                            if (title?.trim()) renamePage(page.id, title.trim());
                          }}
                          className="absolute right-3 top-3 rounded-lg border border-white/70 bg-white/90 p-1.5 text-slate-500 opacity-0 transition hover:text-violet-600 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-slate-800">{page.title}</h3>
                          <ArrowUpRight size={14} className="shrink-0 text-slate-300 transition group-hover:text-violet-600" />
                        </div>

                        <p className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                          <span className={`size-2 rounded-full ${page.accent.split(" ")[1].replace("bg-", "bg-")}`} />
                          {page.workspace}
                        </p>

                        <p className="mt-2 text-[10px] text-slate-400">Edited {page.edited}</p>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex -space-x-2">
                            {page.members.map((member, index) => (
                              <span
                                key={`${member}-${index}`}
                                className={`grid size-7 place-items-center rounded-full border-2 border-white text-[9px] font-bold ${
                                  ["bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-pink-100 text-pink-700"][index % 3]
                                }`}
                              >
                                {member}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <Users size={12} /> Shared
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Search className="mx-auto text-slate-400" size={26} />
                  <h3 className="mt-3 font-semibold">No pages found</h3>
                  <p className="mt-1 text-sm text-slate-500">Try a different search or create a new page.</p>
                  <button onClick={createPage} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white">
                    <Plus size={15} className="mr-1 inline" /> Create page
                  </button>
                </div>
              )}
            </section>

            {/* Collaborators and tip */}
            <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900">Active collaborators</h2>
                    <p className="mt-1 text-xs text-slate-400">Who's working with you</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700">
                    ● Demo data
                  </span>
                </div>

                <div className="mt-5 space-y-5">
                  {people.map((person) => (
                    <div key={person.name} className="flex items-center gap-3">
                      <span className={`relative grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold ${person.color}`}>
                        {person.initials}
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-400" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">{person.name}</p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">{person.task}</p>
                      </div>
                      <span className="text-[10px] text-emerald-600">Online</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-linear-to-br from-white via-violet-50/60 to-indigo-50 p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-600">
                  <Sparkles size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
                  Good things happen together.
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Invite teammates to collaborate on pages, share ideas, and keep every project moving forward.
                </p>
                <button
                  onClick={() => window.alert("Team invitations will be implemented with the backend.")}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-800"
                >
                  Explore collaboration <ArrowUpRight size={15} />
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

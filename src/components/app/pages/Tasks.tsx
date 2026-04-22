import * as React from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useI18n } from "@/contexts/AppProviders";
import { toast } from "sonner";
import {
  TaskFormDialog,
  type TaskCreateRequest,
  type TaskUpdateRequest,
  type TaskResponse,
  type Priority,
  type Status,
} from "@/components/app/TaskFormDialog";

const STORAGE_KEY = "sc-tasks";

const PRIORITY_STYLE: Record<Priority, { color: string; bg: string; label: string; emoji: string }> = {
  CRITICAL: { color: "var(--danger)", bg: "color-mix(in oklab, var(--danger) 12%, transparent)", label: "Critique", emoji: "🔴" },
  HIGH:     { color: "var(--warning)", bg: "color-mix(in oklab, var(--warning) 14%, transparent)", label: "Haute", emoji: "🟡" },
  MEDIUM:   { color: "var(--brand)", bg: "var(--brand-light)", label: "Moyenne", emoji: "🔵" },
  LOW:      { color: "var(--success)", bg: "color-mix(in oklab, var(--success) 12%, transparent)", label: "Basse", emoji: "🟢" },
};

function seedTasks(): TaskResponse[] {
  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
  return [
    { id: crypto.randomUUID(), studentId: "local", title: "Examen BDD", description: "Révision chapitres 1–6", priority: "CRITICAL", deadline: inDays(1), duration: 120, difficulty: 4, category: "Examen", status: "IN_PROGRESS", tags: ["examen"], createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: crypto.randomUUID(), studentId: "local", title: "Projet React UI", description: "Maquettes + prototype", priority: "HIGH", deadline: inDays(3), duration: 180, difficulty: 3, category: "Projet", status: "TODO", tags: [], createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: crypto.randomUUID(), studentId: "local", title: "Lecture article ML", description: "Attention is all you need", priority: "MEDIUM", deadline: inDays(7), duration: 60, difficulty: 2, category: "Lecture", status: "TODO", tags: [], createdAt: now.toISOString(), updatedAt: now.toISOString() },
  ];
}

function loadTasks(): TaskResponse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as TaskResponse[];
  } catch {
    return [];
  }
}

function saveTasks(list: TaskResponse[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function Tasks() {
  const { t } = useI18n();
  const [tasks, setTasks] = React.useState<TaskResponse[]>([]);
  const [filter, setFilter] = React.useState<"all" | Status>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskResponse | null>(null);

  React.useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const counts = React.useMemo(
    () => ({
      all: tasks.length,
      TODO: tasks.filter((x) => x.status === "TODO").length,
      IN_PROGRESS: tasks.filter((x) => x.status === "IN_PROGRESS").length,
      DONE: tasks.filter((x) => x.status === "DONE").length,
    }),
    [tasks],
  );

  const list = filter === "all" ? tasks : tasks.filter((x) => x.status === filter);

  const tabs: { key: typeof filter; label: string; n: number }[] = [
    { key: "all", label: t("tasks.all"), n: counts.all },
    { key: "TODO", label: "À faire", n: counts.TODO },
    { key: "IN_PROGRESS", label: t("tasks.inprogress"), n: counts.IN_PROGRESS },
    { key: "DONE", label: t("tasks.done"), n: counts.DONE },
  ];

  function handleCreate(payload: TaskCreateRequest | TaskUpdateRequest) {
    const p = payload as TaskCreateRequest;
    const now = new Date().toISOString();
    const newTask: TaskResponse = {
      id: crypto.randomUUID(),
      studentId: p.studentId,
      title: p.title,
      description: p.description,
      priority: p.priority,
      deadline: p.deadline,
      duration: p.duration,
      difficulty: p.difficulty,
      category: p.category,
      status: p.status ?? "TODO",
      tags: p.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const next = [newTask, ...tasks];
    setTasks(next);
    saveTasks(next);
  }

  function handleUpdate(id: string, payload: TaskCreateRequest | TaskUpdateRequest) {
    const u = payload as TaskUpdateRequest;
    const next = tasks.map((task) =>
      task.id === id ? { ...task, ...u, updatedAt: new Date().toISOString() } as TaskResponse : task,
    );
    setTasks(next);
    saveTasks(next);
  }

  function handleDelete(id: string) {
    const next = tasks.filter((task) => task.id !== id);
    setTasks(next);
    saveTasks(next);
    toast.success("Tâche supprimée");
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(task: TaskResponse) {
    setEditing(task);
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-extrabold">{t("tasks.title")} ✅</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} /> {t("tasks.add")}
        </button>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={
                "rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors " +
                (active ? "bg-brand text-white" : "text-muted-foreground hover:bg-brand-light hover:text-brand")
              }
            >
              {tab.label} ({tab.n})
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-2 p-10 text-center">
          <div className="mb-2 text-3xl">📭</div>
          <div className="text-sm font-semibold text-foreground">Aucune tâche</div>
          <div className="text-xs text-muted-foreground">Créez votre première tâche pour commencer.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((task) => {
            const s = PRIORITY_STYLE[task.priority];
            const done = task.status === "DONE";
            const overdue = !done && new Date(task.deadline).getTime() < Date.now();
            return (
              <div
                key={task.id}
                className={
                  "group relative rounded-2xl bg-surface-2 p-4 shadow-[0_4px_24px_rgba(79,110,247,.08)] " +
                  (done ? "opacity-70" : "")
                }
                style={{ borderInlineStart: `4px solid ${s.color}` }}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.emoji} {s.label}
                  </span>
                  <span className={"text-[11px] " + (overdue ? "font-bold text-[var(--danger)]" : "text-muted-foreground")}>
                    {overdue ? "⚠ En retard · " : ""}
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className={"mb-1 text-sm font-bold " + (done ? "text-muted-foreground line-through" : "")}>
                  {task.title}
                </div>
                {task.description && <div className="mb-2 text-xs text-muted-foreground">{task.description}</div>}
                <div className="mb-3 flex flex-wrap gap-1">
                  <Chip>{task.category}</Chip>
                  <Chip>⏱ {task.duration} min</Chip>
                  <Chip>🧠 {task.difficulty}/5</Chip>
                  {task.tags?.map((tag) => <Chip key={tag}>#{tag}</Chip>)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {task.status}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(task)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-brand-light hover:text-brand"
                      aria-label="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] hover:text-[var(--danger)]"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "create"}
        initial={editing ?? undefined}
        onClose={() => setDialogOpen(false)}
        onSubmit={(payload) => {
          if (editing) handleUpdate(editing.id, payload);
          else handleCreate(payload);
        }}
      />
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

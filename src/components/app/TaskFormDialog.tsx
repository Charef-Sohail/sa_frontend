import * as React from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useI18n } from "@/contexts/AppProviders";
import { Priority as ApiPriority, TaskRequest as ApiTaskRequest, TaskResponse as ApiTaskResponse, TaskStatus as ApiTaskStatus, auth } from "@/lib/api";

/* ---------- Types centralisés (api) ---------- */
export type Priority = ApiPriority;
export type Status = ApiTaskStatus;
export type TaskCreateRequest = ApiTaskRequest & { deadline: string; duration: number; difficulty: number; category: string };
export type TaskUpdateRequest = Partial<TaskCreateRequest>;
export type TaskResponse = ApiTaskResponse;

/* ---------- Validation Zod (côté front) ---------- */
const baseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit faire au moins 3 caractères")
    .max(100, "Le titre doit faire moins de 100 caractères"),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  deadline: z
    .string()
    .min(1, "La deadline est requise")
    .refine((v) => new Date(v).getTime() > Date.now(), "La deadline doit être dans le futur"),
  duration: z.coerce.number().int().min(1, "La durée doit être > 0").max(24 * 60),
  difficulty: z.coerce.number().int().min(1).max(5),
  category: z.string().trim().min(1, "La catégorie est requise").max(50),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"]).optional(),
  tags: z.array(z.string().trim().max(30)).optional(),
});

/* ---------- Composant ---------- */
type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<TaskResponse>;
  onClose: () => void;
  onSubmit: (payload: TaskCreateRequest | TaskUpdateRequest) => void;
};

const PRIORITY_OPTIONS: { v: Priority; label: string; color: string }[] = [
  { v: "LOW", label: "Basse", color: "var(--success)" },
  { v: "MEDIUM", label: "Moyenne", color: "var(--brand)" },
  { v: "HIGH", label: "Haute", color: "var(--warning)" },
  { v: "CRITICAL", label: "Critique", color: "var(--danger)" },
];

const STATUS_OPTIONS: Status[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"];
const CATEGORY_OPTIONS = ["Étude", "Examen", "Projet", "Lecture", "Sport", "Personnel", "Autre"];

function toLocalInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date(Date.now() + 24 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskFormDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const { t } = useI18n();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("MEDIUM");
  const [deadline, setDeadline] = React.useState(toLocalInput());
  const [duration, setDuration] = React.useState<number>(60);
  const [difficulty, setDifficulty] = React.useState<number>(3);
  const [category, setCategory] = React.useState<string>("Étude");
  const [status, setStatus] = React.useState<Status>("TODO");
  const [tagsInput, setTagsInput] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    setErrors({});
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority((initial?.priority as Priority) ?? "MEDIUM");
    setDeadline(toLocalInput(initial?.deadline));
    setDuration(initial?.duration ?? 60);
    setDifficulty(initial?.difficulty ?? 3);
    setCategory(initial?.category ?? "Étude");
    setStatus((initial?.status as Status) ?? "TODO");
    setTagsInput((initial?.tags ?? []).join(", "));
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const raw = {
      title,
      description: description || undefined,
      priority,
      deadline: new Date(deadline).toISOString(),
      duration,
      difficulty,
      category,
      status,
      tags: tags.length ? tags : undefined,
    };

    const parsed = baseSchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    if (mode === "create") {
      const payload: TaskCreateRequest = {
        studentId: auth.getUser()?.id ?? undefined,
        ...parsed.data,
      };
      onSubmit(payload);
      toast.success(t("toast.task.added"));
    } else {
      const payload: TaskUpdateRequest = parsed.data;
      onSubmit(payload);
      toast.success("Tâche modifiée ✏️");
    }
    onClose();
  }

  const titleText = mode === "create" ? "Nouvelle tâche" : "Modifier la tâche";

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-3xl bg-surface-2 p-6 shadow-[0_20px_60px_rgba(0,0,0,.3)] sm:rounded-3xl sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-brand-light hover:text-brand"
        >
          <X size={16} />
        </button>

        <h2 className="mb-1 font-display text-2xl font-extrabold">{titleText}</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {mode === "create"
            ? "Renseignez les détails — l'IA optimisera votre planning."
            : "Mettez à jour les champs souhaités."}
        </p>

        {/* Title */}
        <Field label="Titre *" error={errors.title}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Ex : Révision Algèbre linéaire"
            className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
          />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Détails, objectifs, ressources..."
            className="w-full resize-none rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
          />
        </Field>

        {/* Priority */}
        <Field label="Priorité *" error={errors.priority}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITY_OPTIONS.map((p) => {
              const active = priority === p.v;
              return (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => setPriority(p.v)}
                  className={
                    "rounded-xl border-[1.5px] px-3 py-2 text-xs font-semibold transition-all " +
                    (active ? "text-white" : "border-border bg-surface-2 text-foreground hover:bg-brand-light")
                  }
                  style={active ? { background: p.color, borderColor: p.color } : undefined}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Deadline */}
          <Field label="Deadline *" error={errors.deadline}>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
            />
          </Field>

          {/* Category */}
          <Field label="Catégorie *" error={errors.category}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          {/* Duration */}
          <Field label={`Durée : ${duration} min`} error={errors.duration}>
            <input
              type="range"
              min={15}
              max={480}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-[var(--brand)]"
            />
          </Field>

          {/* Difficulty */}
          <Field label={`Difficulté : ${difficulty}/5`} error={errors.difficulty}>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDifficulty(n)}
                  className={
                    "h-9 flex-1 rounded-lg border-[1.5px] text-sm font-semibold transition-all " +
                    (difficulty >= n
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface-2 text-muted-foreground hover:bg-brand-light")
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Status (edit only) */}
        {mode === "edit" && (
          <Field label="Statut" error={errors.status}>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={
                    "rounded-lg border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all " +
                    (status === s
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface-2 text-foreground hover:bg-brand-light")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Tags */}
        <Field label="Tags (séparés par virgules)" error={errors.tags}>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="examen, urgent, groupe"
            className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
          />
        </Field>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-brand-light"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {mode === "create" ? "Créer la tâche" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label>
      {children}
      {error && <div className="mt-1 text-[11px] font-medium text-[var(--danger)]">{error}</div>}
    </div>
  );
}

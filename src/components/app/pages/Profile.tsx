import * as React from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { profileApi, tryApi, isAuthenticated, auth } from "@/lib/api";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  birthYear: string;
  school: string;
  avatar: string; // dataURL
};

const KEY = "sc-profile";

function loadProfile(): ProfileData {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  return defaults();
}
function defaults(): ProfileData {
  return {
    firstName: "Ahmed",
    lastName: "Karimi",
    email: "ahmed@enset.ma",
    age: "22",
    birthYear: "",
    school: "ENSET",
    avatar: "",
  };
}

export function Profile() {
  const [data, setData] = React.useState<ProfileData>(defaults);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setData(loadProfile());
    if (isAuthenticated()) {
      tryApi<any>(profileApi.get()).then((p) => {
        if (p) setData((d) => ({
          ...d,
          firstName: p.firstName ?? d.firstName,
          lastName: p.lastName ?? d.lastName,
          email: p.email ?? d.email,
          school: p.university ?? d.school,
          age: p.baselineEnergy ? String(p.baselineEnergy) : d.age,
          birthYear: p.birthDate ? String(new Date(p.birthDate).getFullYear()) : d.birthYear,
          avatar: p.avatar ?? d.avatar,
        }));
      });
    }
  }, []);

  function set<K extends keyof ProfileData>(k: K, v: ProfileData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => set("avatar", String(reader.result));
    reader.readAsDataURL(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    // Basic frontend validation
    if (!data.firstName || !data.lastName) { toast.error("Prénom et nom requis"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { toast.error("Email invalide"); return; }
    localStorage.setItem(KEY, JSON.stringify(data));
    if (isAuthenticated()) {
      const payload: Record<string, any> = {
        studentId: auth.getUser()?.id,
        baselineEnergy: Number(data.age) || undefined,
        birthDate: data.birthYear ? `${data.birthYear}-01-01` : undefined,
        university: data.school || undefined,
        avatar: data.avatar || undefined,
      };
      try {
        await profileApi.update(payload);
      } catch (err: any) {
        toast.error("Échec de la mise à jour du profil");
        return;
      }
    }
    toast.success("Profil mis à jour ✅");
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-[22px] font-extrabold">Mon profil 👤</h1>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles.</p>
      </div>

      <form onSubmit={save} className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl bg-surface-2 p-5 text-center shadow-[0_4px_24px_rgba(79,110,247,.08)]">
          <div className="relative mx-auto h-32 w-32">
            <div
              className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-success text-3xl font-bold text-white"
              style={data.avatar ? { background: `url(${data.avatar}) center/cover` } : {}}
            >
              {!data.avatar && (data.firstName[0] ?? "?")}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-md hover:bg-brand-dark"
              aria-label="Changer la photo"
            >
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </div>
          <div className="mt-3 font-display text-base font-extrabold">
            {data.firstName} {data.lastName}
          </div>
          <div className="text-xs text-muted-foreground">{data.school}</div>
        </div>

        <div className="rounded-2xl bg-surface-2 p-5 shadow-[0_4px_24px_rgba(79,110,247,.08)]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Prénom" value={data.firstName} onChange={(v) => set("firstName", v)} />
            <Field label="Nom" value={data.lastName} onChange={(v) => set("lastName", v)} />
            <Field label="Email" type="email" value={data.email} onChange={(v) => set("email", v)} />
            <Field label="Âge" type="number" value={data.age} onChange={(v) => set("age", v)} />
            <Field label="Année de naissance" type="number" value={data.birthYear} onChange={(v) => set("birthYear", v)} />
            <Field label="Établissement" value={data.school} onChange={(v) => set("school", v)} />
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Enregistrer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-[1.5px] border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
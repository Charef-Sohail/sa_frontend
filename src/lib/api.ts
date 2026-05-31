// Backend Spring Boot client (JWT Bearer, STATELESS)
// Base URL configurable via VITE_API_BASE_URL.

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? "http://54.205.124.94:8080/api";
const SANITIZED_BASE_URL = BASE_URL;

if (import.meta.env.DEV) {
  console.log("[api] VITE_API_BASE_URL =", BASE_URL);
}

const TOKEN_KEY = "token";
const SESSION_TOKEN_KEY = "token_session";
const USER_KEY = "sc-user";
const ROLE_KEY = "sc-role";
const GOOGLE_AUTH_URL = import.meta.env.VITE_API_GOOGLE_AUTH_URL?.trim() || null;

export const API_BASE_URL = SANITIZED_BASE_URL;

function decodeJwt(token: string) {
  if (typeof window === "undefined" || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getTokenPayload(token?: string) {
  const t = token ?? auth.getToken();
  return decodeJwt(t ?? "") as any;
}

function isTokenExpired(token?: string) {
  const payload = getTokenPayload(token);
  if (!payload) return true;
  const exp = typeof payload.exp === "number" ? payload.exp : payload.exp ? Number(payload.exp) : NaN;
  if (!exp) return true;
  // exp is in seconds since epoch
  return Date.now() / 1000 >= exp;
}

export function isTokenValid(token?: string) {
  const t = token ?? auth.getToken();
  if (!t) return false;
  const payload = decodeJwt(t);
  if (!payload) return false;
  const exp = typeof payload.exp === "number" ? payload.exp : payload.exp ? Number(payload.exp) : NaN;
  if (!exp) return true;
  return Date.now() / 1000 < exp;
}

type RequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

const axiosInstance = axios.create({
  baseURL: SANITIZED_BASE_URL,
  headers: { Accept: "application/json" },
  timeout: 10000,
});

// Normalize common headers
axiosInstance.defaults.headers.common = axiosInstance.defaults.headers.common || {};
axiosInstance.defaults.headers.common.Accept = "application/json";

axiosInstance.interceptors.request.use((config: any) => {
  if (config?.skipAuth) {
    return config;
  }
  const token = auth.getToken();
  try {
    // Avoid sending expired tokens
    if (token && !isTokenExpired(token)) {
      if (import.meta.env.DEV) {
        try { console.debug("[api] Attaching Authorization header (has token)"); } catch {}
      }
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else if (token) {
      auth.clear();
    }
  } catch {
    // noop
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    if (status === 401 || status === 403) {
      // Log full response for debugging before clearing session/redirecting
      if (typeof window !== "undefined") {
        try { console.error("[api] auth error", axiosError.response?.status, axiosError.response?.data); } catch {}
        try {
          const { toast } = await import("sonner");
          toast.error(status === 401 ? "Session expirée. Veuillez vous reconnecter." : "Accès refusé.");
        } catch {}
        // In development, keep the session and avoid redirect so the error does not disappear
        // (this helps debugging: the console/network entry and toast remain visible).
        if (!import.meta.env.DEV) {
          // Production: keep previous behaviour (short delay then clear+redirect)
          setTimeout(() => {
            try { auth.clear(); } catch {}
            try { window.location.replace("/login"); } catch {}
          }, 1500);
        } else {
          try { console.warn("[api] DEV mode — not clearing auth or redirecting to allow inspection."); } catch {}
        }
      } else {
        auth.clear();
      }
    }
    return Promise.reject(error);
  },
);

/* ========= ENUMS / TYPES ========= */
export type Role = "ROLE_ADMIN" | "ROLE_STUDENT";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
// Backend canonical: IN_PROGRESS | COMPLETED | CANCELLED
// Widened to keep frontend's TODO/DONE/REVIEW working (mapped at the wire).
export type TaskStatus =
  | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "CANCELLED" | "COMPLETED";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role | string;
  age?: number;
  university?: string;
};

/* ========= AUTH STORAGE ========= */
export const auth = {
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(SESSION_TOKEN_KEY);
  },
  setToken: (t: string, remember = true) => {
    if (typeof window === "undefined") return;
    if (remember) {
      localStorage.setItem(TOKEN_KEY, t);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } else {
      sessionStorage.setItem(SESSION_TOKEN_KEY, t);
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
      return JSON.parse(raw ?? "null");
    } catch {
      return null;
    }
  },
  setUser: (u: AuthUser, remember = true) => {
    if (typeof window === "undefined") return;
    const storage = remember ? localStorage : sessionStorage;
    const remove = remember ? sessionStorage : localStorage;
    storage.setItem(USER_KEY, JSON.stringify(u));
    remove.removeItem(USER_KEY);
  },
  getRole: (): Role | null => {
    if (typeof window === "undefined") return null;
    const stored = (localStorage.getItem(ROLE_KEY) ?? sessionStorage.getItem(ROLE_KEY)) as Role | null;
    if (stored) return stored;
    const payload = getTokenPayload();
    // Try common JWT claim names: role, roles, authorities
    if (!payload) return null;
    if (payload.role) return payload.role as Role;
    if (Array.isArray(payload.roles) && payload.roles.length) return payload.roles[0] as Role;
    if (Array.isArray(payload.authorities) && payload.authorities.length) return payload.authorities[0] as Role;
    return null;
  },
  setRole: (r: Role | string, remember = true) => {
    if (typeof window === "undefined") return;
    const storage = remember ? localStorage : sessionStorage;
    const remove = remember ? sessionStorage : localStorage;
    storage.setItem(ROLE_KEY, r);
    remove.removeItem(ROLE_KEY);
  },
  isAdmin: () => {
    const r = auth.getRole() as string | null;
    return r === "ROLE_ADMIN" || r === "ADMIN" || r === "ADMINISTRATOR";
  },
  logout: () => auth.clear(),
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};

export const isAuthenticated = () => !!auth.getToken();

/* ========= REQUEST CORE (interceptor) ========= */
async function request<T = any>(
  path: string,
  opts: RequestInit & { json?: unknown; form?: FormData; skipAuth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json", ...(opts.headers as any) };
  if (!opts.skipAuth) {
    const token = auth.getToken();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
  }
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const data = opts.json !== undefined ? opts.json : opts.form;

  try {
    const response = await axiosInstance.request<T>({
      url: path,
      method: opts.method ?? "GET",
      headers,
      data,
      skipAuth: opts.skipAuth,
    } as RequestConfig);
    return response.data as T;
  } catch (e: any) {
    if (axios.isAxiosError(e)) {
      let responseData: any = e.response?.data;
      // unwrap common wrappers { data: { ... } }
      if (responseData && typeof responseData === "object" && responseData.data) responseData = responseData.data;
      const msg =
        typeof responseData === "string"
          ? responseData
          : responseData?.message || responseData?.error || (responseData?.errors ? JSON.stringify(responseData.errors) : null) || e.response?.statusText || e.message;
      
      // Dev: log full request/response for debugging
      if (import.meta.env.DEV) {
        try {
          const wwwAuth = e.response?.headers?.["www-authenticate"] || e.response?.headers?.["WWW-Authenticate"];
          console.error("[api] Full error response:", {
            status: e.response?.status,
            statusText: e.response?.statusText,
            url: e.config?.url,
            method: e.config?.method,
            requestHeaders: e.config?.headers,
            requestBody: e.config?.data,
            responseHeaders: e.response?.headers,
            wwwAuthenticate: wwwAuth,
            responseBody: e.response?.data,
          });
        } catch {}
      }
      
      if (typeof window !== "undefined") {
        try { toast.error(msg ?? "Erreur API"); } catch {}
      }
      throw new Error(`${e.response?.status ?? ""} ${msg}`.trim());
    }
    if (typeof window !== "undefined") {
      try { toast.error("Erreur réseau"); } catch {}
    }
    throw new Error(`network: ${e?.message ?? "offline"}`);
  }
}

export async function tryApi<T>(p: Promise<T>): Promise<T | null> {
  try { return await p; } catch (e: any) {
    // eslint-disable-next-line no-console
    console.warn("[api]", e?.message ?? e);
    return null;
  }
}

/* ========= AUTH ========= */
export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  id: string; token: string; email: string; role: string;
  name: string; age?: number; university?: string;
};
export type RegisterRequest = {
  name: string; email: string; password: string;
  age?: number; birthDate?: string; university?: string;
};
export type RegisterResponse = LoginResponse;

function getAuthToken(res: any) {
  return (
    res?.token || res?.accessToken || res?.access_token || res?.jwt || res?.idToken || res?.authToken ||
    res?.data?.token || res?.data?.accessToken || res?.data?.access_token || null
  );
}
function getAuthRole(res: any) {
  if (!res) return null;
  if (res.role) return res.role;
  if (Array.isArray(res.roles) && res.roles.length) return res.roles[0];
  if (Array.isArray(res.authorities) && res.authorities.length) return res.authorities[0];
  return null;
}
function persistAuth(res: LoginResponse | RegisterResponse, remember = true) {
  if (!res) return;
  const token = getAuthToken(res);
  const role = getAuthRole(res);
  if (import.meta.env.DEV) {
    try { console.debug("[api] persistAuth response:", res, "extracted token:", token, "role:", role); } catch {}
  }
  if (token) auth.setToken(token, remember);
  if (role) auth.setRole(role, remember);
  auth.setUser({
    id: res.id, email: res.email, name: res.name,
    role: role ?? res.role, age: res.age, university: res.university,
  }, remember);
}

export const authApi = {
  googleEnabled: !!GOOGLE_AUTH_URL,
  register: async (payload: RegisterRequest, remember = true) => {
    const res = await request<RegisterResponse>("/auth/register", {
      method: "POST", json: payload, skipAuth: true,
    });
    persistAuth(res, remember);
    return res;
  },
  login: async (payload: LoginRequest, remember = true) => {
    const res = await request<LoginResponse>("/auth/login", {
      method: "POST", json: payload, skipAuth: true,
    });
    persistAuth(res, remember);
    return res;
  },
  forgotPassword: async (email: string) => {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST", json: { email }, skipAuth: true,
    });
  },
  googleLogin: () => {
    if (typeof window === "undefined") return;
    if (!GOOGLE_AUTH_URL) {
      toast.error("Google OAuth non configuré.");
      return;
    }
    window.location.href = GOOGLE_AUTH_URL;
  },
  logout: () => auth.clear(),
};

/* ========= TASKS ========= */
const BACKEND_STATUSES = new Set(["IN_PROGRESS", "COMPLETED", "CANCELLED"]);
function mapStatusOut(s?: string): string | undefined {
  if (!s) return undefined;
  if (s === "TODO") return "IN_PROGRESS";
  if (s === "DONE" || s === "REVIEW") return "COMPLETED";
  return BACKEND_STATUSES.has(s) ? s : "IN_PROGRESS";
}
function mapPriorityOut(p?: string): string | undefined {
  if (!p) return undefined;
  return p === "CRITICAL" ? "HIGH" : p;
}

export type TaskRequest = {
  title: string; description?: string; priority: Priority;
  deadline?: string; duration?: number; difficulty?: number;
  category?: string; tags?: string[]; status?: TaskStatus;
  studentId?: string;
};
export type TaskResponse = {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string;
  duration?: number;
  difficulty?: number;
  category?: string;
  status: TaskStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
};
export const tasksApi = {
  list: () => request<any[]>("/student/tasks"),
  get: (id: string) => request<any>(`/student/tasks/${id}`),
  create: (payload: TaskRequest) => {
    const body = {
      ...payload,
      priority: mapPriorityOut(payload.priority),
      status: mapStatusOut(payload.status) ?? "IN_PROGRESS",
      studentId: payload.studentId ?? auth.getUser()?.id ?? "self",
    };
    return request<any>("/student/tasks", { method: "POST", json: body });
  },
  update: (id: string, payload: Partial<TaskRequest>) => {
    const body = {
      ...payload,
      priority: mapPriorityOut(payload.priority as string),
      status: mapStatusOut(payload.status as string),
    };
    return request<any>(`/student/tasks/${id}`, { method: "PATCH", json: body });
  },
  remove: (id: string) => request<void>(`/student/tasks/${id}`, { method: "DELETE" }),
};

/* ========= SCHEDULES ========= */
export type ScheduleRequest = {
  taskId: string; startTime: string; endTime: string;
  score?: number; source?: string; studentId?: string;
};
export const schedulesApi = {
  list: () => request<any[]>("/student/schedules"),
  get: (id: string) => request<any>(`/student/schedules/${id}`),
  byTask: (taskId: string) => request<any[]>(`/student/schedules/task/${taskId}`),
  create: (payload: ScheduleRequest) =>
    request<any>("/student/schedules", {
      method: "POST",
      json: { ...payload, studentId: payload.studentId ?? auth.getUser()?.id ?? "self" },
    }),
  update: (id: string, payload: Partial<ScheduleRequest>) =>
    request<any>(`/student/schedules/${id}`, { method: "PATCH", json: payload }),
  remove: (id: string) => request<void>(`/student/schedules/${id}`, { method: "DELETE" }),
};

/* ========= PROFILE ========= */
export type StudentProfile = {
  studentId?: string;
  sleepHours?: number;
  availability?: string[];
  baselineEnergy?: number;
};
export const profileApi = {
  get: () => request<any>("/student/profile"),
  create: (payload: StudentProfile & Record<string, any>) =>
    request<any>("/student/profile", {
      method: "POST",
      json: { ...payload, studentId: payload.studentId ?? auth.getUser()?.id ?? "self" },
    }),
  update: (payload: Partial<StudentProfile> & Record<string, any>) =>
    request<any>("/student/profile", { method: "PATCH", json: payload }),
  remove: () => request<void>("/student/profile", { method: "DELETE" }),
};

/* ========= REPORTS (étudiant) ========= */
export const reportsApi = {
  create: (message: string, category?: string) =>
    request("/reports", { method: "POST", json: { message, category: category ?? "general" } }),
  mine: () => request<any[]>("/reports/my-reports"),
};

/* ========= ADMIN ========= */
export type AdminUserUpdate = {
  name?: string; email?: string; role?: Role | string;
  birthDate?: string; university?: string;
  // Tolerate extra fields used by the frontend (e.g. status toggles).
  [k: string]: any;
};
export const adminApi = {
  users: () => request<any[]>("/admin/users"),
  getUser: (id: string) => request<any>(`/admin/users/${id}`),
  updateUser: (id: string, payload: AdminUserUpdate) =>
    request<any>(`/admin/users/${id}`, { method: "PUT", json: payload }),
  deleteUser: (id: string) => request<any>(`/admin/users/${id}`, { method: "DELETE" }),

  // Reports: backend only documents reports under /reports & /reports/my-reports.
  // Best-effort admin listing fallback to /reports if /admin/reports unavailable.
  reports: async () => {
    try { return await request<any[]>("/admin/reports"); }
    catch { return await request<any[]>("/reports"); }
  },
  replyReport: (id: string, reply: string) =>
    request<any>(`/admin/reports/${id}/reply`, { method: "PUT", json: { reply } }),
  deleteReport: (id: string) => request<void>(`/admin/reports/${id}`, { method: "DELETE" }),
};

/* ========= FAQ ========= */
export type FaqItem = {
  id: string; question: string; answer: string; category: string;
  createdAt?: string; updatedAt?: string;
};
export const faqApi = {
  list: () => request<FaqItem[]>("/faq", { skipAuth: true }),
  get: (id: string) => request<FaqItem>(`/faq/${id}`, { skipAuth: true }),
  search: (q: string) => request<FaqItem[]>(`/faq/search?q=${encodeURIComponent(q)}`, { skipAuth: true }),
  byCategory: (category: string) =>
    request<FaqItem[]>(`/faq/category/${encodeURIComponent(category)}`, { skipAuth: true }),
  askQuestion: (question: string) =>
    request<FaqItem>("/faq/questions", { method: "POST", json: { question } }),
  // Admin
  listAdmin: () => request<FaqItem[]>("/admin/faq"),
  create: (payload: { question: string; answer: string; category: string }) =>
    request<FaqItem>("/admin/faq", { method: "POST", json: payload }),
  update: (id: string, payload: Partial<{ question: string; answer: string; category: string }>) =>
    request<FaqItem>(`/admin/faq/${id}`, { method: "PUT", json: payload }),
  remove: (id: string) => request<void>(`/admin/faq/${id}`, { method: "DELETE" }),
};

/* ========= SURVEY ========= */
export type SurveyQuestion = {
  id: string;
  text: string;
  type: "TEXT" | "CHOICE" | "MULTI" | "NUMBER" | string;
  key?: string;
  options?: string[];
  displayOrder?: number;
};
export const surveyApi = {
  questions: () => request<SurveyQuestion[]>("/survey-questions"),
  submit: (payload: Record<string, any>) => {
    const body = { ...payload, studentId: payload.studentId ?? auth.getUser()?.id ?? "self" };
    return request("/surveys", { method: "POST", json: body });
  },
  // Admin: backend exposes only POST /survey-questions which replaces/upserts the set.
  // We provide CRUD-like helpers on top of that contract.
  saveAll: (qs: SurveyQuestion[]) =>
    request<SurveyQuestion[]>("/survey-questions", { method: "POST", json: qs }),
  createQuestion: async (q: Omit<SurveyQuestion, "id">) => {
    const current = await surveyApi.questions().catch(() => [] as SurveyQuestion[]);
    const next = [...current, { ...q, id: crypto.randomUUID() } as SurveyQuestion];
    const saved = await surveyApi.saveAll(next);
    return saved.find((x) => x.text === q.text) ?? next[next.length - 1];
  },
  updateQuestion: async (id: string, patch: Partial<SurveyQuestion>) => {
    const current = await surveyApi.questions().catch(() => [] as SurveyQuestion[]);
    const next = current.map((x) => (x.id === id ? { ...x, ...patch } : x));
    const saved = await surveyApi.saveAll(next);
    return saved.find((x) => x.id === id) ?? (next.find((x) => x.id === id) as SurveyQuestion);
  },
  deleteQuestion: async (id: string) => {
    const current = await surveyApi.questions().catch(() => [] as SurveyQuestion[]);
    await surveyApi.saveAll(current.filter((x) => x.id !== id));
  },
};

/* ========= PLACES ========= */
export type Place = {
  id: string; name: string; address: string; categories?: string[];
  distance?: number; latitude: number; longitude: number;
  phone?: string; url?: string | null; website?: string | null;
  price?: string;
};
export type PlacesSearchResult = {
  success: boolean;
  data: any; // backend declares string but actually returns object { places, price }
  error: string | null;
};
export const placesApi = {
  search: (q: { product: string; latitude?: number; longitude?: number; maxResults?: number; budget?: number }) =>
    request<PlacesSearchResult>("/places/search", {
      method: "POST",
      json: {
        product: q.product,
        latitude: q.latitude ?? 33.58307,
        longitude: q.longitude ?? -7.52621,
        maxResults: q.maxResults ?? 10,
      },
    }),
};

/* ========= RECOMMENDATIONS ========= */
export type RecommendationPayload = {
  product: string; placeId: string; name: string; address: string;
  latitude: number; longitude: number;
  phone?: string; website?: string | null; url?: string | null;
  categories?: string[];
};
export const recommendationsApi = {
  create: (payload: RecommendationPayload) =>
    request<string>("/recommendations", { method: "POST", json: payload }),
};

/* ========= CALENDAR / MOOD / NOTIFS / PLANNER ========= */
export const calendarApi = {
  importIcs: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("/calendar/import", { method: "POST", form: fd });
  },
};
export const moodApi = {
  declare: (payload: { date: string; energyScore: number; moodType: string; note?: string }) =>
    request("/mood", {
      method: "POST",
      json: { ...payload, studentId: auth.getUser()?.id ?? "self", recordedAt: new Date().toISOString() },
    }),
};
export const notificationsApi = {
  unread: () => request<any[]>("/notifications"),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: "PUT" }),
};
export const plannerApi = {
  generate: () => request("/planner/generate", { method: "POST" }),
  current: () => request("/planner/current"),
};

export const api = {
  auth: authApi, tasks: tasksApi, schedules: schedulesApi, profile: profileApi,
  reports: reportsApi, admin: adminApi, faq: faqApi, survey: surveyApi,
  places: placesApi, recommendations: recommendationsApi,
  calendar: calendarApi, mood: moodApi, notifications: notificationsApi, planner: plannerApi,
};

export default api;

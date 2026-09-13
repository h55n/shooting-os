export type Status =
  | "IDEA"
  | "PLANNED"
  | "RESEARCHING"
  | "SCRIPT_DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "RECORDING"
  | "EDITING"
  | "PUBLISHED"
  | "BLOCKED"
  | "REJECTED";

export const statusStyle: Record<Status, { bg: string; fg: string; bold?: boolean; dot?: boolean }> = {
  IDEA: { bg: "#F5F5F5", fg: "#626262" },
  PLANNED: { bg: "#EEF4FF", fg: "#0F7FFF" },
  RESEARCHING: { bg: "#EEF4FF", fg: "#0F7FFF", dot: true },
  SCRIPT_DRAFT: { bg: "#FFF8E1", fg: "#926E00" },
  REVIEW: { bg: "#FEEA3D", fg: "#000000", bold: true },
  APPROVED: { bg: "#ECFDF3", fg: "#027A48" },
  RECORDING: { bg: "#FFF1F0", fg: "#B42318" },
  EDITING: { bg: "#FFF8E1", fg: "#926E00" },
  PUBLISHED: { bg: "#12B76A", fg: "#FFFFFF" },
  BLOCKED: { bg: "#FFF1F0", fg: "#D92D20" },
  REJECTED: { bg: "#FFF1F0", fg: "#D92D20" },
};

// ─── Hindi Date Helper ────────────────────────────────────────────────────────

const HINDI_DAYS = ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar"];
const HINDI_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getHindiDate(): string {
  const now = new Date();
  const day = HINDI_DAYS[now.getDay()];
  const date = now.getDate();
  const month = HINDI_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  return `${day}, ${date} ${month} ${year}`;
}

// ─── Week Helper ──────────────────────────────────────────────────────────────

const SHORT_DAYS = ["Ravi", "Som", "Mangal", "Budh", "Guru", "Shukra", "Shani"];

export function getWeekDays(): { d: string; n: number; date: string }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // shift to Monday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return {
      d: SHORT_DAYS[d.getDay()],
      n: d.getDate(),
      date: `${yyyy}-${mm}-${dd}`,
    };
  });
}

export function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Idea = {
  id: string;
  title: string;
  angle: string;
  format: "Reel" | "YouTube" | "Carousel";
  status: Status;
  created: string;
  expansion: {
    title: string;
    hook: string;
    points: string[];
    audience: string;
    format: string;
    cta: string;
  };
  research?: {
    summary: string;
    sources: { label: string; url: string }[];
    safe: string[];
    unsafe: string[];
    confidence: "High" | "Medium" | "Low";
  };
  fatherStory?: string;
};

export const ideas: Idea[] = [];

export const trends: { id: string; title: string; source: string }[] = [];

export type Content = {
  id: string;
  title: string;
  series: string;
  platform: string;
  status: Status;
  type: string;
  date: string;
  script: { hook: string; body: string[]; cta: string };
  versions: { label: string; time: string }[];
};

export const contents: Content[] = [];

export const series: { id: string; name: string; done: number; total: number }[] = [];

export const analytics: { id: string; title: string; platform: string; views: number; likes: number; watch: string; comments: number }[] = [];

export const masterclass: {
  id: string;
  title: string;
  lessons: { id: string; title: string; status: Status; source: string }[];
}[] = [];

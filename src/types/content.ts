export interface ProjectCard {
  id: string;
  title: string;
  blurb: string;
  tech: string[];
}

export interface Metric {
  label: string;
  value: string;
}

export type DemoKind = "agent-tool-call" | "scoring-pipeline";

export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  metrics: Metric[];
  demo: DemoKind;
}

export interface WorkPillar {
  id: string;
  gameName: string;
  label: string;
  boss: CaseStudy;
  cards: ProjectCard[];
}

export interface SkillCategory {
  name: string;
  items: string[];
}

export interface ExperienceEntry {
  org: string;
  role: string;
  period: string;
  bullets: string[];
  kind: "main" | "prologue";
}

export interface EducationItem {
  title: string;
  org: string;
  status?: string;
}

export interface Profile {
  name: string;
  tagline: string;
  bioFirstPerson: string;
  location: string;
  education: EducationItem[];
}

export interface ContactLink {
  label: string;
  href: string;
  prompt: string;
  hidden?: boolean;
}

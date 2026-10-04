export interface Profile {
  id: number;
  fullName: string;
  headline: string;
  summary: string;
  email: string;
  phone: string | null;
  location: string | null;
  website: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Skill {
  id: number;
  profileId: number;
  name: string;
  category: string;
  level: number;
  sortOrder: number;
}

export interface Experience {
  id: number;
  profileId: number;
  company: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  highlights: string[];
  sortOrder: number;
}

export interface Education {
  id: number;
  profileId: number;
  school: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string;
  sortOrder: number;
}

export interface Project {
  id: number;
  profileId: number;
  name: string;
  role: string | null;
  url: string | null;
  description: string;
  tech: string[];
  sortOrder: number;
}

export interface SocialLink {
  id: number;
  profileId: number;
  label: string;
  url: string;
  sortOrder: number;
}

export interface ResumePayload {
  profile: Profile | null;
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  socialLinks: SocialLink[];
}

export function emptyResume(): ResumePayload {
  return {
    profile: null,
    skills: [],
    experiences: [],
    education: [],
    projects: [],
    socialLinks: [],
  };
}
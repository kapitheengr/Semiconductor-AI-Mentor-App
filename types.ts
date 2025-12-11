
export interface UserProfile {
  name: string;
  email: string;
  age: string;
  education: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ROADMAP = 'ROADMAP',
  QUIZ = 'QUIZ',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  PROFESSIONAL = 'PROFESSIONAL',
  LIVE_MENTOR = 'LIVE_MENTOR',
  LEARNING = 'LEARNING',
  JOBS = 'JOBS',
}

export interface RoadmapItem {
  id: string;
  title: string;
  duration: string;
  description: string;
  content: string; // Detailed study material
  topics: string[]; // Key concepts covered
  status: 'not-started' | 'in-progress' | 'completed';
  prerequisites?: string[];
}

export interface RoadmapData {
  skills: string[];
  modules: RoadmapItem[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ProfessionalProfile {
  name: string;
  title: string;
  company: string;
  description: string;
  linkedinUrl?: string; // If found via search
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  platform: string; // e.g. LinkedIn, Naukri, Glassdoor
  snippet: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Course Data Types
export interface Topic {
  id: string;
  title: string;
  content: string; // Markdown or HTML string
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  topics: Topic[];
}

// Record<CourseID, Array<TopicID>>
export type UserCourseProgress = Record<string, string[]>;

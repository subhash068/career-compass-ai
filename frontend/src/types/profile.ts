export interface ProfileBasicInfo {
  id: number;
  email: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  location?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  role?: string;
  currentRole?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountDetails {
  role: string;
  currentRole: string;
  is_verified: boolean;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  level: number;
  confidence: number;
  score: number;
}

export interface SkillsSummary {
  top_skills: UserSkill[];
  total_skills: number;
}

export interface AssessmentStats {
  completed_count: number;
  avg_score: number;
}

export interface LearningPathsSummary {
  count: number;
  avg_progress: number;
}

export interface ProfileResponse {
  name: string;
  id: number;
  first_name: string;
  last_name: string;
  location: string;
  experience_years: number;
  bio: string;
  phone: string;
  email: string;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  basic_information: ProfileBasicInfo;
  account_details: AccountDetails;
  skills_summary: SkillsSummary;
  assessment_stats: AssessmentStats;
  learning_paths: LearningPathsSummary;
  resumes_count: number;
  certificates_count: number;
}

export interface ProfileUpdate {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  location?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
}


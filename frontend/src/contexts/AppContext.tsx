import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  UserSkill,
  CareerMatch,
  LearningPath,
  ChatMessage,
  SkillGap
} from '@/types';
import {
  calculateCareerMatches,
  enrichUserSkills
} from '@/lib/mock-data';
import { skillsApi } from '@/api/skills.api';
import { careerApi } from '@/api/career.api';
import { learningApi } from '@/api/learning.api';

interface AppContextType {
  userSkills: UserSkill[];
  setUserSkills: (skills: UserSkill[]) => void;
  updateSkill: (skillId: string, level: string, confidence: number) => void;
  careerMatches: CareerMatch[];
  refreshCareerMatches: () => void;
  selectedCareer: CareerMatch | null;
  setSelectedCareer: (career: CareerMatch | null) => void;
  learningPath: LearningPath | null;
  generatePath: (roleId: string) => void;
  markStepComplete: (stepId: string) => void;
  allGaps: SkillGap[];
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  isAssessmentComplete: boolean;
  setIsAssessmentComplete: (complete: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoadingSkills: boolean;
  isLoadingCareers: boolean;
  isLoadingLearning: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userSkills, setUserSkillsState] = useState<UserSkill[]>([]);
  const [careerMatches, setCareerMatches] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerMatch | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isLoadingCareers, setIsLoadingCareers] = useState(true);
  const [isLoadingLearning, setIsLoadingLearning] = useState(false);

  useEffect(() => {
    const loadUserSkills = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoadingSkills(false);
        return;
      }
      setIsLoadingSkills(true);
      try {
        const response = await skillsApi.getUserSkills();
        console.log('[DEBUG] Skills API response:', response);
        // Backend returns skills directly as array, not wrapped in object
        const skillsData = Array.isArray(response.data) ? response.data : response.data?.skills || [];
        console.log('[DEBUG] Parsed skills data:', skillsData);
        if (skillsData.length > 0) {
          // Transform API data to include skill info from the API response itself
          // Backend provides: skill_id, skill_name, category
          const transformedSkills = skillsData.map((skill: any) => ({
            id: skill.id,
            userId: skill.user_id,
            skillId: skill.skill_id,
            level: skill.level,
            confidence: skill.confidence,
            score: skill.score,
            assessedAt: new Date(skill.assessed_at || skill.created_at),
            version: skill.version || 1,
            // Include skill info directly from API response
            skill: {
              id: skill.skill_id,
              name: skill.skill_name,
              category: skill.category, // This is the domain name like 'DevOps', 'QA Engineer'
              categoryId: skill.category?.toLowerCase().replace(/\s+/g, '-'),
              description: skill.description || '',
              demandLevel: 5,
            }
          }));
          console.log('[DEBUG] Transformed skills:', transformedSkills);
          setUserSkillsState(transformedSkills);
          setIsAssessmentComplete(true);
        } else {
          setUserSkillsState([]);
          setIsAssessmentComplete(false);
        }
      } catch (error) {
        console.error('Failed to load user skills:', error);
        setUserSkillsState([]);
      } finally {
        setIsLoadingSkills(false);
      }
    };
    loadUserSkills();
  }, []);

  useEffect(() => {
    const loadCareerMatches = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoadingCareers(false);
        return;
      }
      setIsLoadingCareers(true);
      try {
        const response = await careerApi.getRecommendations();
        console.log('[DEBUG] Career API response:', response);
        // careerApi returns the data directly (not wrapped in .data)
        const careerData = response.recommendations || [];
        console.log('[DEBUG] Parsed career data:', careerData);
        setCareerMatches(careerData);
      } catch (error) {
        console.error('Failed to load career matches:', error);
        setCareerMatches([]);
      } finally {
        setIsLoadingCareers(false);
      }
    };
    loadCareerMatches();
  }, []);

  const loadLearningPath = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setIsLoadingLearning(true);
    try {
      const path = await learningApi.getPath();
      if (path) {
        const pathAny = path as any;
        setLearningPath({
          ...path,
          targetRoleId: pathAny.target_role_id,
          targetRole: pathAny.target_role,
          totalDuration: pathAny.total_duration,
          steps: (pathAny.steps || []).map((step: any) => ({
            ...step,
            skillId: step.skill_id,
            skill_name: step.skill_name,
            targetLevel: step.target_level,
            estimatedDuration: step.estimated_duration,
            isCompleted: step.is_completed,
            assessmentPassed: step.assessment_passed,
          })),
        } as LearningPath);
      } else {
          setLearningPath(null);
        }
      } catch (error) {
        console.error('Failed to load learning path:', error);
        setLearningPath(null);
      } finally {
        setIsLoadingLearning(false);
      }
    }, []);

  useEffect(() => {
    loadLearningPath();
  }, [loadLearningPath]);
  useEffect(() => {
    const handleAssessmentComplete = () => {
      console.log('Assessment completed - refreshing dashboard data...');
      const token = localStorage.getItem('authToken');
      if (!token) return;
      skillsApi.getUserSkills().then(response => {
        const skillsData = Array.isArray(response.data) ? response.data : response.data?.skills || [];
        if (skillsData.length > 0) {
          const enrichedSkills = enrichUserSkills(skillsData.map((skill: any) => ({
            id: skill.id,
            userId: skill.user_id,
            skillId: skill.skill_id,
            level: skill.level,
            confidence: skill.confidence,
            score: skill.score,
            assessedAt: new Date(skill.assessed_at || skill.created_at),
            version: skill.version || 1,
          })));
          setUserSkillsState(enrichedSkills);
          setIsAssessmentComplete(true);
        }
      }).catch(err => console.error('Failed to refresh skills:', err));
      careerApi.getRecommendations().then(response => {
        const careerData = response.recommendations || [];
        setCareerMatches(careerData);
      }).catch(err => console.error('Failed to refresh career matches:', err));
    };
    window.addEventListener('assessmentCompleted', handleAssessmentComplete);
    return () => window.removeEventListener('assessmentCompleted', handleAssessmentComplete);
  }, []);

  const setUserSkills = useCallback((skills: UserSkill[]) => {
    setUserSkillsState(enrichUserSkills(skills));
  }, []);

  const updateSkill = useCallback((skillId: string, level: string, confidence: number) => {
    setUserSkillsState(prev => {
      const updated = prev.map(s => 
        s.skillId.toString() === skillId 
          ? { ...s, level: level as UserSkill['level'], confidence, score: getScoreFromLevel(level, confidence) }
          : s
      );
      setCareerMatches(calculateCareerMatches(updated));
      return updated;
    });
  }, []);

  const refreshCareerMatches = useCallback(async () => {
    setIsLoadingCareers(true);
    try {
      const response = await careerApi.getRecommendations();
      const careerData = response.recommendations || [];
      const transformedData = careerData.map((career: any) => ({
        ...career,
        roleId: career.role_id || career.roleId,
        matchScore: career.match_percentage || career.matchScore,
        skillMatch: career.skill_match || career.skillMatch,
        inferredBonus: career.inferred_bonus || career.inferredBonus,
        confidenceLevel: career.confidence_level || career.confidenceLevel,
        matchedCount: career.matched_count || career.matchedCount,
        missingCount: career.missing_count || career.missingCount,
        totalRequirements: career.total_requirements || career.totalRequirements,
        estimatedTimeToQualify: career.estimated_time_to_qualify || career.estimatedTimeToQualify,
        averageSalary: career.average_salary || career.averageSalary,
        growthRate: career.growth_rate || career.growthRate,
        demandScore: career.demand_score || career.demandScore,
        marketOutlook: career.market_outlook || career.marketOutlook,
      }));
      setCareerMatches(transformedData);
    } catch (error) {
      console.error('Failed to refresh career matches:', error);
    } finally {
      setIsLoadingCareers(false);
    }
  }, []);

  const generatePath = useCallback(async (roleId: string) => {
    setIsLoadingLearning(true);
    try {
      const path = await learningApi.generatePath(parseInt(roleId));
      if (path) {
        const pathAny = path as any;
        setLearningPath({
          ...path,
          targetRoleId: pathAny.target_role_id,
          targetRole: pathAny.target_role,
          totalDuration: pathAny.total_duration,
          steps: (pathAny.steps || []).map((step: any) => ({
            ...step,
            skillId: step.skill_id,
            skill_name: step.skill_name,
            targetLevel: step.target_level,
            estimatedDuration: step.estimated_duration,
            isCompleted: step.is_completed,
            assessmentPassed: step.assessment_passed,
          })),
        } as LearningPath);
      }
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setIsLoadingLearning(false);
    }
  }, []);

  const markStepComplete = useCallback(async (stepId: string) => {
    setIsLoadingLearning(true);
    try {
      // Get the current learning path to find its ID
      const currentPath = await learningApi.getPath();
      if (!currentPath) {
        console.warn('No learning path available for marking step complete');
        return;
      }
      
      await learningApi.markStepComplete(currentPath.id, parseInt(stepId));
      const updatedPath = await learningApi.getPath();
      if (updatedPath) {
        const pathAny = updatedPath as any;
        setLearningPath({
          ...updatedPath,
          targetRoleId: pathAny.target_role_id,
          targetRole: pathAny.target_role,
          totalDuration: pathAny.total_duration,
          steps: (pathAny.steps || []).map((step: any) => ({
            ...step,
            skillId: step.skill_id,
            skill_name: step.skill_name,
            targetLevel: step.target_level,
            estimatedDuration: step.estimated_duration,
            isCompleted: step.is_completed,
            assessmentPassed: step.assessment_passed,
          })),
        } as LearningPath);
      }
    } catch (error) {
      console.error('Failed to mark step complete:', error);
    } finally {
      setIsLoadingLearning(false);
    }
  }, []);

  const allGaps = (careerMatches || []).flatMap((m: any) => {
    if (!m) return [];
    if (m.missing_severity && m.missing_severity.length > 0) {
      return m.missing_severity.map((item: any) => ({
        skillId: item.skill_id || item.skill?.id || item.skill_name,
        skill: item.skill || { 
          id: item.skill_id,
          name: item.skill_name || 'Unknown Skill',
          description: item.description || '',
          categoryId: item.category_id,
          demandLevel: item.demand_level || 0
        },
        severity: item.severity,
        priority: item.priority || 5,
      }));
    }
    return (m.missing_skills || []).map((skill: string) => ({
      skillId: skill,
      skill: { id: skill, name: skill, description: '', categoryId: null, demandLevel: 0 },
      severity: 'medium',
      priority: 5,
    }));
  });

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  }, []);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      userSkills,
      setUserSkills,
      updateSkill,
      careerMatches,
      refreshCareerMatches,
      selectedCareer,
      setSelectedCareer,
      learningPath,
      generatePath,
      markStepComplete,
      allGaps,
      chatMessages,
      addChatMessage,
      clearChat,
      isAssessmentComplete,
      setIsAssessmentComplete,
      isDarkMode,
      toggleDarkMode,
      isLoadingSkills,
      isLoadingCareers,
      isLoadingLearning,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

function getScoreFromLevel(level: string, confidence: number): number {
  const baseScores: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };
  const base = baseScores[level] || 25;
  return Math.round(base * (confidence / 100));
}

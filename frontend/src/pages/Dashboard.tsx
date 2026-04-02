import { StatCard } from '@/components/ui/stat-card';
import { SkillsOverview } from '@/components/dashboard/SkillsOverview';
import { TopGaps } from '@/components/dashboard/TopGaps';
import { CareerMatches } from '@/components/dashboard/CareerMatches';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CompletedAssessments } from '@/components/dashboard/CompletedAssessments';
import { SkillProgressChart } from '@/components/dashboard/SkillProgressChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LearningPathCard } from '@/components/dashboard/LearningPathCard';
import { Achievements } from '@/components/dashboard/Achievements';
import { WeeklyGoals } from '@/components/dashboard/WeeklyGoals';
import { Target, TrendingUp, Briefcase, GraduationCap, Sparkles, Loader2, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import learningApi from '@/api/learning.api';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { 
    userSkills, 
    careerMatches, 
    allGaps, 
    learningPath: contextLearningPath,
    isLoadingSkills, 
    isLoadingCareers,
    isLoadingLearning,
    refreshCareerMatches
  } = useApp();

  const [localLearningPath, setLocalLearningPath] = useState(null);
  const [isLoadingLocalPath, setIsLoadingLocalPath] = useState(false);

  const learningPath = localLearningPath || contextLearningPath;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const avgSkillScore = userSkills.length > 0
    ? Math.round(userSkills.reduce((sum, s) => sum + s.score, 0) / userSkills.length)
    : 0;

  const topMatch = careerMatches[0];
  const uniqueGapCount = [...new Set(allGaps.map(g => g.skillId))].length;

// Calculate learning progress client-side for consistency
  const completedSteps = learningPath?.steps?.filter((s: any) => s.isCompleted || s.is_completed)?.length || 0;
  const totalSteps = learningPath?.steps?.length || 0;
  const learningProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const hasLearningPath = learningPath !== null;
  const isPathCompleted = learningProgress === 100;

  // Fetch learning path if not available from context
  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!learningPath && !isLoadingLearning && !isLoadingLocalPath) {
        setIsLoadingLocalPath(true);
        try {
          const path = await learningApi.getPath();
          setLocalLearningPath(path);
        } catch (error) {
          console.error('Failed to fetch learning path:', error);
        } finally {
          setIsLoadingLocalPath(false);
        }
      }
    };

    fetchLearningPath();
  }, [learningPath, isLoadingLearning, isLoadingLocalPath]);

  const isLoading = isLoadingSkills || isLoadingCareers;

  const refreshLearningPath = async () => {
    try {
      setIsLoadingLocalPath(true);
      const path = await learningApi.getPath();
      setLocalLearningPath(path);
      // Update context if possible (future enhancement)
      console.log('Learning path refreshed:', path);
    } catch (error) {
      console.error('Failed to refresh learning path:', error);
    } finally {
      setIsLoadingLocalPath(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCareerMatches();
    await refreshLearningPath();
    setIsRefreshing(false);
    // Remove page reload - use fetched data instead
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome back! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Track your skill development and career progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" asChild>
            <Link to="/skill_selection">
              <Target className="w-4 h-4 mr-2" />
              Take Assessment
            </Link>
          </Button>
          <Button asChild>
            <Link to="/assistant">
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Debug Info - Remove in production
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono">
          <p>Debug: userSkills={userSkills.length}, careerMatches={careerMatches.length}, learningPath={learningPath ? 'yes' : 'no'}</p>
        </div>
      )} */}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Skill Score"
          value={`${avgSkillScore}%`}
          subtitle={`${userSkills.length} skills assessed`}
          icon={Target}
          trend={avgSkillScore > 0 ? { value: Math.min(avgSkillScore, 100), isPositive: true } : undefined}
        />
        <StatCard
          title="Skill Gaps"
          value={uniqueGapCount}
          subtitle="Areas for improvement"
          icon={TrendingUp}
          iconClassName="bg-warning/10"
        />
        <StatCard
          title="Best Career Match"
          value={topMatch?.matchScore ? `${topMatch.matchScore}%` : '-'}
          subtitle={topMatch?.title || topMatch?.role?.title || 'Complete assessment'}
          icon={Briefcase}
          iconClassName="bg-success/10"
        />
        <StatCard
          title="Learning Progress"
          value={`${learningProgress}%`}
subtitle={hasLearningPath 
            ? (learningProgress === 100 ? "Path completed!" : `${completedSteps} of ${totalSteps} steps completed`)
            : "Start a learning path"}
          icon={GraduationCap}
          iconClassName="bg-accent/10"
          trend={learningProgress > 0 ? { value: learningProgress, isPositive: true } : undefined}
        />
      </div>

      {/* Quick Actions Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <WeeklyGoals />
      </div>

      {/* Stats & Progress Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkillProgressChart />
        </div>
        <LearningPathCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkillsOverview />
        <CompletedAssessments />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopGaps />
        <CareerMatches />
      </div>

      {/* Achievements & Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <Achievements />
      </div>
    </div>
  );
}

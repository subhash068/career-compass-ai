import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Trophy, ArrowRight, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';


interface CompletedAssessment {
  skill_id: number;
  skill_name: string;
  score: number;
  level: string;
  confidence: number;
  completed_at: string;
}

export function CompletedAssessments() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCompletedAssessments = useCallback(async () => {
    try {
      setLoading(true);
      try {
        const response = await axiosClient.get('/api/assessment/completed');
        const data = response.data;
        console.log('RAW API Response:', JSON.stringify(data, null, 2));
        console.log('Received assessments:', data.assessments?.length || 0);
        if (data.assessments?.length > 0) {
          console.log('First assessment raw:', data.assessments[0]);
        }
        // Ensure assessments is always an array
        const assessmentsArray = Array.isArray(data.assessments) ? data.assessments : [];
        console.log('Setting assessments array:', assessmentsArray.length);
        setAssessments(assessmentsArray);
      } catch (primaryError) {
        console.error('Failed to fetch assessments, trying fallback:', primaryError);

        // Fallback: derive completed assessments from user skills endpoint
        const skillsResponse = await axiosClient.get('/skills/user');
        const skillsData = skillsResponse.data;
        const skillsArray = Array.isArray(skillsData) ? skillsData : [];
        console.log('Fallback - received skills:', skillsArray.length);

        const transformedAssessments = skillsArray
          .filter((skill: any) => Number(skill.score) > 0)
          .map((skill: any) => ({
            skill_id: skill.skill_id,
            skill_name: skill.skill_name,
            score: Number(skill.score) || 0,
            level: skill.level || 'Beginner',
            confidence: Number(skill.confidence) || 0,
            completed_at: skill.assessed_at || new Date().toISOString(),
          }))
          .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

        setAssessments(transformedAssessments);
      }
    } catch (error) {
      console.error('Error fetching completed assessments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchCompletedAssessments();
  }, [fetchCompletedAssessments]);

  // Listen for assessment completion events
  useEffect(() => {
    const handleAssessmentComplete = () => {
      console.log('Assessment completed event received, refreshing...');
      fetchCompletedAssessments();
    };

    // Listen for custom event
    window.addEventListener('assessmentCompleted', handleAssessmentComplete);
    
    // Also listen for storage changes (in case other tabs update)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastAssessmentCompleted') {
        console.log('Storage change detected, refreshing assessments...');
        fetchCompletedAssessments();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('assessmentCompleted', handleAssessmentComplete);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchCompletedAssessments]);



  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLevelBadgeVariant = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel === 'expert') return 'default';
    if (lowerLevel === 'advanced') return 'secondary';
    if (lowerLevel === 'intermediate') return 'outline';
    return 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    console.log('RENDERING EMPTY STATE - assessments array is empty');
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Completed Assessments
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your assessment history and scores</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No completed assessments yet</p>
            <Button onClick={() => navigate('/skill_selection')} size="sm">
              Take Your First Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }


  // Debug: Log what's being rendered
  console.log('RENDERING - assessments count:', assessments.length);
  if (assessments.length > 0) {
    console.log('RENDERING - first assessment:', {
      name: assessments[0].skill_name,
      score: assessments[0].score,
      scoreType: typeof assessments[0].score
    });
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Completed Assessments
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} completed
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchCompletedAssessments}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {assessments.map((assessment, index) => (
            <div
              key={`${assessment.skill_id}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{assessment.skill_name}</h4>
                  <Badge variant={getLevelBadgeVariant(assessment.level)} className="text-xs">
                    {assessment.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(assessment.completed_at)}
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                <div className={`px-3 py-1.5 rounded-full font-bold text-sm ${getScoreColor(assessment.score)}`}>
                  {typeof assessment.score === 'number' ? assessment.score.toFixed(1) : assessment.score}%
                </div>
              </div>

            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t space-y-2">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => navigate('/assessment-history')}
          >
            View Full History
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => navigate('/skill_selection')}
          >
            Take More Assessments
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

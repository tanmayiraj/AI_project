import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Target, Zap, Briefcase, FileText, BarChart3, TrendingUp, AlertTriangle, Lightbulb, GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Intelligence() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  
  const [loading, setLoading] = useState(false);
  
  const [matchData, setMatchData] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    Promise.all([apiService.getResumes(), apiService.getJobs()]).then(([resRes, jobRes]) => {
      setResumes(resRes.data);
      setJobs(jobRes.data);
      if (resRes.data.length > 0) setSelectedResume(resRes.data[0].id);
      if (jobRes.data.length > 0) setSelectedJob(jobRes.data[0].id);
    });
  }, []);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!selectedResume || !selectedJob) {
      toast.error('Select both a Resume and a Job');
      return;
    }
    
    setLoading(true);
    setMatchData(null);
    setSkillGaps(null);
    setRoadmap(null);

    try {
      const matchPromise = apiService.matchJob(selectedResume, selectedJob);
      toast.promise(matchPromise, {
        loading: 'Running AI Match Engine...',
        success: 'Match generated successfully!',
        error: 'Failed to generate match.'
      });
      
      const matchRes = await matchPromise;
      setMatchData(matchRes.data);
      
      const [gapRes, mapRes] = await Promise.all([
        apiService.getSkillGap(selectedResume),
        apiService.getRoadmap(selectedResume)
      ]);
      
      setSkillGaps(gapRes.data);
      setRoadmap(mapRes.data);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (label, percentage) => {
    if (percentage === undefined || percentage === null) return null;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm font-bold">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderCategorizedSkills = (gap) => {
    const categories = [
      { key: 'technical_skills', label: 'Technical Skills' },
      { key: 'soft_skills', label: 'Soft Skills' },
      { key: 'frameworks', label: 'Frameworks' },
      { key: 'languages', label: 'Languages' },
      { key: 'tools', label: 'Tools' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {categories.map((cat) => {
          const skills = gap.missing_skills?.[cat.key] || [];
          if (skills.length === 0) return null;
          return (
            <div key={cat.key} className="p-4 bg-secondary/50 rounded-xl border border-border">
              <h4 className="font-semibold text-sm mb-2 text-foreground">{cat.label}</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded border border-destructive/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRoadmapPlan = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">{title}</h3>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-foreground text-lg">{item.skill_name}</h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block border ${
                    item.learning_priority.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                    item.learning_priority.toLowerCase() === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'
                  }`}>
                    {item.learning_priority} Priority
                  </span>
                </div>
                <div className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.estimated_time}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Free Resources</p>
                  <ul className="space-y-1">
                    {item.free_resources?.map((res, idx) => (
                      <li key={idx} className="text-sm text-foreground/90 truncate flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span> {res}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Projects ({item.difficulty})</p>
                  <ul className="space-y-1">
                    {item.project_suggestions?.map((proj, idx) => (
                      <li key={idx} className="text-sm text-foreground/90 truncate flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span> {proj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-primary" /> Intelligence Hub
        </h1>
        <p className="text-muted-foreground">Match your resume to a saved job description and generate your AI learning roadmap.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Match Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMatch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <label className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4"/> Select Resume</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                disabled={resumes.length === 0}
              >
                {resumes.length === 0 && <option value="">No resumes found</option>}
                {resumes.map(r => <option key={r.id} value={r.id}>{r.original_filename}</option>)}
              </select>
            </div>
            
            <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-muted-foreground text-xs font-bold shrink-0 mb-1">
              VS
            </div>

            <div className="space-y-2 flex-1 w-full">
              <label className="text-sm font-medium flex items-center gap-2"><Briefcase className="w-4 h-4"/> Select Job</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                disabled={jobs.length === 0}
              >
                {jobs.length === 0 && <option value="">No jobs found. Add one in Job Manager.</option>}
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} {j.company ? `at ${j.company}` : ''}</option>)}
              </select>
            </div>
            
            <Button type="submit" isLoading={loading} className="w-full md:w-auto h-10 px-8" disabled={!selectedResume || !selectedJob || loading}>
              Analyze Match
            </Button>
          </form>
        </CardContent>
      </Card>

      {matchData && matchData.detailed_analysis_json && (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-card">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" /> 
                  Overall Match
                </h3>
                <div className="relative shrink-0 mb-4">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary" />
                    <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={452} strokeDashoffset={452 - (452 * matchData.detailed_analysis_json.overall_match || matchData.detailed_analysis_json.ats_match_score) / 100} className="text-primary transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{Math.round(matchData.detailed_analysis_json.overall_match || matchData.detailed_analysis_json.ats_match_score)}<span className="text-xl text-muted-foreground">%</span></span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {matchData.detailed_analysis_json.learning_timeline && `Timeline: ${matchData.detailed_analysis_json.learning_timeline}`}
                  <br />
                  {matchData.detailed_analysis_json.estimated_preparation_time && `Prep Time: ${matchData.detailed_analysis_json.estimated_preparation_time}`}
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-2">
                  {renderProgressBar('Skill Match', matchData.detailed_analysis_json.skill_match)}
                  {renderProgressBar('Experience Match', matchData.detailed_analysis_json.experience_match)}
                  {renderProgressBar('Education Match', matchData.detailed_analysis_json.education_match)}
                  {renderProgressBar('Project Match', matchData.detailed_analysis_json.project_match)}
                  {renderProgressBar('ATS Parse Score', matchData.detailed_analysis_json.ats_match_score)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600"><TrendingUp className="w-5 h-5" /> Role Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {matchData.detailed_analysis_json.resume_strengths?.map((str, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                      <span className="text-green-500 font-bold mt-0.5"><CheckCircle2 className="w-4 h-4" /></span> <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="w-5 h-5" /> Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {matchData.detailed_analysis_json.resume_weaknesses?.map((wk, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                      <span className="text-amber-500 font-bold mt-0.5">•</span> <span>{wk}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">AI Suggestions</h4>
                  <ul className="space-y-2">
                    {matchData.detailed_analysis_json.improvement_suggestions?.map((sug, i) => (
                      <li key={i} className="text-sm text-foreground/90">{sug}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {matchData.detailed_analysis_json.suggested_courses && matchData.detailed_analysis_json.suggested_courses.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary"><GraduationCap className="w-5 h-5" /> Suggested Courses to Bridge the Gap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-2">
                  {matchData.detailed_analysis_json.suggested_courses.map((course, i) => (
                    <span key={i} className="px-3 py-1.5 bg-background border border-border text-foreground text-sm rounded-lg shadow-sm">
                      {course}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {skillGaps && skillGaps.length > 0 && skillGaps[0].missing_skills && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-destructive" /> Categorized Skill Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                {renderCategorizedSkills(skillGaps[0])}
              </CardContent>
            </Card>
          )}

          {roadmap && roadmap.roadmap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><Zap className="w-6 h-6 text-amber-500" /> AI Learning Roadmap</CardTitle>
                <p className="text-muted-foreground text-sm">Your customized 30-60-90 day plan to close the skill gap and land the job.</p>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  {renderRoadmapPlan("Phase 1: 30-Day Plan", roadmap.roadmap.plan_30_day)}
                  {renderRoadmapPlan("Phase 2: 60-Day Plan", roadmap.roadmap.plan_60_day)}
                  {renderRoadmapPlan("Phase 3: 90-Day Plan", roadmap.roadmap.plan_90_day)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

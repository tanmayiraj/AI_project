import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, User, Mail, Phone, ExternalLink, Award, FileText, CheckCircle2, XCircle, Lightbulb, TrendingUp, Target, Briefcase } from 'lucide-react';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export default function ResumeDetails() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getResume(id)
      .then(res => setResume(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <LoadingSkeleton className="h-12 w-64" />
        <LoadingSkeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-48 w-full" />
          <LoadingSkeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!resume) return <div className="p-8 text-center text-muted-foreground">Resume not found.</div>;

  const analysis = resume.analysis;
  const info = analysis?.extracted_information;
  const cats = analysis?.categorized_skills;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link to="/resumes" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{resume.original_filename}</h1>
          <p className="text-sm text-muted-foreground">Uploaded on {new Date(resume.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {!analysis ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No AI Analysis Yet</h3>
          <p className="text-muted-foreground mb-4">You need to analyze this resume from the Resume Manager to see detailed insights.</p>
          <Link to="/resumes" className="text-primary hover:underline">Go to Resume Manager</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Overview */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{info?.full_name || 'Not extracted'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {info?.email || 'Not extracted'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {info?.phone_number || 'Not extracted'}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {info?.linkedin && (
                      <a href={info.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-500 hover:underline">
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {info?.github && (
                      <a href={info.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-foreground hover:underline">
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">AI Summary</p>
                  <p className="text-sm leading-relaxed">{analysis.resume_summary}</p>
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Experience</h3>
                  {info?.experience?.length > 0 ? (
                    <ul className="space-y-3">
                      {info.experience.map((exp, i) => (
                        <li key={i} className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border">{exp}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No experience extracted.</p>}
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Education</h3>
                  {info?.education?.length > 0 ? (
                    <ul className="space-y-3">
                      {info.education.map((edu, i) => (
                        <li key={i} className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border">{edu}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No education extracted.</p>}
                </div>
              </div>

              {/* Categorized Skills */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Skills Matrix</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(cats || {}).map(([category, skills]) => (
                    skills && skills.length > 0 && (
                      <div key={category}>
                        <h4 className="text-sm font-semibold capitalize mb-2 text-primary">
                          {category.replace('_', ' ')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((s, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded border border-border">{s}</span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Overall ATS Score</p>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-secondary fill-none" strokeWidth="12" />
                    <circle cx="64" cy="64" r="56" className="stroke-primary fill-none" strokeWidth="12" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * analysis.ats_score) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">{analysis.ats_score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                {analysis.resume_rating && (
                  <div className="mt-4 pt-4 border-t border-border w-full">
                    <p className="text-sm text-muted-foreground">AI Rating</p>
                    <p className="text-xl font-bold text-foreground">{analysis.resume_rating} / 10</p>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary" /> Interview Readiness</h3>
                <p className="text-sm leading-relaxed">{analysis.interview_readiness || "Not evaluated."}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-green-500"><CheckCircle2 className="w-4 h-4" /> Top Strengths</h3>
                <ul className="space-y-2">
                  {(analysis.feedback_json?.strengths || []).map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-red-500"><XCircle className="w-4 h-4" /> Top Weaknesses</h3>
                <ul className="space-y-2">
                  {(analysis.feedback_json?.weaknesses || []).map((w, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-amber-500"><Lightbulb className="w-4 h-4" /> Improvement Tips</h3>
                <ul className="space-y-2">
                  {(analysis.feedback_json?.improvement_suggestions || []).map((t, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {analysis.career_advice && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-3 text-primary"><TrendingUp className="w-4 h-4" /> Career Advice</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{analysis.career_advice}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

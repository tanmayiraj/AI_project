import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, Building2, MapPin, DollarSign, Briefcase, GraduationCap, CheckCircle2, Star, Server, AlignLeft } from 'lucide-react';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getJob(id)
      .then(res => setJob(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <LoadingSkeleton className="h-16 w-64" />
        <LoadingSkeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-64 w-full" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!job) return <div className="p-8 text-center text-muted-foreground">Job not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" /> {job.company || 'Unknown Company'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AlignLeft className="w-5 h-5 text-primary" /> About the Role</h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Required Skills</h3>
            {job.required_skills && job.required_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((s, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No specific required skills extracted.</p>}
            
            {job.preferred_skills && job.preferred_skills.length > 0 && (
              <>
                <h3 className="text-lg font-bold mt-6 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferred_skills.map((s, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> Technologies</h3>
            {job.technologies && job.technologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.technologies.map((t, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full border border-border font-medium">
                    {t}
                  </span>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No specific technologies extracted.</p>}
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Key Responsibilities</h3>
              <ul className="space-y-3">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="text-sm flex items-start gap-3 text-foreground/90 bg-secondary/30 p-3 rounded-lg border border-border">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><MapPin className="w-4 h-4" /> Location</p>
              <p className="font-semibold text-foreground">{job.location || 'Not specified'}</p>
            </div>
            <div className="w-full h-px bg-border"></div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4" /> Salary Range</p>
              <p className="font-semibold text-green-500">{job.salary || 'Not specified'}</p>
            </div>
            <div className="w-full h-px bg-border"></div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><Briefcase className="w-4 h-4" /> Experience Required</p>
              <p className="font-semibold text-foreground">{job.experience || 'Not specified'}</p>
            </div>
            <div className="w-full h-px bg-border"></div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1"><GraduationCap className="w-4 h-4" /> Education Required</p>
              <p className="font-semibold text-foreground">{job.education || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 shadow-sm text-center">
            <h3 className="font-semibold text-primary mb-2">Ready to Match?</h3>
            <p className="text-sm text-foreground/80 mb-4">Head over to the Intelligence Hub to see how your resume stacks up against this role.</p>
            <Link to="/intelligence">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
                Go to Intelligence Hub
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

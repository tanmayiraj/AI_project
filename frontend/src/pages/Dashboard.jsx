import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Settings, Target, Zap, TrendingUp, Activity, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getDashboard()
      .then(res => setData(res.data))
      .catch(err => console.error("Dashboard fetch failed", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <LoadingSkeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="lg:col-span-2 h-96 w-full" />
          <LoadingSkeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8 text-muted-foreground">Failed to load dashboard data.</div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      },
    },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: '#334155', borderDash: [5, 5], drawBorder: false }, ticks: { color: '#64748b', max: 100, min: 0 } },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  const lineChartData = {
    labels: data.ats_trend?.map(t => new Date(t.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'ATS Score',
        data: data.ats_trend?.map(t => t.score) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: data.most_common_skills || [],
    datasets: [
      {
        data: data.most_common_skills?.map((_, i) => Math.max(10 - i, 2)) || [],
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
        ],
        borderWidth: 0,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20, usePointStyle: true } }
    },
    cutout: '75%',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email?.split('@')[0] || 'User'}! Here's your career progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-foreground">{data.total_resumes} <span className="text-sm font-normal text-muted-foreground">Res</span></h3>
                  <span className="text-muted-foreground font-bold">/</span>
                  <h3 className="text-3xl font-bold text-foreground">{data.total_jobs} <span className="text-sm font-normal text-muted-foreground">Jobs</span></h3>
                </div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2 flex items-center justify-between">
              <span>{data.total_analyses} Total Analyses</span>
              <span className="text-green-500">{data.upload_success_rate}% Success</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average ATS Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-foreground">{Math.round(data.average_ats_score || 0)}%</h3>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full rounded-full" style={{ width: `${data.average_ats_score || 0}%` }}></div>
            </div>
            <div className="text-xs text-muted-foreground border-t border-border pt-2 truncate">
              Highest: {data.highest_ats_score}% ({data.best_resume_name || 'N/A'})
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latest Job Match</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">
                  {data.latest_match_score !== null ? `${Math.round(data.latest_match_score)}%` : '--'}
                </h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground border-t border-border pt-2 truncate">
              Best Match: {data.best_job_match_title || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roadmap Progress</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">
                  {data.roadmap_progress !== null ? `${Math.round(data.roadmap_progress)}%` : '--'}
                </h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground border-t border-border pt-2 truncate">
              {data.missing_skills_count !== null ? `${data.missing_skills_count} Skills Left to Master` : 'Keep learning to close gaps.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> ATS Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ats_trend && data.ats_trend.length > 0 ? (
              <div className="h-72 w-full">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                <Activity className="w-8 h-8 opacity-20 mb-2" />
                <p>Not enough data for trend analysis.</p>
                <Link to="/resumes" className="text-primary text-sm mt-2 hover:underline">Upload more resumes</Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Most Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            {data.most_common_skills && data.most_common_skills.length > 0 ? (
              <div className="h-64 w-full relative">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-6">
                  <span className="text-2xl font-bold">{data.most_common_skills.length}</span>
                </div>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                <Target className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-center text-sm px-4">Match resumes with jobs to find skill gaps.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.latest_activity && data.latest_activity.length > 0 ? (
              <div className="space-y-4">
                {data.latest_activity.map((act, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`p-2 rounded-full mt-1 ${act.type === 'resume' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                      {act.type === 'resume' ? <FileText className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {act.type === 'resume' ? 'Uploaded Resume' : 'Added Job Description'}
                      </p>
                      <p className="text-xs text-muted-foreground">{act.title}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(act.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-4 text-center">No recent activity.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link to="/resumes" className="flex flex-col items-center justify-center p-6 bg-background border border-border hover:border-primary/50 hover:shadow-md transition-all rounded-xl text-center group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-foreground text-sm">Upload Resume</span>
            </Link>
            <Link to="/jobs" className="flex flex-col items-center justify-center p-6 bg-background border border-border hover:border-primary/50 hover:shadow-md transition-all rounded-xl text-center group">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm">Add Job Target</span>
            </Link>
            <Link to="/intelligence" className="col-span-2 flex flex-col items-center justify-center p-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl text-center shadow-lg group">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-white">Go to Intelligence Hub</span>
              <p className="text-xs text-white/80 mt-1">Match, analyze, and generate your roadmap.</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

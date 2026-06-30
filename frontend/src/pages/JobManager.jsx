import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Briefcase, Upload, Trash2, FileText, Loader2, Search, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export default function JobManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobText, setJobText] = useState('');
  
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('newest');
  
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getJobs();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!file || !jobTitle) {
      toast.error('Title and File are required');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('title', jobTitle);
    formData.append('file', file);
    
    try {
      const promise = apiService.uploadJobPdf(formData);
      toast.promise(promise, {
        loading: 'Processing PDF with AI...',
        success: 'Job uploaded successfully!',
        error: 'Upload failed.'
      });
      await promise;
      setFile(null);
      setJobTitle('');
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = async (e) => {
    e.preventDefault();
    if (!jobText || !jobTitle) {
      toast.error('Title and Description are required');
      return;
    }

    setUploading(true);
    try {
      const promise = apiService.uploadJobText({ title: jobTitle, description: jobText });
      toast.promise(promise, {
        loading: 'Extracting job details with AI...',
        success: 'Job saved successfully!',
        error: 'Failed to save job.'
      });
      await promise;
      setJobText('');
      setJobTitle('');
      setTextMode(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiService.deleteJob(deleteId);
      toast.success('Job deleted.');
      setJobs(jobs.filter(j => j.id !== deleteId));
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete job.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        (j.company && j.company.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortField === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortField === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortField === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [jobs, search, sortField]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const currentJobs = filteredAndSortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Job Manager</h1>
        <p className="text-muted-foreground">Manage your target job descriptions for AI matching.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Add Job
              </h3>
              <button 
                onClick={() => setTextMode(!textMode)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {textMode ? 'Upload PDF instead' : 'Paste Text instead'}
              </button>
            </div>
            
            {textMode ? (
              <form onSubmit={handleTextUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Job Description</label>
                  <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-48"
                    placeholder="Paste job description here..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                  {uploading ? 'Processing AI...' : 'Save Job Description'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePdfUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/50 transition-colors relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    {file ? (
                      <span className="text-sm font-medium text-primary truncate max-w-[200px]">{file.name}</span>
                    ) : (
                      <div className="text-sm">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!file || uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? 'Processing AI...' : 'Upload & Extract'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <select 
                value={sortField} 
                onChange={(e) => setSortField(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <LoadingSkeleton key={i} className="h-28 w-full" />)}
              </div>
            ) : filteredAndSortedJobs.length === 0 ? (
              <EmptyState 
                icon={Briefcase} 
                title="No Jobs Found" 
                description={search ? "Try adjusting your search filters." : "You haven't uploaded any jobs yet."} 
              />
            ) : (
              <div className="grid gap-3">
                {currentJobs.map((job) => (
                  <div key={job.id} className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:border-primary/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-4 overflow-hidden w-full">
                      <div className="p-3 bg-secondary rounded-lg shrink-0 text-primary hidden sm:block">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden w-full">
                        <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                        {job.company && <p className="text-sm font-medium text-muted-foreground truncate">{job.company}</p>}
                        <div className="flex gap-2 sm:gap-4 mt-2 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            Added: {new Date(job.created_at).toLocaleDateString()}
                          </p>
                          {job.experience && (
                            <p className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full border border-border">
                              Exp: {job.experience}
                            </p>
                          )}
                          {job.salary && (
                            <p className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                              {job.salary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(job.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteId} 
        title="Delete Job" 
        message="Are you sure you want to delete this job description? This will also remove any intelligence matches associated with it."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleting}
      />
    </div>
  );
}

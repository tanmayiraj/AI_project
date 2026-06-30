import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Upload, FileText, Trash2, Play, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export default function ResumeManager() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('newest');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchResumes = () => {
    setLoading(true);
    apiService.getResumes()
      .then(res => setResumes(res.data))
      .catch(err => {
        console.error("Failed to fetch resumes", err);
        toast.error("Failed to load resumes.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const promise = apiService.uploadResume(formData);
      toast.promise(promise, {
        loading: 'Uploading resume...',
        success: 'Resume uploaded successfully!',
        error: 'Upload failed.',
      });
      await promise;
      setFile(null);
      fetchResumes();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiService.deleteResume(deleteId);
      toast.success("Resume deleted.");
      fetchResumes();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete resume.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleAnalyze = async (id) => {
    try {
      const promise = apiService.analyzeResume(id);
      toast.promise(promise, {
        loading: 'Analyzing resume with AI...',
        success: 'Analysis completed!',
        error: 'Analysis failed.',
      });
      await promise;
      fetchResumes();
    } catch (err) {
      console.error("Analysis failed", err);
    }
  };

  const filteredAndSortedResumes = useMemo(() => {
    let result = [...resumes];
    
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.original_filename.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      const getScore = (r) => r.analysis ? r.analysis.ats_score : 0;
      if (sortField === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortField === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortField === 'highest_ats') return getScore(b) - getScore(a);
      if (sortField === 'lowest_ats') return getScore(a) - getScore(b);
      if (sortField === 'alphabetical') return a.original_filename.localeCompare(b.original_filename);
      return 0;
    });

    return result;
  }, [resumes, search, sortField]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedResumes.length / itemsPerPage);
  const currentResumes = filteredAndSortedResumes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resume Manager</h1>
        <p className="text-muted-foreground">Upload and manage your resumes for AI analysis.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="w-full border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-3 text-muted-foreground bg-secondary/30 hover:bg-secondary transition-colors">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {file ? file.name : "Drag and drop or click to upload PDF"}
                </span>
              </div>
            </div>
            <Button type="submit" disabled={!file} isLoading={uploading}>
              Upload Resume
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search resumes..." 
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
          <option value="highest_ats">Highest ATS Score</option>
          <option value="lowest_ats">Lowest ATS Score</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : filteredAndSortedResumes.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="No Resumes Found" 
            description={search ? "Try adjusting your search filters." : "You haven't uploaded any resumes yet."} 
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentResumes.map(resume => (
              <Card key={resume.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-sm">{resume.original_filename}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded on{" "}
                        {resume.created_at
                          ? new Date(resume.created_at).toLocaleDateString()
                          : "Unknown"}
                      </p>

                      {resume.analysis && (
                        <div className="mt-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded w-max border border-green-500/20">
                          ATS Score: {resume.analysis.ats_score}/100
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button variant="secondary" size="sm" onClick={() => handleAnalyze(resume.id)}>
                      <Play className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                    <Link to={`/resumes/${resume.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(resume.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

      <ConfirmDialog 
        isOpen={!!deleteId} 
        title="Delete Resume" 
        message="Are you sure you want to delete this resume? This action cannot be undone and will delete all associated AI analyses and job match histories."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleting}
      />
    </div>
  );
}

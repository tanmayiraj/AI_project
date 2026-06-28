import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Loader2, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = isLength && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isValid) {
      setError('Please meet all password strength requirements.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      // Auto-redirect to login with success message, or auto-login
      navigate('/login');
    } catch (err) {
      // Fastapi returns details in err.response.data.detail or standard error
      let msg = 'Failed to register account.';
      if (err.response?.data?.detail) {
        msg = Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500"></div>
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">Create an account</h2>
          <p className="text-center text-muted-foreground text-sm mb-6">Start building your AI Career Copilot</p>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground mb-1">Password requirements:</p>
              <div className="flex items-center gap-2 text-xs">
                {isLength ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-muted-foreground" />}
                <span className={isLength ? "text-foreground" : "text-muted-foreground"}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasUpper ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-muted-foreground" />}
                <span className={hasUpper ? "text-foreground" : "text-muted-foreground"}>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasLower ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-muted-foreground" />}
                <span className={hasLower ? "text-foreground" : "text-muted-foreground"}>One lowercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasNumber ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-muted-foreground" />}
                <span className={hasNumber ? "text-foreground" : "text-muted-foreground"}>One number</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !isValid}
              className="w-full mt-4 py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

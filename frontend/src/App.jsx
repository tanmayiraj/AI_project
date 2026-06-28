import { useState, useEffect } from 'react'
import { Briefcase, LayoutDashboard, FileText, Upload, Settings, Menu, X, Moon, Sun } from 'lucide-react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Briefcase className="w-6 h-6" />
            <span>AI Copilot</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Upload className="w-5 h-5" />
            Upload Resume
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <FileText className="w-5 h-5" />
            Cover Letters
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <h4 className="font-semibold text-sm mb-1 text-foreground">Pro Features</h4>
            <p className="text-xs text-muted-foreground mb-3">Upgrade to unlock AI Mock Interviews</p>
            <button className="w-full text-xs font-medium bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-card/50 backdrop-blur-md border-b border-border z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John!</h1>
              <p className="text-muted-foreground">Here is an overview of your career progress.</p>
            </div>

            {/* Dashboard Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average ATS Score</p>
                    <h3 className="text-3xl font-bold text-foreground mt-1">84%</h3>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[84%] rounded-full"></div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resumes Analyzed</p>
                    <h3 className="text-3xl font-bold text-foreground mt-1">12</h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Upload className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Last upload: 2 days ago</p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Skill Gap Alert</p>
                    <h3 className="text-lg font-bold text-foreground mt-1">React, GraphQL</h3>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                    <Settings className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Highly requested in recent job descriptions.</p>
              </div>
            </div>

            {/* Placeholders for Future Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="h-64 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-6 bg-card/50">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Upload a Resume</h3>
                <p className="text-sm text-muted-foreground mb-4">Drag and drop your PDF here to get AI-powered insights.</p>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium rounded-md transition-colors">
                  Select File
                </button>
              </div>

              <div className="h-64 rounded-xl border border-border flex flex-col p-6 bg-card shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Briefcase className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent AI Feedback</h3>
                <div className="space-y-4 flex-1 overflow-hidden">
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0"></div>
                    <p className="text-sm text-muted-foreground line-clamp-2">Great emphasis on leadership in your latest product manager resume!</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-destructive shrink-0"></div>
                    <p className="text-sm text-muted-foreground line-clamp-2">Missing critical keyword: <span className="font-medium text-foreground">PostgreSQL</span> based on the JD.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0"></div>
                    <p className="text-sm text-muted-foreground line-clamp-2">Consider quantifying your achievements in the Google experience section.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default App

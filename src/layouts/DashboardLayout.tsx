import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Compass, FileText, Palette, Globe, Target, BarChart2, MessageSquare, 
  Settings, CreditCard, LogOut, Moon, Sun, ChevronDown, Sparkles, 
  Menu, X, ShieldAlert, FolderKanban, Search, Bell, UserCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, workspace, workspaces, theme, logout, 
    switchWorkspace, toggleTheme, createWorkspace 
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [wspDropdownOpen, setWspDropdownOpen] = useState(false);
  const [newWspModalOpen, setNewWspModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // New workspace form states
  const [wspName, setWspName] = useState('');
  const [wspIndustry, setWspIndustry] = useState('');
  const [wspDesc, setWspDesc] = useState('');
  const [wspTarget, setWspTarget] = useState('');

  const currentPath = location.pathname;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const founderNavItems = [
    { name: 'Dashboard Hub',     path: '/',             icon: <Compass className="w-4 h-4" /> },
    { name: 'Idea Validator',    path: '/validator',    icon: <BarChart2 className="w-4 h-4" /> },
    { name: 'Business Plan',     path: '/business-plan',icon: <FileText className="w-4 h-4" /> },
    { name: 'Brand Kit',         path: '/branding',     icon: <Palette className="w-4 h-4" /> },
    { name: 'Website Copy',      path: '/website',      icon: <Globe className="w-4 h-4" /> },
    { name: 'Marketing Hub',     path: '/marketing',    icon: <Target className="w-4 h-4" /> },
    { name: 'Pitch Deck',        path: '/pitch-deck',   icon: <FolderKanban className="w-4 h-4" /> },
    { name: 'AI Startup Mentor', path: '/mentor',       icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const teamMemberNavItems = [
    { name: 'Team Dashboard',    path: '/',             icon: <Compass className="w-4 h-4" /> },
    { name: 'Business Plan',     path: '/business-plan',icon: <FileText className="w-4 h-4" /> },
    { name: 'Brand Kit',         path: '/branding',     icon: <Palette className="w-4 h-4" /> },
    { name: 'Website Copy',      path: '/website',      icon: <Globe className="w-4 h-4" /> },
    { name: 'Marketing Hub',     path: '/marketing',    icon: <Target className="w-4 h-4" /> },
    { name: 'Pitch Deck',        path: '/pitch-deck',   icon: <FolderKanban className="w-4 h-4" /> },
    { name: 'AI Startup Mentor', path: '/mentor',       icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const adminNavItems = [
    { name: 'Platform Admin',    path: '/admin',        icon: <ShieldAlert className="w-4 h-4" /> }
  ];

  const displayNavItems =
    user?.role === 'ADMIN'       ? adminNavItems :
    user?.role === 'TEAM_MEMBER' ? teamMemberNavItems :
    founderNavItems;


  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wspName || !wspIndustry) return;
    await createWorkspace(wspName, wspIndustry, wspDesc, wspTarget);
    setNewWspModalOpen(false);
    setWspName('');
    setWspIndustry('');
    setWspDesc('');
    setWspTarget('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark flex flex-row">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        animate={{ 
          width: isMobile 
            ? (sidebarOpen ? 260 : 0) 
            : (isCollapsed ? 68 : 260),
          opacity: isMobile 
            ? (sidebarOpen ? 1 : 0) 
            : 1
        }}
        transition={{ duration: 0.2 }}
        className="fixed md:relative z-40 top-0 bottom-0 left-0 bg-white dark:bg-sidebar-bg border-r border-slate-200 dark:border-sidebar-border flex flex-col h-screen overflow-hidden shrink-0"
      >
        {/* Workspace Selector */}
        <div className="p-4 border-b border-slate-200 dark:border-sidebar-border relative">
          <div className="flex items-center justify-between gap-1">
            <button 
              disabled={isCollapsed}
              onClick={() => setWspDropdownOpen(!wspDropdownOpen)}
              className={`flex-1 flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left group ${
                isCollapsed ? 'justify-center p-1' : ''
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {workspace?.name.charAt(0) || 'S'}
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm truncate">{workspace?.name || 'Loading...'}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{workspace?.industry || 'StartupOS'}</p>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />}
            </button>

            {isMobile && sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Workspace Dropdown */}
          {!isCollapsed && (
            <AnimatePresence>
              {wspDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setWspDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-4 right-4 mt-2 bg-white dark:bg-[#12131d] border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xl z-20 py-2"
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Switch Workspace</p>
                    {workspaces.map(w => (
                      <button
                        key={w.id}
                        onClick={() => {
                          switchWorkspace(w.id);
                          setWspDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
                          w.id === workspace?.id ? 'text-brand-500 font-semibold bg-brand-500/5' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{w.name}</span>
                        {w.id === workspace?.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800/60 my-1" />
                    <button
                      onClick={() => {
                        setNewWspModalOpen(true);
                        setWspDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-brand-500 font-medium hover:bg-brand-500/5 transition-colors flex items-center gap-1.5"
                    >
                      + Create New Workspace
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {displayNavItems.map(item => {
            const isActive = currentPath === item.path;
            const isAdminItem = item.path === '/admin';
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 group ${
                  isCollapsed ? 'justify-center px-2' : ''
                } ${
                  isActive 
                    ? (isAdminItem ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' : 'bg-brand-500/10 text-brand-500 dark:text-brand-400')
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </div>

        {/* User profile & Actions footer */}
        <div className="p-4 border-t border-slate-200 dark:border-sidebar-border bg-slate-50/40 dark:bg-slate-900/20">
          <Link
            to="/profile"
            className={`flex items-center gap-2 p-2 rounded-xl transition-colors mb-2 ${
              isCollapsed ? 'justify-center p-1' : ''
            } ${
              currentPath === '/profile'
                ? 'bg-brand-500/10 text-brand-500'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title={isCollapsed ? "View Profile" : undefined}
          >
            <img 
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || 'User'}`} 
              alt={user?.firstName} 
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white shrink-0"
            />
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <h5 className="text-xs font-semibold truncate leading-tight">{user?.firstName} {user?.lastName}</h5>
                  {user?.role && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      user.role === 'ADMIN' ? 'bg-rose-500/15 text-rose-500' :
                      user.role === 'FOUNDER' ? 'bg-brand-500/15 text-brand-500' :
                      'bg-amber-500/15 text-amber-500'
                    }`}>
                      {user.role === 'FOUNDER' ? 'Founder' : user.role === 'TEAM_MEMBER' ? 'Team' : 'Admin'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate capitalize flex items-center gap-1 mt-0.5">
                  <UserCircle className="w-3 h-3" /> View Profile
                </p>
              </div>
            )}
          </Link>

          <div className={`flex items-center justify-end gap-1 ${isCollapsed ? 'flex-col justify-center gap-2 mt-2' : 'justify-end'}`}>
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 dark:text-slate-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative bg-bg-light dark:bg-bg-dark">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 bg-white/70 dark:bg-bg-dark/70 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (isMobile) {
                  setSidebarOpen(!sidebarOpen);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
              {isMobile ? (
                sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />
              ) : (
                isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span className="hover:text-slate-200 transition-colors truncate max-w-[120px]">{workspace?.name}</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold capitalize">
                {currentPath === '/' ? 'Dashboard Hub' : currentPath.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simple search box */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-48 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 pl-8 pr-3 text-xs focus:outline-none focus:border-brand-500 transition-all focus:w-60 text-slate-200"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-20 p-3"
                    >
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace Notifications</h4>
                      <div className="space-y-2">
                        <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg text-xs leading-relaxed transition-colors">
                          <span className="font-semibold text-brand-500">AI Mentor:</span> Ideas generated for your go-to-market launch plan.
                        </div>
                        <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg text-xs leading-relaxed transition-colors">
                          <span className="font-semibold text-emerald-500">System:</span> California SB-253 reference document fully indexed.
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content View with Page transitions */}
        <div className="flex-1 p-6 relative">
          {children}
        </div>
      </main>

      {/* New Workspace Modal */}
      <AnimatePresence>
        {newWspModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Startup Workspace</h3>
                <button 
                  onClick={() => setNewWspModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Startup Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. EcoSphere AI" 
                    value={wspName}
                    onChange={(e) => setWspName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Industry *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Sustainability Tech, FinTech" 
                    value={wspIndustry}
                    onChange={(e) => setWspIndustry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Target Audience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SMBs, B2B companies" 
                    value={wspTarget}
                    onChange={(e) => setWspTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    placeholder="Provide a brief summary of what your startup does." 
                    rows={3}
                    value={wspDesc}
                    onChange={(e) => setWspDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setNewWspModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

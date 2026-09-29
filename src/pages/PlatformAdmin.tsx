import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { SystemStats, WorkspaceAdminInfo } from '../types';
import { 
  ShieldAlert, Users, FolderKanban, DollarSign, Activity, 
  TrendingUp, Clock, Search, MoreHorizontal, Loader2,
  CheckCircle2, CreditCard, Trash2, Edit, X, AlertTriangle
} from 'lucide-react';

export const PlatformAdmin: React.FC = () => {
  const { user } = useApp();
  
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchWsp, setSearchWsp] = useState('');
  const [searchUser, setSearchUser] = useState('');

  // Action Modals State
  const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [deleteWorkspaceModal, setDeleteWorkspaceModal] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [editPlanModal, setEditPlanModal] = useState<{ isOpen: boolean; workspace: WorkspaceAdminInfo | null }>({ isOpen: false, workspace: null });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dropdown States
  const [activeUserDropdown, setActiveUserDropdown] = useState<string | null>(null);
  const [activeWorkspaceDropdown, setActiveWorkspaceDropdown] = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    api.getStats()
      .then(data => {
        setStats(data);
      })
      .catch(err => {
        setError(err.message || 'Failed to load stats');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await api.deleteUser(deleteUserModal.id);
      setDeleteUserModal({ isOpen: false, id: '', name: '' });
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      setActionLoading(true);
      await api.deleteWorkspace(deleteWorkspaceModal.id);
      setDeleteWorkspaceModal({ isOpen: false, id: '', name: '' });
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete workspace');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editPlanModal.workspace) return;
    
    const formData = new FormData(e.currentTarget);
    const newPlan = formData.get('plan') as string;
    
    try {
      setActionLoading(true);
      await api.updateWorkspacePlan(editPlanModal.workspace.id, newPlan);
      setEditPlanModal({ isOpen: false, workspace: null });
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-500">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-500">Loading system statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Data</h2>
        <p className="text-slate-500">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const filteredWorkspaces = (stats.workspacesList || []).filter(w => 
    w.name.toLowerCase().includes(searchWsp.toLowerCase()) || 
    (w.userEmail && w.userEmail.toLowerCase().includes(searchWsp.toLowerCase()))
  );

  const filteredUsers = (stats.recentSignups || []).filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative" onClick={() => {
      setActiveUserDropdown(null);
      setActiveWorkspaceDropdown(null);
    }}>
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> System Admin
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Operations</h2>
          <p className="text-slate-400 text-xs mt-1">
            Global metrics, subscription tracking, and system health.
          </p>
        </div>
        
        <button onClick={fetchStats} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors border border-slate-700 flex items-center gap-2">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
          Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats.totalUsers}</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Users</p>
        </div>

        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            {stats.totalRevenue > 0 && (
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded"><TrendingUp className="w-3 h-3" /> Live</span>
            )}
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">${stats.totalRevenue}/mo</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform MRR</p>
        </div>

        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg">
              <FolderKanban className="w-5 h-5 text-fuchsia-500" />
            </div>
            <div className="flex gap-1">
              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">PRO: {stats.planDistribution?.['PRO'] || 0}</span>
              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">ENT: {stats.planDistribution?.['ENTERPRISE'] || 0}</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats.activeWorkspaces}</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Workspaces</p>
        </div>

        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{(stats.tokenUsage / 1000).toFixed(1)}k</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tokens Computed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Left Column (Workspaces & Users) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workspaces Table */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-brand-500" /> Workspace Subscriptions
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search workspaces..."
                  value={searchWsp}
                  onChange={(e) => setSearchWsp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-brand-500 text-slate-200"
                />
              </div>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800/60">
                    <th className="px-5 py-3">Workspace Details</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Token Usage</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/60 relative">
                  {filteredWorkspaces.map(w => {
                    const pct = Math.min(100, Math.round((w.creditsUsed / w.creditsLimit) * 100));
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 dark:text-white mb-0.5">{w.name}</div>
                          <div className="text-[10px] text-slate-500">{w.userEmail || 'No owner email'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border
                            ${w.activePlan === 'ENTERPRISE' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 
                              w.activePlan === 'PRO' ? 'bg-brand-500/10 text-brand-500 border-brand-500/20' : 
                              'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                          >
                            {w.activePlan}
                          </span>
                        </td>
                        <td className="px-5 py-4 w-48">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
                            <span>{w.creditsUsed.toLocaleString()}</span>
                            <span>{w.creditsLimit.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveWorkspaceDropdown(activeWorkspaceDropdown === w.id ? null : w.id);
                              setActiveUserDropdown(null);
                            }}
                            className="p-1 text-slate-400 hover:text-brand-500 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {activeWorkspaceDropdown === w.id && (
                            <div className="absolute right-8 top-8 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                              <button 
                                onClick={() => setEditPlanModal({ isOpen: true, workspace: w })}
                                className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit Billing Plan
                              </button>
                              <button 
                                onClick={() => setDeleteWorkspaceModal({ isOpen: true, id: w.id, name: w.name })}
                                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Workspace
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredWorkspaces.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-500">No workspaces found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-fuchsia-500" /> Platform Users
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search users..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-brand-500 text-slate-200"
                />
              </div>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800/60">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/60 relative">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt="avatar" className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white mb-0.5">{u.name}</div>
                            <div className="text-[10px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border
                            ${u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                              u.role === 'FOUNDER' ? 'bg-brand-500/10 text-brand-500 border-brand-500/20' : 
                              'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                          >
                            {u.role}
                          </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {u.joined}
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveUserDropdown(activeUserDropdown === u.id ? null : u.id);
                            setActiveWorkspaceDropdown(null);
                          }}
                          className="p-1 text-slate-400 hover:text-brand-500 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {activeUserDropdown === u.id && (
                          <div className="absolute right-8 top-8 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                            <button 
                              onClick={() => setDeleteUserModal({ isOpen: true, id: u.id, name: u.name })}
                              className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete User Account
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Global Activity Feed) */}
        <div className="space-y-6 flex flex-col h-[calc(100vh-140px)] sticky top-6">
          {/* Activity Feed */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm flex-1 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" /> System Audit Log
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
              {(stats.activityLogs || []).length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-8">No system activity.</div>
              ) : (
                stats.activityLogs.map(log => (
                  <div key={log.id} className="relative pl-4 pb-1">
                    <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute left-[3px] top-4 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                    
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white font-bold">{log.userName}</strong>{' '}
                      {log.action}
                    </p>
                    {log.details && (
                      <p className="text-[10px] text-slate-500 mt-1 mb-1">{log.details}</p>
                    )}
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Delete User Modal */}
      {deleteUserModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to permanently delete the account for <strong>{deleteUserModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteUserModal({ isOpen: false, id: '', name: '' })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Workspace Modal */}
      {deleteWorkspaceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Workspace</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to completely delete <strong>{deleteWorkspaceModal.name}</strong> and all its associated data? This is irreversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteWorkspaceModal({ isOpen: false, id: '', name: '' })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteWorkspace}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editPlanModal.isOpen && editPlanModal.workspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-brand-500" /> Override Billing Plan
              </h3>
              <button onClick={() => setEditPlanModal({ isOpen: false, workspace: null })} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdatePlan} className="p-6">
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Workspace</label>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{editPlanModal.workspace.name}</div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Subscription Tier</label>
                <div className="space-y-2">
                  {['FREE', 'PRO', 'ENTERPRISE'].map(plan => (
                    <label key={plan} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      editPlanModal.workspace?.activePlan === plan 
                        ? 'border-brand-500 bg-brand-500/5' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                      <input 
                        type="radio" 
                        name="plan" 
                        value={plan} 
                        defaultChecked={editPlanModal.workspace?.activePlan === plan}
                        className="text-brand-500 focus:ring-brand-500 w-4 h-4" 
                      />
                      <span className="ml-3 text-sm font-semibold text-slate-900 dark:text-white">{plan}</span>
                      {plan === 'FREE' && <span className="ml-auto text-xs text-slate-500">1k limit</span>}
                      {plan === 'PRO' && <span className="ml-auto text-xs text-brand-500 font-medium">10k limit</span>}
                      {plan === 'ENTERPRISE' && <span className="ml-auto text-xs text-indigo-500 font-medium">100k limit</span>}
                    </label>
                  ))}
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 text-sm font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Plan Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Project, 
  ProjectTask, 
  TaskStatus, 
  TaskPriority, 
  ScopeCheckResponse,
  ClientReportRequest,
  ClientReportResponse
} from '../types';
import { 
  FolderKanban, 
  Plus, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Copy, 
  Check, 
  Sparkles, 
  X,
  Trash2,
  Calendar,
  Layers,
  FileText,
  FileBarChart,
  Mail,
  Printer
} from 'lucide-react';

interface ProjectWorkspaceProps {
  projectId: string;
  onBackToOpportunities?: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ 
  projectId,
  onBackToOpportunities
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New task modal state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskHours, setNewTaskHours] = useState(4.0);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  // Log hours modal state
  const [loggingTask, setLoggingTask] = useState<ProjectTask | null>(null);
  const [loggedHoursInput, setLoggedHoursInput] = useState<number>(0);

  // Scope Guard state
  const [isScopeGuardOpen, setIsScopeGuardOpen] = useState(false);
  const [scopeRequestText, setScopeRequestText] = useState('');
  const [scopeClientName, setScopeClientName] = useState('');
  const [analyzingScope, setAnalyzingScope] = useState(false);
  const [scopeAnalysisResult, setScopeAnalysisResult] = useState<ScopeCheckResponse | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [convertingScope, setConvertingScope] = useState(false);

  // Client Status Hub state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'weekly_update' | 'milestone_signoff' | 'blocker_alert'>('weekly_update');
  const [reportNotes, setReportNotes] = useState('');
  const [reportClientName, setReportClientName] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ClientReportResponse | null>(null);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleGenerateReport = async () => {
    if (!project) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          custom_notes: reportNotes.trim() || undefined,
          client_name: reportClientName.trim() || undefined
        })
      });
      if (!res.ok) throw new Error('Failed to generate client report');
      const data: ClientReportResponse = await res.json();
      setGeneratedReport(data);
    } catch (err: any) {
      alert(`Report Generation Error: ${err.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to load project details');
      const data: Project = await res.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Error loading project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project) return;

    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim(),
          status: newTaskStatus,
          priority: newTaskPriority,
          estimated_hours: newTaskHours,
          actual_hours: 0.0
        })
      });

      if (!res.ok) throw new Error('Failed to create task');
      setIsNewTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      fetchProject();
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
    }
  };

  const handleUpdateTaskStatus = async (task: ProjectTask, newStatus: TaskStatus) => {
    if (!project) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update task status');
      fetchProject();
    } catch (err: any) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  const handleSaveLoggedHours = async () => {
    if (!project || !loggingTask) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/tasks/${loggingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_hours: Number(loggedHoursInput) })
      });
      if (!res.ok) throw new Error('Failed to log hours');
      setLoggingTask(null);
      fetchProject();
    } catch (err: any) {
      alert(`Error saving hours: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project || !confirm('Delete this task?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchProject();
    } catch (err: any) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  const handleUpdateProjectStatus = async (newStatus: string) => {
    if (!project) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update project status');
      fetchProject();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleRunScopeCheck = async () => {
    if (!project || !scopeRequestText.trim()) return;
    setAnalyzingScope(true);
    setScopeAnalysisResult(null);

    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/scope-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_request_text: scopeRequestText.trim(),
          client_name: scopeClientName.trim() || 'Client'
        })
      });
      if (!res.ok) throw new Error('Scope evaluation failed');
      const data: ScopeCheckResponse = await res.json();
      setScopeAnalysisResult(data);
    } catch (err: any) {
      alert(`Scope Guard Error: ${err.message}`);
    } finally {
      setAnalyzingScope(false);
    }
  };

  const handleConvertScopeToTasks = async () => {
    if (!project || !scopeAnalysisResult) return;
    setConvertingScope(true);
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${project.id}/convert-scope-to-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scopeAnalysisResult)
      });
      if (!res.ok) throw new Error('Failed to convert scope items to tasks');
      alert('Scope changes successfully converted into project tasks!');
      setIsScopeGuardOpen(false);
      setScopeRequestText('');
      setScopeAnalysisResult(null);
      fetchProject();
    } catch (err: any) {
      alert(`Conversion Error: ${err.message}`);
    } finally {
      setConvertingScope(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mr-3"></div>
        Loading project execution workspace...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-xl m-6">
        <p className="font-semibold mb-2">Error loading project</p>
        <p className="text-sm mb-4">{error || 'Project not found.'}</p>
        {onBackToOpportunities && (
          <button 
            onClick={onBackToOpportunities}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
          >
            Back to Opportunities
          </button>
        )}
      </div>
    );
  }

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
    { status: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
    { status: 'review', label: 'In Review', color: 'bg-amber-50 text-amber-700' },
    { status: 'done', label: 'Done', color: 'bg-emerald-50 text-emerald-700' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-3">
            {onBackToOpportunities && (
              <button 
                onClick={onBackToOpportunities}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
              >
                ← Back
              </button>
            )}
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-indigo-600" />
              {project.title}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl line-clamp-1">
            {project.description || 'Active delivery execution workspace.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm text-sm">
            <span className="text-xs font-bold uppercase text-slate-400">Status:</span>
            <select
              value={project.status}
              onChange={(e) => handleUpdateProjectStatus(e.target.value)}
              className="font-semibold text-slate-800 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="active">🟢 Active</option>
              <option value="on_hold">🟡 On Hold</option>
              <option value="completed">🔵 Completed</option>
              <option value="cancelled">🔴 Cancelled</option>
            </select>
          </div>

          {/* Scope Guard Trigger */}
          <button
            onClick={() => setIsScopeGuardOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg shadow-sm transition"
          >
            <ShieldAlert className="w-4 h-4" />
            Scope Guard Inspector
          </button>

          {/* Client Status Hub Trigger */}
          <button
            onClick={() => {
              setIsReportModalOpen(true);
              if (!generatedReport) {
                handleGenerateReport();
              }
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-sm rounded-lg shadow-sm transition"
          >
            <FileBarChart className="w-4 h-4" />
            Client Status Hub
          </button>

          {/* Add Task Quick Trigger */}
          <button
            onClick={() => {
              setNewTaskStatus('todo');
              setIsNewTaskOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Overall Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{project.progress_percent}%</span>
            <span className="text-xs text-slate-500">
              ({project.tasks_completed_count}/{project.tasks_count} tasks done)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${project.progress_percent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Hours Logged</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{project.actual_hours.toFixed(1)}</span>
            <span className="text-xs text-slate-500">/ {project.estimated_hours.toFixed(1)} hrs planned</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Rate: ${project.hourly_rate}/hr
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Project Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">
              ${project.total_budget.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 uppercase font-medium">
            Model: {project.pricing_model.replace('_', ' ')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Scope Health</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
              Baseline Locked
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {project.tasks.filter(t => t.is_scope_change).length} change order tasks active
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTasks = project.tasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 min-h-[550px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-full w-5 h-5 flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNewTaskStatus(col.status);
                    setIsNewTaskOpen(true);
                  }}
                  className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-white transition"
                  title="Add task in this lane"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task Cards */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300 text-xs italic p-4 text-center">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow transition relative group"
                    >
                      {/* Scope change tag */}
                      {task.is_scope_change && (
                        <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Scope Change
                        </div>
                      )}

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Hours & Priority Details */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                        <button
                          onClick={() => {
                            setLoggingTask(task);
                            setLoggedHoursInput(task.actual_hours || 0);
                          }}
                          className="flex items-center gap-1 font-medium hover:text-indigo-600 transition"
                          title="Click to log hours"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.actual_hours || 0}h / {task.estimated_hours}h</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                            task.priority === 'high' ? 'bg-amber-50 text-amber-600' :
                            task.priority === 'medium' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 transition"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lane Move Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1 text-slate-400">
                        {col.status !== 'todo' ? (
                          <button
                            onClick={() => {
                              const order: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
                              const currIdx = order.indexOf(task.status);
                              if (currIdx > 0) handleUpdateTaskStatus(task, order[currIdx - 1]);
                            }}
                            className="text-[11px] flex items-center hover:text-indigo-600 transition"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                          </button>
                        ) : <div />}

                        {col.status !== 'done' && (
                          <button
                            onClick={() => {
                              const order: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
                              const currIdx = order.indexOf(task.status);
                              if (currIdx < order.length - 1) handleUpdateTaskStatus(task, order[currIdx + 1]);
                            }}
                            className="text-[11px] flex items-center hover:text-indigo-600 transition font-medium text-slate-600"
                            title="Move right"
                          >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL 1: Create New Task --- */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Add Project Task</h3>
              <button 
                onClick={() => setIsNewTaskOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement user authentication middleware"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detailed acceptance criteria or implementation notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Lane
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Log Hours --- */}
      {loggingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-slate-900 text-lg">Log Actual Hours</h3>
            <p className="text-xs text-slate-500 mt-1">{loggingTask.title}</p>

            <div className="my-5">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Actual Hours Spent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={loggedHoursInput}
                  onChange={(e) => setLoggedHoursInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-base font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-sm font-semibold text-slate-400">hours</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Planned estimate: {loggingTask.estimated_hours}h
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLoggingTask(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLoggedHours}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                Save Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Scope Guard / Change Request Inspector --- */}
      {isScopeGuardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-lg">
                  Scope Guard: Change Request Inspector
                </h3>
              </div>
              <button 
                onClick={() => setIsScopeGuardOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Paste any new email, Slack message, or feature request from the client. Scope Guard audits it 
                against your locked baseline Statement of Work to prevent unpaid scope creep and formulate professional change orders.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Client Communication Text *
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={scopeClientName}
                    onChange={(e) => setScopeClientName(e.target.value)}
                    placeholder="Client name"
                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <textarea
                value={scopeRequestText}
                onChange={(e) => setScopeRequestText(e.target.value)}
                placeholder="e.g. 'Can we also add a native iOS app with barcode scanning, Stripe Apple Pay subscriptions, and real-time push notifications?'"
                rows={4}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <button
                onClick={handleRunScopeCheck}
                disabled={analyzingScope || !scopeRequestText.trim()}
                className="w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                {analyzingScope ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Auditing Request Against Baseline WBS...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Audit Scope Creep & Impact
                  </>
                )}
              </button>
            </div>

            {/* Scope Guard Results */}
            {scopeAnalysisResult && (
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                {/* Status Alert Banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  scopeAnalysisResult.is_scope_creep 
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}>
                  {scopeAnalysisResult.is_scope_creep ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm uppercase tracking-wide">
                        {scopeAnalysisResult.is_scope_creep ? '⚠️ Scope Expansion Detected' : '✅ Request is In-Scope'}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                        {Math.round(scopeAnalysisResult.confidence_score * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs mt-1.5 leading-relaxed">
                      {scopeAnalysisResult.analysis_summary}
                    </p>
                  </div>
                </div>

                {/* Scope Creep Financial Impact Details */}
                {scopeAnalysisResult.is_scope_creep && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Estimated Impact</span>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        +{scopeAnalysisResult.estimated_impact_hours.toFixed(1)} hrs
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Suggested Change Order</span>
                      <div className="text-lg font-black text-amber-600 mt-0.5">
                        +${scopeAnalysisResult.suggested_change_order_cost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-Drafted Client Response Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Recommended Client Response
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scopeAnalysisResult.suggested_client_response);
                        setCopiedDraft(true);
                        setTimeout(() => setCopiedDraft(false), 2000);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      {copiedDraft ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Draft
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={scopeAnalysisResult.suggested_client_response}
                    rows={6}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 leading-relaxed outline-none"
                  />
                </div>

                {/* Convert to tasks action */}
                {scopeAnalysisResult.is_scope_creep && (
                  <button
                    onClick={handleConvertScopeToTasks}
                    disabled={convertingScope}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Convert Out-of-Scope Items into Project Tasks (Change Order)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 4: Client Communications & Status Reporting Hub --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-lg">
                  Client Communications & Status Reporting Hub
                </h3>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Type Selector Pills */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Select Report Objective
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportType('weekly_update');
                    setGeneratedReport(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    reportType === 'weekly_update' 
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">📈 Weekly Progress</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Sprint accomplishments, active hours burn, and upcoming deliverables.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReportType('milestone_signoff');
                    setGeneratedReport(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    reportType === 'milestone_signoff' 
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">🎯 Milestone Sign-Off</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Formal deliverable sign-off request with approval button and billing terms.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReportType('blocker_alert');
                    setGeneratedReport(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    reportType === 'blocker_alert' 
                      ? 'border-red-600 bg-red-50/60 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">⚠️ Blocker Alert</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Urgent notification for missing API keys, client credentials, or decisions.
                  </div>
                </button>
              </div>

              {/* Optional Custom Notes & Client Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={reportClientName}
                    onChange={(e) => setReportClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Custom Context / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="e.g. Staging deployment URL ready for smoke testing"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating Grounded Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Generate Grounded Client Update
                  </>
                )}
              </button>
            </div>

            {/* Generated Report Preview Area */}
            {generatedReport && (
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                {/* Metrics Header */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Hours Tracked</span>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {generatedReport.total_actual_hours.toFixed(1)}h / {generatedReport.total_estimated_hours.toFixed(1)}h
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Utilized</span>
                    <div className="text-sm font-black text-emerald-600 mt-0.5">
                      ${generatedReport.budget_burned.toLocaleString()} ({generatedReport.budget_burn_percent}%)
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Generated</span>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      {generatedReport.generated_at}
                    </div>
                  </div>
                </div>

                {/* Subject Line Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Email Subject
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReport.email_subject);
                        setCopiedSubject(true);
                        setTimeout(() => setCopiedSubject(false), 2000);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      {copiedSubject ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Subject
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={generatedReport.email_subject}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                {/* Markdown Email Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Client Communication Body
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReport.email_body_markdown);
                        setCopiedBody(true);
                        setTimeout(() => setCopiedBody(false), 2000);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      {copiedBody ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Body!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Email Body
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={generatedReport.email_body_markdown}
                    rows={8}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 leading-relaxed outline-none"
                  />
                </div>

                {/* Printable / Clean Client PDF Export */}
                <div className="pt-2">
                  <a
                    href={`http://localhost:8000/api/projects/${project.id}/reports/export-html?report_type=${reportType}&client_name=${encodeURIComponent(reportClientName || 'Client')}&print=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Open Print-Ready Vector Client Report (PDF)
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

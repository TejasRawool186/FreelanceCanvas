import React, { useState, useEffect } from 'react';
import { X, Activity, Database, HardDrive, Cpu, BookOpen, Volume2, Search, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, Server } from 'lucide-react';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health/detailed');
      if (!res.ok) {
        throw new Error(`Health probe returned HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to query subsystem telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'ready':
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {status.toUpperCase()}
          </span>
        );
      case 'degraded':
      case 'unconfigured':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-400">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {status ? status.toUpperCase() : 'OFFLINE'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_#0f172a] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-slate-900 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                System Diagnostics & Telemetry
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Live operational health across database, storage, RAG, and AI subsystems
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-200 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border-2 border-rose-600 text-rose-700 font-semibold text-sm">
              Telemetry Error: {error}
            </div>
          )}

          {data && (
            <>
              {/* Overall Status Banner */}
              <div className={`p-4 border-2 border-slate-900 flex items-center justify-between ${
                data.status === 'healthy' ? 'bg-emerald-50' : data.status === 'degraded' ? 'bg-amber-50' : 'bg-rose-50'
              }`}>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">Overall System Health</span>
                  <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {getStatusBadge(data.status)}
                    <span className="text-sm font-semibold text-slate-600">
                      {data.status === 'healthy' && 'All primary subsystems operating at peak nominal capacity.'}
                      {data.status === 'degraded' && 'System operational with honest offline fallbacks engaged.'}
                      {data.status === 'unhealthy' && 'Critical dependencies require operator intervention.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchDiagnostics}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border-2 border-slate-900 text-xs font-bold uppercase shadow-[2px_2px_0px_#0f172a] cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Subsystems Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Database */}
                <div className="p-4 border-2 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-black uppercase text-slate-900">Database Engine</span>
                    </div>
                    {getStatusBadge(data.subsystems?.database?.status)}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-semibold">Engine:</span>
                      <span className="font-mono text-slate-900">{data.subsystems?.database?.engine || 'SQLite'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Roundtrip Latency:</span>
                      <span className="font-mono text-slate-900">{data.subsystems?.database?.latency_ms ?? '--'} ms</span>
                    </div>
                    {data.subsystems?.database?.tables && (
                      <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                        <div>Opps: <strong className="text-slate-900">{data.subsystems.database.tables.opportunities}</strong></div>
                        <div>Proposals: <strong className="text-slate-900">{data.subsystems.database.tables.proposals}</strong></div>
                        <div>Projects: <strong className="text-slate-900">{data.subsystems.database.tables.projects}</strong></div>
                        <div>Invoices: <strong className="text-slate-900">{data.subsystems.database.tables.invoices}</strong></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Disk Storage */}
                <div className="p-4 border-2 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black uppercase text-slate-900">Disk Storage</span>
                    </div>
                    {getStatusBadge(data.subsystems?.storage?.status)}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {data.subsystems?.storage?.directories && Object.entries(data.subsystems.storage.directories).map(([key, item]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold uppercase">{key}:</span>
                        <span className={`font-mono font-bold ${item.writable ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {item.writable ? 'WRITABLE' : 'READ-ONLY/ERR'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Ollama LLM */}
                <div className="p-4 border-2 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-black uppercase text-slate-900">Ollama AI Compute</span>
                    </div>
                    {getStatusBadge(data.subsystems?.ollama_llm?.status)}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-semibold">Endpoint:</span>
                      <span className="font-mono text-slate-900 truncate max-w-[160px]">{data.subsystems?.ollama_llm?.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Configured Model:</span>
                      <span className="font-mono font-bold text-slate-900">{data.subsystems?.ollama_llm?.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Latency:</span>
                      <span className="font-mono text-slate-900">{data.subsystems?.ollama_llm?.latency_ms ?? 'N/A'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      Deterministic structured fallbacks are ready if Ollama is unreachable.
                    </div>
                  </div>
                </div>

                {/* 4. Portfolio RAG Store */}
                <div className="p-4 border-2 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-black uppercase text-slate-900">Evidence RAG Store</span>
                    </div>
                    {getStatusBadge(data.subsystems?.rag_portfolio?.status)}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-semibold">Engine Architecture:</span>
                      <span className="font-mono text-slate-900">{data.subsystems?.rag_portfolio?.engine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Case Studies Indexed:</span>
                      <span className="font-mono font-bold text-slate-900">{data.subsystems?.rag_portfolio?.case_studies_indexed} entries</span>
                    </div>
                  </div>
                </div>

                {/* 5. Voice & Search Partner APIs */}
                <div className="p-4 border-2 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a] md:col-span-2">
                  <span className="text-xs font-black uppercase text-slate-900 mb-2 block">Voice & Search Integrations</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          ElevenLabs Voice
                        </span>
                        {getStatusBadge(data.subsystems?.partner_apis?.elevenlabs?.status)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Fallback: {data.subsystems?.partner_apis?.elevenlabs?.offline_fallback}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-slate-700" />
                          SerpAPI Market Web
                        </span>
                        {getStatusBadge(data.subsystems?.partner_apis?.serpapi?.status)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Fallback: {data.subsystems?.partner_apis?.serpapi?.offline_fallback}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Host & Environment Bar */}
              <div className="p-3 bg-slate-100 border border-slate-300 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono gap-2">
                <div className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-500" />
                  <span>{data.environment?.platform}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Uptime: {formatUptime(data.environment?.uptime_seconds || 0)}</span>
                </div>
                <div>Python: {data.environment?.python_version}</div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};

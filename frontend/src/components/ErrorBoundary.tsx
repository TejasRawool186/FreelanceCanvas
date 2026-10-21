import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FreelanceCanvas ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = () => {
    if (window.confirm('Resetting session cache will clear local unsaved drafts. Continue?')) {
      localStorage.removeItem('freelancecanvas_draft');
      window.location.href = '/';
    }
  };

  private handleCopyDiagnostic = () => {
    const diagnostic = [
      `FreelanceCanvas Crash Report`,
      `Time: ${new Date().toISOString()}`,
      `Error: ${this.state.error?.name || 'Error'}: ${this.state.error?.message || 'Unknown'}`,
      `Stack:\n${this.state.error?.stack || 'No stack trace'}`,
      `Component Stack:\n${this.state.errorInfo?.componentStack || 'No component stack'}`
    ].join('\n\n');

    navigator.clipboard.writeText(diagnostic).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-amber-50/40 text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-2xl w-full bg-white border-4 border-slate-900 shadow-[8px_8px_0px_#0f172a] rounded-none p-6 sm:p-8">
            {/* Header Badge */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-rose-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-[2px_2px_0px_#0f172a]">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-300 px-2 py-0.5 inline-block">
                  Fault Isolation Active
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Component Rendering Boundary
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed mb-6">
              FreelanceCanvas intercepted an unexpected UI exception before it could destabilize your entire workspace. Your data in the database remains safe.
            </p>

            {/* Error Message Box */}
            <div className="p-4 bg-slate-50 border-2 border-slate-900 text-xs sm:text-sm font-mono text-rose-700 font-semibold mb-6 break-words">
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Recovering
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleCopyDiagnostic}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                {this.state.copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {this.state.copied ? 'Report Copied' : 'Copy Diagnostics'}
              </button>
            </div>

            {/* Details Accordion */}
            <div className="border-t-2 border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider py-1 cursor-pointer"
              >
                <span>Diagnostic Stack Information</span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded border border-slate-800 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  <div className="text-slate-400 mb-2">// Call Stack</div>
                  {this.state.error?.stack || 'No call stack captured.'}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <div className="text-slate-400 mt-3 mb-2">// React Component Tree</div>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <span>FreelanceCanvas Engine v1.0</span>
              <button
                type="button"
                onClick={this.handleResetSession}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                Reset Local Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

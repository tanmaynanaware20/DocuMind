import React from 'react';
import { ShieldCheck, FileText, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export type IngestionStep = 1 | 2 | 3 | 4;
export type IngestionStatus = 'idle' | 'processing' | 'completed' | 'failed';

interface ProcessingProgressBarProps {
  currentStep: IngestionStep;
  status: IngestionStatus;
  fileName?: string;
  errorMessage?: string;
}

export const ProcessingProgressBar: React.FC<ProcessingProgressBarProps> = ({
  currentStep,
  status,
  fileName,
  errorMessage,
}) => {
  const steps = [
    { id: 1, label: 'PII & Security Scan', icon: ShieldCheck },
    { id: 2, label: 'Extraction & Chunking', icon: FileText },
    { id: 3, label: 'Hybrid Vector Indexing', icon: Cpu },
    { id: 4, label: 'Ingestion Complete', icon: CheckCircle2 },
  ];

  const calculateProgress = () => {
    if (status === 'completed') return 100;
    if (status === 'failed') return (currentStep - 1) * 25;
    return Math.min(100, Math.max(15, (currentStep - 1) * 25 + 15));
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Document Ingestion Pipeline
          </h4>
          {fileName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
              Processing: <span className="font-medium text-slate-700 dark:text-slate-300">{fileName}</span>
            </p>
          )}
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            status === 'completed'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : status === 'failed'
              ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse'
          }`}
        >
          {status === 'completed'
            ? 'Completed'
            : status === 'failed'
            ? 'Failed'
            : `Step ${currentStep} of 4`}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            status === 'completed'
              ? 'bg-emerald-500'
              : status === 'failed'
              ? 'bg-red-500'
              : 'bg-blue-600'
          }`}
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id || status === 'completed';
          const isCurrent = currentStep === step.id && status === 'processing';
          const isError = currentStep === step.id && status === 'failed';

          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                    : isError
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 ring-2 ring-blue-500/30'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] leading-tight font-medium ${
                  isDone
                    ? 'text-slate-800 dark:text-slate-200'
                    : isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : isError
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error state */}
      {status === 'failed' && errorMessage && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg flex items-start space-x-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ProcessingProgressBar;

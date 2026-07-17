import React from 'react';
import { X, Clock, RotateCcw } from 'lucide-react';
import { EmailTemplate, UndoRedoState } from '../types';

interface VersionHistorySidebarProps {
  history: UndoRedoState;
  template: EmailTemplate;
  snapshots: { id: string, timestamp: number, template: EmailTemplate }[];
  onRestore: (template: EmailTemplate) => void;
  onClose: () => void;
  onCreateSnapshot: () => void;
}

export default function VersionHistorySidebar({ history, template, snapshots, onRestore, onClose, onCreateSnapshot }: VersionHistorySidebarProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-40 animate-fade-in">
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Version History
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <button 
          onClick={onCreateSnapshot}
          className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 text-xs font-bold rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50"
        >
          Save Current Snapshot
        </button>
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
          Snapshots are saved automatically upon significant edits, or you can manually save the current state.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {snapshots.length === 0 && history.past.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No version history available yet.</p>
          </div>
        ) : (
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {/* Current State */}
            <div className="relative flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-xl z-10 shadow-sm">
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Current State</p>
                <p className="text-[10px] text-blue-500/80 mt-0.5">{template.blocks.length} blocks</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>

            {/* Snapshots */}
            {snapshots.map((snap, idx) => (
              <div key={snap.id} className="relative flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl z-10 shadow-xs group hover:border-blue-400 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    Snapshot
                    <span className="text-[9px] font-normal bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                      {formatTime(snap.timestamp)}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{snap.template.blocks.length} blocks</p>
                </div>
                <button 
                  onClick={() => onRestore(snap.template)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 transition-colors flex items-center gap-1 text-[10px] font-bold opacity-0 group-hover:opacity-100"
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </button>
              </div>
            ))}

            {/* Editing History (from past array) - show last 5 */}
            {history.past.slice(-5).reverse().map((pastTpl, idx) => (
              <div key={`history-${idx}`} className="relative flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl z-10 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Previous Edit</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{pastTpl.blocks.length} blocks</p>
                </div>
                <button 
                  onClick={() => onRestore(pastTpl)}
                  className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 text-[10px] font-bold opacity-0 group-hover:opacity-100"
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

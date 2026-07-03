import { FiStar, FiTag } from 'react-icons/fi';

export default function AIResultsPanel({ task, loading }) {
  if (loading) {
    return (
      <div className="mt-3 rounded-lg p-4 bg-purple-dim border border-purple/20 shimmer-bg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
          <span className="text-purple text-sm font-medium">Analyzing with AI...</span>
        </div>
      </div>
    );
  }

  if (!task.summary && !task.category && !task.priority) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg p-4 bg-purple-dim border border-purple/20 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <FiStar className="text-purple" />
        <span className="font-bold text-sm text-purple">AI Analysis</span>
      </div>

      {task.summary && (
        <div className="py-2 border-b border-purple/10">
          <div className="text-[0.65rem] font-semibold text-purple uppercase tracking-wider mb-0.5">Summary</div>
          <div className="text-sm text-text-primary">{task.summary}</div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        {task.category && (
          <div className="py-2 flex-1 min-w-[100px]">
            <div className="text-[0.65rem] font-semibold text-purple uppercase tracking-wider mb-1 flex items-center gap-1">
              <FiTag size={10} /> Category
            </div>
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-[var(--color-text-primary)]/5 text-text-secondary border border-border-light">
              {task.category}
            </span>
          </div>
        )}

        {task.priority && (
          <div className="py-2 flex-1 min-w-[100px]">
            <div className="text-[0.65rem] font-semibold text-purple uppercase tracking-wider mb-1">Priority</div>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${
              task.priority === 'High' ? 'bg-danger-dim text-danger border-danger/25' :
              task.priority === 'Medium' ? 'bg-warning-dim text-warning border-warning/25' :
              'bg-accent-dim text-accent border-accent/25'
            }`}>
              {task.priority}
            </span>
          </div>
        )}
      </div>

      {task.priority_reason && (
        <div className="py-2 border-t border-purple/10">
          <div className="text-[0.65rem] font-semibold text-purple uppercase tracking-wider mb-0.5">Priority Reason</div>
          <div className="text-sm text-text-primary">{task.priority_reason}</div>
        </div>
      )}

      {task.improved_description && (
        <div className="py-2 border-t border-purple/10">
          <div className="text-[0.65rem] font-semibold text-purple uppercase tracking-wider mb-0.5">Improved Description</div>
          <div className="text-sm text-text-primary">{task.improved_description}</div>
        </div>
      )}
    </div>
  );
}

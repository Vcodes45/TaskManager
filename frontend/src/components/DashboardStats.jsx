import { FiList, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function DashboardStats({ tasks = [] }) {
  const safeTasks = tasks || [];
  const total = safeTasks.length;
  const pending = safeTasks.filter((t) => t && t.status === 'Pending').length;
  const completed = safeTasks.filter((t) => t && t.status === 'Completed').length;

  const highPriority = safeTasks.filter((t) => t && t.priority === 'High').length;
  const mediumPriority = safeTasks.filter((t) => t && t.priority === 'Medium').length;
  const lowPriority = safeTasks.filter((t) => t && t.priority === 'Low').length;

  const generalStats = [
    { label: 'Total Tasks', value: total, icon: <FiList />, colorClass: 'text-text-secondary bg-[var(--color-text-primary)]/5' },
    { label: 'Pending', value: pending, icon: <FiClock />, colorClass: 'text-warning bg-warning-dim' },
    { label: 'Completed', value: completed, icon: <FiCheckCircle />, colorClass: 'text-success bg-success-dim' },
  ];

  const priorityStats = [
    { label: 'High Priority', value: highPriority, icon: <FiAlertTriangle />, colorClass: 'text-danger bg-danger-dim' },
    { label: 'Medium Priority', value: mediumPriority, icon: <FiClock />, colorClass: 'text-warning bg-warning-dim' },
    { label: 'Low Priority', value: lowPriority, icon: <FiCheckCircle />, colorClass: 'text-accent bg-accent-dim' },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* General Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {generalStats.map((stat, i) => (
          <div
            key={stat.label}
            className="reveal glass rounded-xl p-4 flex items-center justify-between hover:border-border-light transition-all duration-300"
            style={{ '--reveal-delay': `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.colorClass}`}>
              {stat.icon}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs font-medium text-text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {priorityStats.map((stat, i) => (
          <div
            key={stat.label}
            className="reveal glass rounded-xl p-4 flex items-center justify-between hover:border-border-light transition-all duration-300"
            style={{ '--reveal-delay': `${(i + 3) * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.colorClass}`}>
              {stat.icon}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs font-medium text-text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

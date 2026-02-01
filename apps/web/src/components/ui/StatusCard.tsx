import { clsx } from 'clsx';
interface StatusCardProps {
  title: string;
  description: string;
  status?: 'success' | 'error' | 'warning' | 'info';
}
export default function StatusCard({ title, description, status = 'success' }: StatusCardProps) {
  const statusClasses = {
    success:
      'border-l-4 border-l-green-500 bg-[#13131A] bg-green-500/20 border border-gray-800 border-green-500/30',
    error: 'border-l-4 border-l-red-500 bg-[#13131A] bg-red-500/20 border border-gray-800 border-red-500/30',
    warning: 'border-l-4 border-l-yellow-500 bg-[#13131A] bg-yellow-500/20 border border-gray-800 border-yellow-500/30',
    info: 'border-l-4 border-l-blue-500 bg-[#13131A] bg-blue-500/20 border border-gray-800 border-blue-500/30',
  };
  const textClasses = {
    success: 'text-white text-green-300',
    error: 'text-white text-red-300',
    warning: 'text-white text-yellow-300',
    info: 'text-white text-blue-300',
  };
  const textSecondaryClasses = {
    success: 'text-gray-300 text-green-200',
    error: 'text-gray-300 text-red-200',
    warning: 'text-gray-300 text-yellow-200',
    info: 'text-gray-300 text-blue-200',
  };
  return (
    <div className={clsx('p-4 rounded-lg glass-effect', statusClasses[status])}>
      <p className={clsx('font-semibold', textClasses[status])}>{title}</p>
      <p className={clsx('text-sm mt-1', textSecondaryClasses[status])}>{description}</p>
    </div>
  );
}

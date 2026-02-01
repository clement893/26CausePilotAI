import { clsx } from 'clsx';
interface StatusCardProps {
  title: string;
  description: string;
  status?: 'success' | 'error' | 'warning' | 'info';
}
export default function StatusCard({ title, description, status = 'success' }: StatusCardProps) {
  const statusClasses = {
    success:
      'border-l-4 border-l-green-500 bg-[#13131A] dark:bg-secondary-900 border border-gray-800 dark:border-secondary-800',
    error: 'border-l-4 border-l-red-500 bg-[#13131A] dark:bg-error-900 border border-gray-800 dark:border-error-800',
    warning: 'border-l-4 border-l-yellow-500 bg-[#13131A] dark:bg-warning-900 border border-gray-800 dark:border-warning-800',
    info: 'border-l-4 border-l-blue-500 bg-[#13131A] dark:bg-primary-900 border border-gray-800 dark:border-primary-800',
  };
  const textClasses = {
    success: 'text-white dark:text-secondary-100',
    error: 'text-white dark:text-error-100',
    warning: 'text-white dark:text-warning-100',
    info: 'text-white dark:text-primary-100',
  };
  const textSecondaryClasses = {
    success: 'text-gray-300 dark:text-secondary-200',
    error: 'text-gray-300 dark:text-error-200',
    warning: 'text-gray-300 dark:text-warning-200',
    info: 'text-gray-300 dark:text-primary-200',
  };
  return (
    <div className={clsx('p-4 rounded-lg glass-effect', statusClasses[status])}>
      <p className={clsx('font-semibold', textClasses[status])}>{title}</p>
      <p className={clsx('text-sm mt-1', textSecondaryClasses[status])}>{description}</p>
    </div>
  );
}

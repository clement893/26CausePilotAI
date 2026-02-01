import { clsx } from 'clsx';
import { Size } from './types';
interface LoadingProps {
  size?: Size;
  className?: string;
  fullScreen?: boolean;
  text?: string;
}
export default function Loading({
  size = 'md',
  className,
  fullScreen = false,
  text,
}: LoadingProps) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' };
  const spinner = (
    <div
      className={clsx(
        'rounded-full animate-spin border-t-transparent',
        'border-blue-500 border-blue-500',
        sizes[size],
        className
      )}
      style={{
        borderImage: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%) 1',
        borderTopColor: 'transparent',
      }}
    />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 bg-[#0A0A0F]/90 backdrop-blur-sm z-50">
        {spinner}
        {text && <p className="mt-4 text-gray-300 text-gray-400">{text}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {text && <p className="mt-2 text-sm text-gray-300 text-gray-400">{text}</p>}
    </div>
  );
}

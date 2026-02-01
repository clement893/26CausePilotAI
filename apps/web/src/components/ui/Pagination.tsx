'use client';
import { clsx } from 'clsx';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisible?: number;
}
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  maxVisible = 5,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= half + 1) {
        for (let i = 1; i <= maxVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - half) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - half + 1; i <= currentPage + half - 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };
  const pageNumbers = getPageNumbers();
  return (
    <nav
      className={clsx('flex items-center justify-center space-x-1', className)}
      aria-label="Pagination"
    >
      {' '}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={clsx(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-blue-400',
            currentPage === 1
              ? 'bg-[#1C1C26] bg-[#1C1C26] text-gray-500 text-gray-400 cursor-not-allowed'
              : 'bg-[#13131A] bg-[#13131A] text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]'
          )}
          aria-label="First page"
        >
          {' '}
          ««{' '}
        </button>
      )}{' '}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-blue-400',
          currentPage === 1
            ? 'bg-[#1C1C26] bg-[#1C1C26] text-gray-500 text-gray-400 cursor-not-allowed'
            : 'bg-[#13131A] bg-[#13131A] text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]'
        )}
        aria-label="Previous page"
      >
        {' '}
        ‹{' '}
      </button>{' '}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 text-gray-400">
              ...
            </span>
          );
        }
        const pageNum = page as number;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-blue-400',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 bg-blue-500 text-white text-white'
                : 'bg-[#13131A] bg-[#13131A] text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]'
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-blue-400',
          currentPage === totalPages
            ? 'bg-[#1C1C26] bg-[#1C1C26] text-gray-500 text-gray-400 cursor-not-allowed'
            : 'bg-[#13131A] bg-[#13131A] text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]'
        )}
          aria-label="Next page"
      >
        ›
      </button>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={clsx(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-blue-400',
            currentPage === totalPages
              ? 'bg-[#1C1C26] bg-[#1C1C26] text-gray-500 text-gray-400 cursor-not-allowed'
              : 'bg-[#13131A] bg-[#13131A] text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]'
          )}
          aria-label="Last page"
        >
          »»
        </button>
      )}
    </nav>
  );
}

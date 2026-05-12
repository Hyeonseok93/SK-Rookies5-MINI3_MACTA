import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const buttonBaseClass = "w-10 h-10 flex items-center justify-center rounded-xl transition-all font-bold text-sm border";
  const activeClass = "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20";
  const inactiveClass = "bg-[#1e3a5f]/20 border-[#1e3a5f] text-gray-400 hover:bg-blue-600/20 hover:text-blue-400";
  const disabledClass = "opacity-30 cursor-not-allowed border-[#1e3a5f] text-gray-600";

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* First Page */}
      <button
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        className={`${buttonBaseClass} ${currentPage === 0 ? disabledClass : inactiveClass}`}
        title="First Page"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Prev Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`${buttonBaseClass} ${currentPage === 0 ? disabledClass : inactiveClass}`}
        title="Previous"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {pageNumbers[0] > 0 && <span className="text-gray-600 px-1">...</span>}
      
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${buttonBaseClass} ${currentPage === page ? activeClass : inactiveClass}`}
        >
          {page + 1}
        </button>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-gray-600 px-1">...</span>}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={`${buttonBaseClass} ${currentPage >= totalPages - 1 ? disabledClass : inactiveClass}`}
        title="Next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
        className={`${buttonBaseClass} ${currentPage >= totalPages - 1 ? disabledClass : inactiveClass}`}
        title="Last Page"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}

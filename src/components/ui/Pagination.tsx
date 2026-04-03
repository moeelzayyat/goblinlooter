"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        className={styles.navBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {start > 2 && <span style={{ color: "var(--text-muted)" }}>…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`${styles.pageBtn} ${page === currentPage ? styles.active : ""}`}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span style={{ color: "var(--text-muted)" }}>…</span>
          )}
          <button
            className={styles.pageBtn}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className={styles.navBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

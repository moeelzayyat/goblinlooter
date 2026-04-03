"use client";

import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      <Search size={18} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

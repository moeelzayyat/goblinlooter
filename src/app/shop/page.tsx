"use client";

import { useState, useMemo } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { ProductCard } from "@/components/data/ProductCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MOCK_PRODUCTS, CATEGORIES } from "@/lib/mockData";
import styles from "./page.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  ...CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
];

const ITEMS_PER_PAGE = 12;

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...MOCK_PRODUCTS].filter((p) => p.status === "published");

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    if (category) {
      items = items.filter((p) => p.category === category);
    }

    switch (sort) {
      case "newest":
        items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price-low":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        items.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return items;
  }, [search, sort, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (category) {
    const name = CATEGORIES.find((c) => c.id === category)?.name || category;
    activeFilters.push({ label: name, clear: () => setCategory("") });
  }
  if (search) {
    activeFilters.push({
      label: `"${search}"`,
      clear: () => setSearch(""),
    });
  }

  function clearAll() {
    setSearch("");
    setCategory("");
    setCurrentPage(1);
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <PageHeader
          title="Shop"
          subtitle="Premium game tools for Arc Raiders — tested, updated, and delivered instantly"
        />

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
            />
          </div>
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className={styles.filterRow}>
            {activeFilters.map((f) => (
              <FilterChip key={f.label} label={f.label} onDismiss={f.clear} />
            ))}
            <button className={styles.clearAll} onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        <div className={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? "product" : "products"}{" "}
          found
        </div>

        {paginated.length > 0 ? (
          <>
            <ContentGrid columns={3}>
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ContentGrid>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <EmptyState
            message="No products match your filters"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <button className={styles.clearAll} onClick={clearAll}>
                Clear all filters
              </button>
            }
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

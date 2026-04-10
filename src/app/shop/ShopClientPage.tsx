"use client";

import { useMemo, useState } from "react";
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
import type { ShopSettings } from "@/lib/site-settings-schema";
import type { Product } from "@/types";
import styles from "./page.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const ITEMS_PER_PAGE = 12;

interface ShopClientPageProps {
  products: Product[];
  categoryOptions: { id: Product["category"]; name: string }[];
  initialCategory: string;
  settings: ShopSettings;
}

export function ShopClientPage({
  products,
  categoryOptions,
  initialCategory,
  settings,
}: ShopClientPageProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [category, setCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  const selectOptions = useMemo(
    () => [
      { value: "", label: "All Categories" },
      ...categoryOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    ],
    [categoryOptions]
  );

  const filtered = useMemo(() => {
    let items = [...products];

    if (search) {
      const query = search.toLowerCase();
      items = items.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.shortDescription.toLowerCase().includes(query)
      );
    }

    if (category) {
      items = items.filter((product) => product.category === category);
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
  }, [category, products, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (category) {
    const categoryName =
      categoryOptions.find((option) => option.id === category)?.name || category;
    activeFilters.push({ label: categoryName, clear: () => setCategory("") });
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
          title={settings.title}
          subtitle={settings.subtitle}
        />

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <SearchBar
              value={search}
              onChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
            />
          </div>
          <Select
            options={selectOptions}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          />
        </div>

        {activeFilters.length > 0 && (
          <div className={styles.filterRow}>
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                onDismiss={filter.clear}
              />
            ))}
            <button className={styles.clearAll} onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        <div className={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? "product" : "products"} found
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
            message={settings.emptyStateMessage}
            description={settings.emptyStateDescription}
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

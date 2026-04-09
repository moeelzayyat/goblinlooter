"use client";

import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import type {
  AdminInventoryKeyRecord,
  AdminProductRecord,
} from "@/lib/admin-products";
import styles from "./page.module.css";

const CATEGORY_OPTIONS = [
  { value: "tool-access", label: "Tool Access" },
  { value: "game-keys", label: "Game Keys" },
  { value: "configs", label: "Configs" },
];

const DELIVERY_OPTIONS = [
  { value: "key", label: "Digital Key" },
  { value: "download", label: "Digital Download" },
  { value: "manual", label: "Manual Delivery" },
];

const REFUND_OPTIONS = [
  { value: "eligible", label: "Eligible" },
  { value: "conditional", label: "Conditional" },
  { value: "non-refundable", label: "Non-refundable" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "disabled", label: "Disabled" },
];

function createEmptyForm() {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    category: "tool-access",
    price: "60",
    platform: "Windows 10/11",
    compatibilityNotes: "Latest loader build",
    regionRestrictions: "",
    deliveryMethod: "key",
    downloadUrl: "",
    deliveryTimeEstimate: "Instant delivery",
    refundEligibility: "conditional",
    refundTerms: "Refunds are available on unused keys within 72 hours.",
    images: "/arcway-dupe.png",
    featured: true,
    status: "published",
  };
}

type ProductFormState = ReturnType<typeof createEmptyForm>;

function formFromProduct(product: AdminProductRecord): ProductFormState {
  return {
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    category: product.category,
    price: product.price.toString(),
    platform: product.platform.join("\n"),
    compatibilityNotes: product.compatibilityNotes,
    regionRestrictions: product.regionRestrictions || "",
    deliveryMethod: product.deliveryMethod,
    downloadUrl: product.downloadUrl || "",
    deliveryTimeEstimate: product.deliveryTimeEstimate,
    refundEligibility: product.refundEligibility,
    refundTerms: product.refundTerms,
    images: product.images.join("\n"),
    featured: product.featured,
    status: product.status,
  };
}

export function AdminDashboard({
  initialProducts,
}: {
  initialProducts: AdminProductRecord[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProducts[0]?.id || null
  );
  const [form, setForm] = useState<ProductFormState>(
    initialProducts[0] ? formFromProduct(initialProducts[0]) : createEmptyForm()
  );
  const [keyInput, setKeyInput] = useState("");
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [addingKeys, setAddingKeys] = useState(false);
  const [keyAction, setKeyAction] = useState<{
    id: string;
    mode: "save" | "delete";
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) || null,
    [products, selectedId]
  );

  useEffect(() => {
    if (selectedProduct) {
      setForm(formFromProduct(selectedProduct));
      setKeyInput("");
      setKeyDrafts(
        Object.fromEntries(
          selectedProduct.inventoryKeys.map((key) => [key.id, key.keyValue])
        )
      );
      return;
    }

    setForm(createEmptyForm());
    setKeyInput("");
    setKeyDrafts({});
  }, [selectedProduct]);

  function updateField<K extends keyof ProductFormState>(
    name: K,
    value: ProductFormState[K]
  ) {
    setForm((current) => ({ ...current, [name]: value }) as ProductFormState);
  }

  function updateProductState(savedProduct: AdminProductRecord) {
    setProducts((current) => {
      const exists = current.some((product) => product.id === savedProduct.id);
      if (!exists) {
        return [savedProduct, ...current];
      }

      return current.map((product) =>
        product.id === savedProduct.id ? savedProduct : product
      );
    });
    setSelectedId(savedProduct.id);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        selectedProduct
          ? `/api/admin/products/${selectedProduct.id}`
          : "/api/admin/products",
        {
          method: selectedProduct ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save product.");
      }

      const savedProduct = data.product as AdminProductRecord;
      if (selectedProduct) {
        updateProductState(savedProduct);
        setMessage("Product updated.");
      } else {
        updateProductState(savedProduct);
        setMessage("Product created.");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function addKeys() {
    if (!selectedProduct) return;

    setAddingKeys(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}/keys`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: keyInput }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add keys.");
      }

      const updatedProduct = data.product as AdminProductRecord;
      updateProductState(updatedProduct);
      setKeyInput("");
      setMessage(`Added ${data.addedCount} key${data.addedCount === 1 ? "" : "s"}.`);
    } catch (keyError) {
      setError(
        keyError instanceof Error ? keyError.message : "Unable to add keys."
      );
    } finally {
      setAddingKeys(false);
    }
  }

  function updateKeyDraft(keyId: string, value: string) {
    setKeyDrafts((current) => ({ ...current, [keyId]: value }));
  }

  async function saveKey(key: AdminInventoryKeyRecord) {
    if (!selectedProduct) return;

    const nextValue = keyDrafts[key.id]?.trim() || "";
    if (!nextValue || nextValue === key.keyValue) return;

    setKeyAction({ id: key.id, mode: "save" });
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}/keys/${key.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyValue: nextValue }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update key.");
      }

      updateProductState(data.product as AdminProductRecord);
      setMessage("Key updated.");
    } catch (keyError) {
      setError(
        keyError instanceof Error ? keyError.message : "Unable to update key."
      );
    } finally {
      setKeyAction(null);
    }
  }

  async function deleteKey(key: AdminInventoryKeyRecord) {
    if (!selectedProduct) return;
    if (!window.confirm("Remove this key from inventory?")) return;

    setKeyAction({ id: key.id, mode: "delete" });
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}/keys/${key.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete key.");
      }

      updateProductState(data.product as AdminProductRecord);
      setMessage("Key removed.");
    } catch (keyError) {
      setError(
        keyError instanceof Error ? keyError.message : "Unable to delete key."
      );
    } finally {
      setKeyAction(null);
    }
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Admin Panel</p>
            <h1 className={styles.title}>Products, pricing, and key inventory</h1>
            <p className={styles.subtitle}>
              Create products, publish or hide them, set download links, and bulk
              upload keys without touching the codebase.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedId(null);
              setMessage(null);
              setError(null);
            }}
          >
            New Product
          </Button>
        </section>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Catalog</div>
            <div className={styles.productList}>
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`${styles.productCard} ${
                    selectedId === product.id ? styles.productCardActive : ""
                  }`}
                  onClick={() => {
                    setSelectedId(product.id);
                    setMessage(null);
                    setError(null);
                  }}
                >
                  <div className={styles.productTop}>
                    <span>{product.title}</span>
                    <span className={styles.price}>${product.price.toFixed(2)}</span>
                  </div>
                  <div className={styles.productMeta}>
                    <span>{product.status}</span>
                    <span>{product.slug}</span>
                  </div>
                  <div className={styles.productCounts}>
                    <span>{product.availableKeyCount} available</span>
                    <span>{product.assignedKeyCount} assigned</span>
                  </div>
                </button>
              ))}
              {products.length === 0 && (
                <div className={styles.emptyState}>No products yet. Create the first one.</div>
              )}
            </div>
          </aside>

          <section className={styles.editor}>
            <form className={styles.form} onSubmit={saveProduct}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="ArcWay - Refresh All IDs"
                  />
                </label>
                <label className={styles.field}>
                  <span>Slug</span>
                  <input
                    value={form.slug}
                    onChange={(event) => updateField("slug", event.target.value)}
                    placeholder="arcway-refresh-all-ids"
                  />
                </label>
                <label className={styles.field}>
                  <span>Price (USD)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <small className={styles.fieldHint}>
                    Only published products appear on the live shop. Draft and
                    disabled products stay hidden.
                  </small>
                </label>
                <label className={styles.field}>
                  <span>Delivery Method</span>
                  <select
                    value={form.deliveryMethod}
                    onChange={(event) =>
                      updateField("deliveryMethod", event.target.value)
                    }
                  >
                    {DELIVERY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Delivery ETA</span>
                  <input
                    value={form.deliveryTimeEstimate}
                    onChange={(event) =>
                      updateField("deliveryTimeEstimate", event.target.value)
                    }
                    placeholder="Instant delivery"
                  />
                </label>
                <label className={styles.field}>
                  <span>Refund Eligibility</span>
                  <select
                    value={form.refundEligibility}
                    onChange={(event) =>
                      updateField("refundEligibility", event.target.value)
                    }
                  >
                    {REFUND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Download URL</span>
                  <input
                    value={form.downloadUrl}
                    onChange={(event) => updateField("downloadUrl", event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <label className={styles.field}>
                  <span>Region Restrictions</span>
                  <input
                    value={form.regionRestrictions}
                    onChange={(event) =>
                      updateField("regionRestrictions", event.target.value)
                    }
                    placeholder="Global"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Short Description</span>
                <textarea
                  rows={3}
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateField("shortDescription", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Full Description</span>
                <textarea
                  rows={5}
                  value={form.fullDescription}
                  onChange={(event) =>
                    updateField("fullDescription", event.target.value)
                  }
                />
              </label>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Platforms</span>
                  <textarea
                    rows={4}
                    value={form.platform}
                    onChange={(event) => updateField("platform", event.target.value)}
                    placeholder="One per line"
                  />
                </label>
                <label className={styles.field}>
                  <span>Images</span>
                  <textarea
                    rows={4}
                    value={form.images}
                    onChange={(event) => updateField("images", event.target.value)}
                    placeholder="One image path per line"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Compatibility Notes</span>
                <textarea
                  rows={3}
                  value={form.compatibilityNotes}
                  onChange={(event) =>
                    updateField("compatibilityNotes", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Refund Terms</span>
                <textarea
                  rows={3}
                  value={form.refundTerms}
                  onChange={(event) => updateField("refundTerms", event.target.value)}
                />
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => updateField("featured", event.target.checked)}
                />
                <span>Feature this product on the storefront</span>
              </label>

              <div className={styles.actions}>
                <Button type="submit" loading={saving}>
                  {selectedProduct ? "Save Changes" : "Create Product"}
                </Button>
                {selectedProduct && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedId(null);
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    Create Another
                  </Button>
                )}
              </div>
            </form>

            {selectedProduct && (
              <section className={styles.inventoryPanel}>
                <div className={styles.inventoryHeader}>
                  <div>
                    <h2>Inventory Keys</h2>
                    <p>
                      Available: {selectedProduct.availableKeyCount} | Assigned:{" "}
                      {selectedProduct.assignedKeyCount} | Revoked:{" "}
                      {selectedProduct.revokedKeyCount}
                    </p>
                  </div>
                </div>
                <label className={styles.field}>
                  <span>Paste keys, one per line</span>
                  <textarea
                    rows={8}
                    value={keyInput}
                    onChange={(event) => setKeyInput(event.target.value)}
                    placeholder={"KEY-1234-AAAA\nKEY-5678-BBBB"}
                  />
                </label>
                <Button onClick={addKeys} loading={addingKeys}>
                  Add Keys
                </Button>
                <div className={styles.keyManager}>
                  <div className={styles.keyManagerHeader}>
                    <div>
                      <h3>Manage Existing Keys</h3>
                      <p>
                        Edit or remove available inventory here. Assigned keys are
                        locked once attached to an order.
                      </p>
                    </div>
                    <span className={styles.keyCount}>
                      {selectedProduct.inventoryKeys.length} total
                    </span>
                  </div>

                  <div className={styles.keyList}>
                    {selectedProduct.inventoryKeys.length === 0 ? (
                      <div className={styles.keyEmpty}>
                        No keys yet. Add your first batch above.
                      </div>
                    ) : (
                      selectedProduct.inventoryKeys.map((key) => {
                        const locked = key.status === "assigned" || Boolean(key.orderId);
                        const draftValue = keyDrafts[key.id] ?? key.keyValue;
                        const changed = draftValue.trim() !== key.keyValue;
                        const acting = keyAction?.id === key.id;

                        return (
                          <div key={key.id} className={styles.keyRow}>
                            <div className={styles.keyRowTop}>
                              <span
                                className={`${styles.keyStatus} ${
                                  key.status === "available"
                                    ? styles.keyStatusAvailable
                                    : key.status === "assigned"
                                      ? styles.keyStatusAssigned
                                      : styles.keyStatusRevoked
                                }`}
                              >
                                {key.status}
                              </span>
                              <span className={styles.keyMeta}>
                                Added {new Date(key.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <textarea
                              className={styles.keyValueInput}
                              rows={2}
                              value={draftValue}
                              disabled={locked || acting}
                              onChange={(event) =>
                                updateKeyDraft(key.id, event.target.value)
                              }
                            />
                            <div className={styles.keyActions}>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={!changed || locked}
                                loading={acting && keyAction?.mode === "save"}
                                onClick={() => saveKey(key)}
                              >
                                Save Key
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                disabled={locked}
                                loading={acting && keyAction?.mode === "delete"}
                                onClick={() => deleteKey(key)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

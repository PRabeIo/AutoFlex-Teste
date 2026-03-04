import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./ProductsPage.css";

const emptyForm = { code: "", name: "", price: "" };

function normalizeCode(code) {
  return (code || "").trim();
}

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // ===== BOM STATES (added) =====
  const [materials, setMaterials] = useState([]);
  const [bomItems, setBomItems] = useState([]);
  const [bomLoading, setBomLoading] = useState(false);

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [requiredQuantity, setRequiredQuantity] = useState("");

  const [editingBomId, setEditingBomId] = useState(null);
  const [editingBomQty, setEditingBomQty] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/products");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ===== BOM LOADERS (added) =====
  async function loadBom(productId) {
    setBomLoading(true);
    setError("");
    try {
      const [rmData, bomData] = await Promise.all([
        api.get("/raw-materials"),
        api.get(`/products/${productId}/materials`),
      ]);

      setMaterials(Array.isArray(rmData) ? rmData : []);
      setBomItems(Array.isArray(bomData) ? bomData : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBomLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      const code = String(x.code || "").toLowerCase();
      const name = String(x.name || "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [items, search]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");

    // BOM reset (added)
    setMaterials([]);
    setBomItems([]);
    setSelectedMaterialId("");
    setRequiredQuantity("");
    setEditingBomId(null);
    setEditingBomQty("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      code: item.code ?? "",
      name: item.name ?? "",
      price: item.price ?? "",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // load BOM (added)
    setSelectedMaterialId("");
    setRequiredQuantity("");
    setEditingBomId(null);
    setEditingBomQty("");
    loadBom(item.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");

    // BOM reset (added)
    setMaterials([]);
    setBomItems([]);
    setSelectedMaterialId("");
    setRequiredQuantity("");
    setEditingBomId(null);
    setEditingBomQty("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const code = normalizeCode(form.code);
    const name = (form.name || "").trim();
    const price = form.price;

    if (code.length !== 10) return setError("Code must be exactly 10 characters (CHAR(10)).");
    if (!name) return setError("Name is required.");
    if (price === "" || Number.isNaN(Number(price))) return setError("Price must be a number.");

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, { code, name, price });
      } else {
        await api.post("/products", { code, name, price });
      }

      await load();
      setForm(emptyForm);
      setEditingId(null);

      // BOM reset (added)
      setMaterials([]);
      setBomItems([]);
      setSelectedMaterialId("");
      setRequiredQuantity("");
      setEditingBomId(null);
      setEditingBomQty("");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id) {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    setError("");
    try {
      await api.del(`/products/${id}`);
      await load();

      // if deleting the one being edited, reset (added)
      if (editingId === id) {
        cancelEdit();
      }
    } catch (e) {
      setError(e.message);
    }
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") return "-";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ===== BOM ACTIONS (added) =====
  async function addBomItem() {
    if (!editingId) return;
    setError("");

    if (!selectedMaterialId) return setError("Select a raw material.");
    if (requiredQuantity === "" || Number.isNaN(Number(requiredQuantity)))
      return setError("Required quantity must be a number.");

    try {
      await api.post(`/products/${editingId}/materials`, {
        rawMaterialId: selectedMaterialId,
        requiredQuantity,
      });

      setSelectedMaterialId("");
      setRequiredQuantity("");
      await loadBom(editingId);
    } catch (e) {
      setError(e.message);
    }
  }

  function startEditBom(item) {
    setEditingBomId(item.id);
    setEditingBomQty(String(item.requiredQuantity ?? ""));
  }

  function cancelEditBom() {
    setEditingBomId(null);
    setEditingBomQty("");
  }

  async function saveEditBom() {
    if (!editingId || !editingBomId) return;
    setError("");

    if (editingBomQty === "" || Number.isNaN(Number(editingBomQty)))
      return setError("Required quantity must be a number.");

    try {
      await api.put(`/products/${editingId}/materials/${editingBomId}`, {
        requiredQuantity: editingBomQty,
      });

      setEditingBomId(null);
      setEditingBomQty("");
      await loadBom(editingId);
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeBomItem(bomId) {
    if (!editingId) return;
    const ok = confirm("Remove this material from product?");
    if (!ok) return;

    setError("");
    try {
      await api.del(`/products/${editingId}/materials/${bomId}`);
      await loadBom(editingId);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="pr-page">
      <div className="pr-container">
        <header className="pr-header">
          <div>
            <h1 className="pr-title">Products</h1>
            <p className="pr-subtitle">Manage products and their prices.</p>
          </div>

          <div className="pr-actions">
            <input
              className="pr-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or name..."
            />
            <button className="pr-btn pr-btn--secondary" onClick={load} disabled={loading || saving}>
              Refresh
            </button>
          </div>
        </header>

        <section className="pr-card pr-form-card">
          <h2 className="pr-section-title">{editingId ? `Edit Product #${editingId}` : "New Product"}</h2>

          {error ? <div className="pr-alert">{error}</div> : null}

          <form className="pr-form" onSubmit={submit}>
            <label className="pr-field">
              <span>Code (10 chars)</span>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="P000000001"
                maxLength={10}
              />
            </label>

            <label className="pr-field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Plastic Chair"
              />
            </label>

            <label className="pr-field">
              <span>Price</span>
              <input
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="100.00"
                inputMode="decimal"
              />
            </label>

            <div className="pr-form-buttons">
              <button className="pr-btn pr-btn--primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create"}
              </button>

              {editingId ? (
                <button className="pr-btn pr-btn--secondary" type="button" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
              ) : (
                <button className="pr-btn pr-btn--secondary" type="button" onClick={startCreate} disabled={saving}>
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* ===== BOM editor (replacing only the placeholder block) ===== */}
          {editingId ? (
            <div className="pr-bom-placeholder">
              <div className="pr-bom-title">BOM (Materials)</div>
              <div className="pr-bom-hint">
                Add raw materials and required quantities for this product.
              </div>

              {bomLoading ? (
                <div className="pr-empty" style={{ paddingTop: 10 }}>
                  Loading materials...
                </div>
              ) : (
                <>
                  <div className="pr-bom-form">
                    <select
                      className="pr-bom-select"
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                    >
                      <option value="">Select raw material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>

                    <input
                      className="pr-bom-input"
                      value={requiredQuantity}
                      onChange={(e) => setRequiredQuantity(e.target.value)}
                      placeholder="Required quantity"
                      inputMode="decimal"
                    />

                    <button
                      className="pr-btn pr-btn--add"
                      type="button"
                      onClick={addBomItem}
                      disabled={saving}
                    >
                      Add
                    </button>
                  </div>

                  {bomItems.length === 0 ? (
                    <div className="pr-empty">No materials added yet.</div>
                  ) : (
                    <div className="pr-bom-list">
                      {bomItems.map((it) => {
                        const isEditingThis = editingBomId === it.id;

                        return (
                          <div key={it.id} className="pr-bom-item">
                            <div className="pr-bom-left">
                              <div className="pr-bom-name">
                                {it.rawMaterialName} <span className="pr-bom-code">({it.rawMaterialCode})</span>
                              </div>

                              {!isEditingThis ? (
                                <div className="pr-bom-qty">
                                  Required: <strong>{it.requiredQuantity}</strong>
                                </div>
                              ) : (
                                <div className="pr-bom-editline">
                                  <span>Required:</span>
                                  <input
                                    className="pr-bom-input pr-bom-input--small"
                                    value={editingBomQty}
                                    onChange={(e) => setEditingBomQty(e.target.value)}
                                    inputMode="decimal"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="pr-bom-actions">
                              {!isEditingThis ? (
                                <>
                                  <button
                                    className="pr-btn pr-btn--edit"
                                    type="button"
                                    onClick={() => startEditBom(it)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="pr-btn pr-btn--danger"
                                    type="button"
                                    onClick={() => removeBomItem(it.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="pr-btn pr-btn--primary"
                                    type="button"
                                    onClick={saveEditBom}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="pr-btn pr-btn--secondary"
                                    type="button"
                                    onClick={cancelEditBom}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className="pr-card">
          <div className="pr-list-header">
            <h2 className="pr-section-title">List</h2>
            <div className="pr-meta">{loading ? "Loading..." : `${filtered.length} item(s)`}</div>
          </div>

          {loading ? (
            <div className="pr-empty">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="pr-empty">No products found.</div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="pr-mobile-list">
                {filtered.map((x) => (
                  <div key={x.id} className="pr-item">
                    <div className="pr-item__top">
                      <div className="pr-item__title">{x.name}</div>
                      <div className="pr-item__code">{x.code}</div>
                    </div>

                    <div className="pr-item__row">
                      <span>Price</span>
                      <strong>{formatMoney(x.price)}</strong>
                    </div>

                    <div className="pr-item__buttons">
                      <button className="pr-btn pr-btn--edit" onClick={() => startEdit(x)}>
                        Edit
                      </button>
                      <button className="pr-btn pr-btn--danger" onClick={() => removeItem(x.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="pr-table-wrap">
                <table className="pr-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th style={{ width: 140 }}>Price</th>
                      <th style={{ width: 200 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x) => (
                      <tr key={x.id}>
                        <td>{x.id}</td>
                        <td>{x.code}</td>
                        <td>{x.name}</td>
                        <td>{formatMoney(x.price)}</td>
                        <td className="pr-td-actions">
                          <button className="pr-btn pr-btn--edit" onClick={() => startEdit(x)}>
                            Edit
                          </button>
                          <button className="pr-btn pr-btn--danger" onClick={() => removeItem(x.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
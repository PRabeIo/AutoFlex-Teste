import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./RawMaterialsPage.css";

const emptyForm = { code: "", name: "", stockQuantity: "" };

function normalizeCode(code) {
  return (code || "").trim();
}

function padOrValidateCode(code) {
  // Você pode preferir só validar e não “ajeitar”.
  // Aqui eu só retorno o que veio. Se quiser auto-pad com zeros, eu faço.
  return code;
}

export default function RawMaterialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/raw-materials");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
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
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      code: item.code ?? "",
      name: item.name ?? "",
      stockQuantity: item.stockQuantity ?? item.stock_quantity ?? "",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const code = padOrValidateCode(normalizeCode(form.code));
    const name = (form.name || "").trim();
    const stockQuantity = form.stockQuantity;

    // validação mínima no front (pra UX). Backend já valida também.
    if (code.length !== 10) return setError("Code must be exactly 10 characters (CHAR(10)).");
    if (!name) return setError("Name is required.");
    if (stockQuantity === "" || Number.isNaN(Number(stockQuantity))) return setError("Stock quantity must be a number.");

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/raw-materials/${editingId}`, { code, name, stockQuantity });
      } else {
        await api.post("/raw-materials", { code, name, stockQuantity });
      }
      await load();
      setForm(emptyForm);
      setEditingId(null);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id) {
    const ok = confirm("Delete this raw material?");
    if (!ok) return;

    setError("");
    try {
      await api.del(`/raw-materials/${id}`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="rm-page">
      <div className="rm-container">
        <header className="rm-header">
          <div>
            <h1 className="rm-title">Raw Materials</h1>
            <p className="rm-subtitle">Create, edit and manage your stock.</p>
          </div>

          <div className="rm-actions">
            <input
              className="rm-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or name..."
            />
            <button className="rm-btn rm-btn--secondary" onClick={load} disabled={loading || saving}>
              Refresh
            </button>
          </div>
        </header>

        <section className="rm-card rm-form-card">
          <h2 className="rm-section-title">{editingId ? `Edit Raw Material #${editingId}` : "New Raw Material"}</h2>

          {error ? <div className="rm-alert">{error}</div> : null}

          <form className="rm-form" onSubmit={submit}>
            <label className="rm-field">
              <span>Code (10 chars)</span>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="RM00000001"
                maxLength={10}
              />
            </label>

            <label className="rm-field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Plastic"
              />
            </label>

            <label className="rm-field">
              <span>Stock Quantity</span>
              <input
                value={form.stockQuantity}
                onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                placeholder="10.000"
                inputMode="decimal"
              />
            </label>

            <div className="rm-form-buttons">
              <button className="rm-btn rm-btn--primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create"}
              </button>

              {editingId ? (
                <button className="rm-btn rm-btn--secondary" type="button" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
              ) : (
                <button className="rm-btn rm-btn--secondary" type="button" onClick={startCreate} disabled={saving}>
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rm-card">
          <div className="rm-list-header">
            <h2 className="rm-section-title">List</h2>
            <div className="rm-meta">
              {loading ? "Loading..." : `${filtered.length} item(s)`}
            </div>
          </div>

          {loading ? (
            <div className="rm-empty">Loading raw materials...</div>
          ) : filtered.length === 0 ? (
            <div className="rm-empty">No raw materials found.</div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="rm-mobile-list">
                {filtered.map((x) => (
                  <div key={x.id} className="rm-item">
                    <div className="rm-item__top">
                      <div className="rm-item__title">{x.name}</div>
                      <div className="rm-item__code">{x.code}</div>
                    </div>

                    <div className="rm-item__row">
                      <span>Stock</span>
                      <strong>{x.stockQuantity ?? x.stock_quantity}</strong>
                    </div>

                    <div className="rm-item__buttons">
                      <button className="rm-btn rm-btn--edit" onClick={() => startEdit(x)}>
                        Edit
                      </button>
                      <button className="rm-btn rm-btn--danger" onClick={() => removeItem(x.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="rm-table-wrap">
                <table className="rm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Stock</th>
                      <th style={{ width: 200 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x) => (
                      <tr key={x.id}>
                        <td>{x.id}</td>
                        <td>{x.code}</td>
                        <td>{x.name}</td>
                        <td>{x.stockQuantity ?? x.stock_quantity}</td>
                        <td className="rm-td-actions">
                          <button className="rm-btn rm-btn--edit" onClick={() => startEdit(x)}>
                            Edit
                          </button>
                          <button className="rm-btn rm-btn--danger" onClick={() => removeItem(x.id)}>
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
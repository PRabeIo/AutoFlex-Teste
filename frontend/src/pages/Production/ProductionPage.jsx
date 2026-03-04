import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./ProductionPage.css";

export default function ProductionPage() {
  const [data, setData] = useState({ suggestion: [], grandTotalValue: 0 });
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/production/suggestion");
      setData(res || { suggestion: [], grandTotalValue: 0 });
    } catch (e) {
      setError(e.message);
      setData({ suggestion: [], grandTotalValue: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const items = useMemo(() => {
    const list = Array.isArray(data?.suggestion) ? data.suggestion : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((x) => {
      const code = String(x.code || "").toLowerCase();
      const name = String(x.name || "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [data, search]);

  const totalUnits = useMemo(() => {
    const list = Array.isArray(data?.suggestion) ? data.suggestion : [];
    return list.reduce((acc, x) => acc + Number(x.suggestedQuantity || 0), 0);
  }, [data]);

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") return "-";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <main className="ps-page">
      <div className="ps-container">
        <header className="ps-header">
          <div>
            <h1 className="ps-title">Production Suggestion</h1>
            <p className="ps-subtitle">Greedy plan by highest value using current raw materials stock.</p>
          </div>

          <div className="ps-actions">
            <input
              className="ps-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product code or name..."
            />
            <button className="ps-btn ps-btn--secondary" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </header>

        <section className="ps-card">
          <h2 className="ps-section-title">Summary</h2>

          {error ? <div className="ps-alert">{error}</div> : null}

          {loading ? (
            <div className="ps-empty">Loading suggestion...</div>
          ) : (
            <div className="ps-summary-grid">
              <div className="ps-summary-item">
                <div className="ps-summary-label">Total units</div>
                <div className="ps-summary-value">{totalUnits}</div>
              </div>

              <div className="ps-summary-item">
                <div className="ps-summary-label">Total value</div>
                <div className="ps-summary-value">{formatMoney(data?.grandTotalValue)}</div>
              </div>
            </div>
          )}
        </section>

        <section className="ps-card">
          <div className="ps-list-header">
            <h2 className="ps-section-title">Plan</h2>
            <div className="ps-meta">{loading ? "Loading..." : `${items.length} item(s)`}</div>
          </div>

          {loading ? (
            <div className="ps-empty">Calculating...</div>
          ) : items.length === 0 ? (
            <div className="ps-empty">No products can be produced with current stock.</div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="ps-mobile-list">
                {items.map((x) => (
                  <div key={`${x.productId}-${x.code}`} className="ps-item">
                    <div className="ps-item__top">
                      <div className="ps-item__title">{x.name}</div>
                      <div className="ps-item__code">{x.code}</div>
                    </div>

                    <div className="ps-item__row">
                      <span>Units</span>
                      <strong>{x.suggestedQuantity}</strong>
                    </div>

                    <div className="ps-item__row">
                      <span>Unit price</span>
                      <strong>{formatMoney(x.unitPrice)}</strong>
                    </div>

                    <div className="ps-item__row">
                      <span>Total</span>
                      <strong>{formatMoney(x.totalValue)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="ps-table-wrap">
                <table className="ps-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th style={{ width: 110 }}>Units</th>
                      <th style={{ width: 140 }}>Unit price</th>
                      <th style={{ width: 160 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((x, idx) => (
                      <tr key={`${x.productId}-${x.code}`}>
                        <td>{idx + 1}</td>
                        <td>{x.code}</td>
                        <td>{x.name}</td>
                        <td>{x.suggestedQuantity}</td>
                        <td>{formatMoney(x.unitPrice)}</td>
                        <td>{formatMoney(x.totalValue)}</td>
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
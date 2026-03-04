import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RawMaterialsPage from "./pages/RawMaterials/RawMaterialsPage";
import ProductsPage from "./pages/Products/ProductsPage";
import ProductionPage from "./pages/Production/ProductionPage";

function Placeholder({ title }) {
  return (
    <div style={{ padding: 8 }}>
      <h2>{title}</h2>
      <p>Coming next.</p>
    </div>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/raw-materials" replace />} />
        <Route path="/raw-materials" element={<RawMaterialsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="*" element={<Navigate to="/raw-materials" replace />} />
      </Routes>
    </AppLayout>
  );
}
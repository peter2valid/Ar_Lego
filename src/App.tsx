import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Eager load home page (fast initial load)
import { HomePage } from "./pages/HomePage";

// Lazy load other pages for code splitting
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ARViewPage = lazy(() => import("./pages/ARViewPage"));
const ARPlacePage = lazy(() => import("./pages/ARPlacePage"));
const ARScanPage = lazy(() => import("./pages/ARScanPage"));

// Loading fallback
const PageLoader: React.FC = () => (
  <div className="page-loader">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Home - loads instantly */}
          <Route path="/" element={<HomePage />} />

          {/* Product page - light, shows details */}
          <Route path="/p/:slug" element={<ProductPage />} />

          {/* AR routes - heavy, lazy loaded on demand */}
          <Route path="/ar/view/:slug" element={<ARViewPage />} />
          <Route path="/ar/place/:slug" element={<ARPlacePage />} />
          <Route path="/ar/scan/:slug" element={<ARScanPage />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1>404</h1>
                <p>Page not found</p>
                <a href="/">Go Home</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

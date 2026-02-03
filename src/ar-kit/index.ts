// AR Kit - Modular AR Components for React
// Lazy-loaded for optimal performance

// Types
export * from "./types";

// Components (lazy load these in routes)
export { ARButton } from "./components/ARButton";
export { ARViewer } from "./components/ARViewer";
export { ARPlace } from "./components/ARPlace";
export { ARScan } from "./components/ARScan";

// Engine utilities
export { useLazy, preloadModule } from "./engine/useLazy";
export * from "./engine/arSupport";

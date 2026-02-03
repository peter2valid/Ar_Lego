/**
 * Product type matching Supabase products table
 */
export interface Product {
    id: string;
    slug: string;
    title: string;
    category: string;
    description?: string;
    thumbnail_url?: string;
    model_glb_url?: string;
    model_usdz_url?: string;
    target_image_url?: string;
    target_mind_url?: string;
    width_m?: number;
    height_m?: number;
    depth_m?: number;
    created_at?: string;
}

/**
 * AR mode types
 */
export type ARMode = "view" | "place" | "scan";

/**
 * AR session state
 */
export interface ARSessionState {
    isSupported: boolean;
    isActive: boolean;
    error?: string;
}

/**
 * Gesture state for 3D manipulation
 */
export interface GestureState {
    scale: number;
    rotation: number; // radians
    position: { x: number; y: number; z: number };
}

/**
 * Hit test result for WebXR placement
 */
export interface HitTestResult {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
}

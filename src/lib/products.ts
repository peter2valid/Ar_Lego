import { supabase } from "./supabase";
import type { Product } from "../ar-kit/types";

// In-memory cache for products
let productsCache: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fallback demo product if database is empty or fails
const DEMO_PRODUCT: Product = {
    id: "demo-cube",
    slug: "demo-cube",
    title: "Demo Cube (3D Test)",
    category: "electronics",
    description: "A simple 3D cube to test AR viewing capabilities. This appears because no products were loaded from the database.",
    thumbnail_url: "https://modelviewer.dev/shared-assets/models/Astronaut.png",
    model_glb_url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", // Reliable public test model
    target_mind_url: undefined, // No target for this demo
    created_at: new Date().toISOString()
};

/**
 * Get all products with caching
 */
export async function getProducts(): Promise<Product[]> {
    const now = Date.now();

    // Return cached data if valid
    if (productsCache && now - cacheTimestamp < CACHE_DURATION) {
        return productsCache;
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase Error fetching products:", error);
            // Don't throw, return demo product to keep app usable
            return [DEMO_PRODUCT];
        }

        if (!data || data.length === 0) {
            console.warn("No products found in DB. Showing demo product.");
            return [DEMO_PRODUCT];
        }

        productsCache = data as Product[];
        cacheTimestamp = now;
        return productsCache;

    } catch (err) {
        console.error("Unexpected error fetching products:", err);
        return [DEMO_PRODUCT];
    }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    // Check demo product first
    if (slug === DEMO_PRODUCT.slug) {
        return DEMO_PRODUCT;
    }

    // Try cache first
    if (productsCache) {
        const cached = productsCache.find((p) => p.slug === slug);
        if (cached) return cached;
    }

    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null; // Not found
            console.error("Error fetching product:", error);
            return null;
        }

        return data as Product;
    } catch (err) {
        console.error("Error fetching product:", err);
        return null;
    }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
    const products = await getProducts();
    if (category === "all") return products;
    return products.filter((p) => p.category === category);
}

/**
 * Prefetch a model URL (for link preloading)
 */
export function prefetchModel(url: string | null | undefined): void {
    if (!url) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "fetch";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
}

/**
 * Clear the products cache
 */
export function clearProductsCache(): void {
    productsCache = null;
    cacheTimestamp = 0;
}

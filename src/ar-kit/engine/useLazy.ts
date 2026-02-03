import { useState, useEffect, useCallback } from "react";

type LazyModule<T> = () => Promise<{ default: T } | T>;

interface UseLazyResult<T> {
    module: T | null;
    isLoading: boolean;
    error: Error | null;
    load: () => Promise<T | null>;
}

/**
 * Hook for lazy loading heavy modules only when needed
 * Use this to defer loading Three.js, MindAR, etc. until AR is activated
 */
export function useLazy<T>(
    loader: LazyModule<T>,
    autoLoad = false
): UseLazyResult<T> {
    const [module, setModule] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async (): Promise<T | null> => {
        if (module) return module;

        setIsLoading(true);
        setError(null);

        try {
            const loaded = await loader();
            const mod = "default" in loaded ? loaded.default : loaded;
            setModule(mod as T);
            return mod as T;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            console.error("Failed to load module:", error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [loader, module]);

    useEffect(() => {
        if (autoLoad && !module && !isLoading) {
            load();
        }
    }, [autoLoad, module, isLoading, load]);

    return { module, isLoading, error, load };
}

/**
 * Preload a module without using it immediately
 */
export function preloadModule<T>(loader: LazyModule<T>): void {
    loader().catch(console.error);
}

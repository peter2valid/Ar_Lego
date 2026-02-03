import React, { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import type { Product } from "../types";

// Extend JSX to include model-viewer
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    alt?: string;
                    ar?: boolean;
                    "ar-modes"?: string;
                    "camera-controls"?: boolean;
                    "touch-action"?: string;
                    poster?: string;
                    loading?: "auto" | "lazy" | "eager";
                    reveal?: "auto" | "manual";
                    "auto-rotate"?: boolean;
                    "shadow-intensity"?: string;
                    "environment-image"?: string;
                    exposure?: string;
                    "ios-src"?: string;
                },
                HTMLElement
            >;
        }
    }
}

interface ARViewerProps {
    product: Product;
    onClose?: () => void;
}

/**
 * AR Viewer using Google's model-viewer
 * Best compatibility, supports "View in your space" on supported devices
 */
export const ARViewer: React.FC<ARViewerProps> = ({ product, onClose }) => {
    const viewerRef = useRef<HTMLElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const handleLoad = () => setIsLoading(false);
        const handleError = () => {
            setIsLoading(false);
            setError("Failed to load 3D model");
        };

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);

        return () => {
            viewer.removeEventListener("load", handleLoad);
            viewer.removeEventListener("error", handleError);
        };
    }, []);

    if (!product.model_glb_url) {
        return (
            <div className="ar-viewer ar-viewer--error">
                <p>No 3D model available for this product.</p>
                {onClose && (
                    <button onClick={onClose} className="ar-viewer__close">
                        Close
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="ar-viewer">
            {onClose && (
                <button onClick={onClose} className="ar-viewer__close" aria-label="Close">
                    ✕
                </button>
            )}

            {isLoading && (
                <div className="ar-viewer__loading">
                    <div className="ar-viewer__spinner" />
                    <p>Loading 3D model...</p>
                </div>
            )}

            {error && (
                <div className="ar-viewer__error">
                    <p>{error}</p>
                </div>
            )}

            <model-viewer
                ref={viewerRef}
                src={product.model_glb_url}
                ios-src={product.model_usdz_url}
                alt={product.title}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                touch-action="pan-y"
                poster={product.thumbnail_url}
                loading="eager"
                shadow-intensity="1"
                auto-rotate
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                }}
            />

            <div className="ar-viewer__info">
                <h2>{product.title}</h2>
                {product.description && <p>{product.description}</p>}
            </div>
        </div>
    );
};

export default ARViewer;

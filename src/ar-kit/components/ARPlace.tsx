import React, { useEffect, useState } from "react";
import type { Product } from "../types";

interface ARPlaceProps {
    product: Product;
    onClose?: () => void;
}

/**
 * AR Place component using <model-viewer>
 * Replaces manual WebXR implementation for better compatibility.
 */
export const ARPlace: React.FC<ARPlaceProps> = ({ product, onClose }) => {
    const [libLoaded, setLibLoaded] = useState(false);

    useEffect(() => {
        // Lazy load model-viewer
        import("@google/model-viewer").then(() => {
            setLibLoaded(true);
        }).catch(console.error);
    }, []);

    if (!libLoaded) {
        return (
            <div className="ar-place ar-place--loading">
                <div className="spinner" />
                <p>Loading AR Engine...</p>
            </div>
        );
    }

    return (
        <div className="ar-place">
            <button
                onClick={onClose}
                className="ar-place__close"
                aria-label="Close"
                style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}
            >
                ✕
            </button>

            <model-viewer
                src={product.model_glb_url}
                ios-src={product.model_usdz_url || undefined}
                alt={product.title}
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-placement="floor"
                camera-controls
                shadow-intensity="1"
                auto-rotate
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#222",
                }}
            >
                {/* Custom AR Button */}
                <button slot="ar-button" className="ar-place__start">
                    📍 Place in Room
                </button>
            </model-viewer>

            <div className="ar-place__overlay" style={{ pointerEvents: 'none' }}>
                <div className="ar-place__instructions" style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    <p>Tap "Place in Room" to start</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Best on Android Chrome • iPhone uses Quick Look</p>
                </div>
            </div>
        </div>
    );
};

export default ARPlace;

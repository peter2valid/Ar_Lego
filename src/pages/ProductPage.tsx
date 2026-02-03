import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductBySlug, prefetchModel } from "../lib/products";
import { ARButton } from "../ar-kit/components/ARButton";
import { PhoneSimulator } from "../components/PhoneSimulator";
import { QRCodeDisplay } from "../components/QRCodeDisplay";
import type { Product } from "../ar-kit/types";

export const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            try {
                const data = await getProductBySlug(slug);
                if (!data) {
                    setError("Product not found");
                } else {
                    setProduct(data);
                    // Prefetch the 3D model in background
                    prefetchModel(data.model_glb_url);
                }
            } catch (err) {
                setError("Failed to load product");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="product-page product-page--loading">
                <div className="spinner" />
                <p>Loading product...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-page product-page--error">
                <h2>{error || "Product not found"}</h2>
                <Link to="/" className="btn">
                    ← Back to Home
                </Link>
            </div>
        );
    }

    // Generate the full URL for AR viewing on mobile
    const arUrl = `${window.location.origin}/ar/view/${product.slug}`;

    return (
        <div className="product-page">
            <header className="product-header">
                <Link to="/" className="product-header__back">
                    ← Back
                </Link>
                <h1>{product.title}</h1>
            </header>

            <div className="product-layout">
                {/* Left Column: Product Info */}
                <div className="product-info-column">
                    <div className="product-hero">
                        {product.thumbnail_url ? (
                            <img
                                src={product.thumbnail_url}
                                alt={product.title}
                                className="product-hero__image"
                            />
                        ) : (
                            <div className="product-hero__placeholder">
                                <span>📦</span>
                            </div>
                        )}
                    </div>

                    <div className="product-details">
                        <span className="product-details__category">{product.category}</span>
                        {product.description && (
                            <p className="product-details__description">{product.description}</p>
                        )}

                        {(product.width_m || product.height_m || product.depth_m) && (
                            <div className="product-details__dimensions">
                                <h4>Dimensions</h4>
                                <ul>
                                    {product.width_m && <li>Width: {product.width_m}m</li>}
                                    {product.height_m && <li>Height: {product.height_m}m</li>}
                                    {product.depth_m && <li>Depth: {product.depth_m}m</li>}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="product-ar-actions">
                        <h3>Experience in AR</h3>
                        <div className="ar-buttons">
                            <ARButton
                                mode="view"
                                onClick={() => navigate(`/ar/view/${slug}`)}
                                disabled={!product.model_glb_url}
                            />
                            <ARButton
                                mode="place"
                                onClick={() => navigate(`/ar/place/${slug}`)}
                                disabled={!product.model_glb_url}
                            />
                            <ARButton
                                mode="scan"
                                onClick={() => navigate(`/ar/scan/${slug}`)}
                                disabled={!product.target_mind_url && !product.target_image_url}
                            />
                        </div>
                        {!product.model_glb_url && (
                            <p className="ar-buttons__hint">3D model not yet uploaded</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Phone Simulator & QR Code */}
                <div className="product-simulation-column">
                    <div className="simulation-wrapper">
                        <h3>Mobile Simulation</h3>
                        <PhoneSimulator>
                            {product.model_glb_url ? (
                                <>
                                    <model-viewer
                                        src={product.model_glb_url}
                                        poster={product.thumbnail_url}
                                        alt={product.title}
                                        auto-rotate
                                        camera-controls
                                        shadow-intensity="1"
                                        environment-image="neutral"
                                        style={{ width: "100%", height: "100%", backgroundColor: "#1a1a24" }}
                                    >
                                        <button className="ar-overlay-button" slot="ar-button" style={{ display: 'none' }}>
                                            View in your space
                                        </button>
                                    </model-viewer>

                                    {/* Custom Overlay AR Button */}
                                    <button
                                        className="ar-overlay-trigger"
                                        onClick={() => navigate(`/ar/view/${product.slug}`)}
                                        title="Open Fullscreen AR View"
                                    >
                                        <span className="ar-icon">👁️</span>
                                        <span>View in AR</span>
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                                    <p>No 3D Model</p>
                                </div>
                            )}
                        </PhoneSimulator>
                    </div>

                    <div className="qrcode-wrapper">
                        <h3>Scan to View on Mobile</h3>
                        <QRCodeDisplay url={arUrl} />
                        <p className="qrcode-hint">Point your phone camera here to launch AR directly</p>
                    </div>
                </div>
            </div>

            <style>{`
        .product-layout {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        @media (min-width: 1024px) {
            .product-layout {
                flex-direction: row;
                align-items: flex-start;
            }
            
            .product-info-column {
                flex: 1;
                max-width: 500px;
            }
            
            .product-simulation-column {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                position: sticky;
                top: 80px;
            }
        }
        
        .simulation-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        
        .simulation-wrapper h3, .qrcode-wrapper h3 {
            color: var(--color-text);
            font-size: 1.1rem;
            margin: 0;
            text-align: center;
        }
        
        .qrcode-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            background: var(--color-surface);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
        }
        
        .qrcode-hint {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            max-width: 200px;
            text-align: center;
        }

        .ar-overlay-trigger {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            font-size: 0.9rem;
            z-index: 100;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .ar-overlay-trigger:hover {
            background: var(--color-primary);
            color: black;
            transform: scale(1.05);
        }

        .ar-icon {
            font-size: 1.1rem;
        }
      `}</style>
        </div>
    );
};

export default ProductPage;

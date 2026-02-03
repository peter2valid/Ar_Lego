import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../lib/products";
import type { Product } from "../ar-kit/types";

const categories = ["all", "electronics", "furniture", "food"];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [showPreview, setShowPreview] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="product-card">
            <div
                className="product-card__image"
                onMouseEnter={() => setShowPreview(true)}
                onMouseLeave={() => setShowPreview(false)}
                style={{ cursor: "pointer", position: "relative" }}
            >
                {showPreview && product.model_glb_url ? (
                    <model-viewer
                        src={product.model_glb_url}
                        poster={product.thumbnail_url}
                        alt={product.title}
                        auto-rotate
                        camera-controls
                        shadow-intensity="1"
                        environment-image="neutral"
                        style={{ width: "100%", height: "100%", backgroundColor: "#1a1a24" }}
                    />
                ) : product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.title} />
                ) : (
                    <div className="product-card__placeholder">
                        <span>📦</span>
                    </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="product-card__actions">
                    <button
                        className="btn-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ar/view/${product.slug}`);
                        }}
                        title="Full 3D View"
                    >
                        👁️
                    </button>
                    <button
                        className="btn-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/p/${product.slug}`);
                        }}
                        title="Details"
                    >
                        ℹ️
                    </button>
                </div>
            </div>

            <div className="product-card__info">
                <h3>{product.title}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="product-card__category">{product.category}</span>
                    {product.model_glb_url && <span style={{ fontSize: "0.7rem", color: "var(--color-primary)" }}>3D Ready</span>}
                </div>
            </div>
        </div>
    );
};

export const HomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts =
        activeCategory === "all"
            ? products
            : products.filter((p) => p.category === activeCategory);

    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-header__content">
                    <h1>AR Lego</h1>
                    <p>Instant AR Product Viewer</p>
                </div>
            </header>

            <section className="category-filter">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`category-filter__btn ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </section>

            <main className="product-grid">
                {loading && (
                    <div className="product-grid__loading">
                        <div className="spinner" />
                        <p>Loading products...</p>
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="product-grid__empty">
                        <p>No products found.</p>
                    </div>
                )}

                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </main>

            <style>{`
        .product-card__actions {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .product-card:hover .product-card__actions {
            opacity: 1;
        }
        .btn-icon {
            background: rgba(0,0,0,0.6);
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
            font-size: 1.2rem;
        }
        .btn-icon:hover {
            background: var(--color-primary);
            color: black;
            transform: scale(1.1);
        }
      `}</style>
        </div>
    );
};

export default HomePage;

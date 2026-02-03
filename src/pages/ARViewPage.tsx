import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug } from "../lib/products";
import { ARViewer } from "../ar-kit/components/ARViewer";
import type { Product } from "../ar-kit/types";

export const ARViewPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            try {
                const data = await getProductBySlug(slug);
                setProduct(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    const handleClose = () => {
        navigate(`/p/${slug}`);
    };

    if (loading) {
        return (
            <div className="ar-page ar-page--loading">
                <div className="spinner" />
                <p>Loading viewer...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="ar-page ar-page--error">
                <p>Product not found</p>
                <button onClick={() => navigate("/")} className="btn">
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="ar-page">
            <ARViewer product={product} onClose={handleClose} />
        </div>
    );
};

export default ARViewPage;

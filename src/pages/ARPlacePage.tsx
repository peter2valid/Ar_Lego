import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug } from "../lib/products";
import { ARPlace } from "../ar-kit/components/ARPlace";
import { supportsWebXRImmersiveAR, isIOS, isAndroid } from "../ar-kit/engine/arSupport";
import type { Product } from "../ar-kit/types";

export const ARPlacePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [supportChecked, setSupportChecked] = useState(false);

    // 1. Check AR support first
    useEffect(() => {
        const checkSupport = async () => {
            const hasWebXR = await supportsWebXRImmersiveAR();
            const isApple = isIOS();
            const isDroid = isAndroid();

            // If device supports WebXR (Android Chrome mostly) OR is iOS (Quick Look), stay here.
            // Otherwise, fallback to the standard 3D viewer.
            // Note: We'll let ARPlace handle the actual iOS Quick Look trigger.
            if (hasWebXR || isApple || isDroid) {
                setSupportChecked(true);
            } else {
                console.warn("AR Placement not supported on this device. Redirecting to Viewer.");
                if (slug) {
                    navigate(`/ar/view/${slug}`, { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            }
        };
        checkSupport();
    }, [slug, navigate]);

    // 2. Load product data
    useEffect(() => {
        if (!slug || !supportChecked) return;

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
    }, [slug, supportChecked]);

    const handleClose = () => {
        navigate(`/p/${slug}`);
    };

    if (!supportChecked || loading) {
        return (
            <div className="ar-page ar-page--loading">
                <div className="spinner" />
                <p>Checking device capabilities...</p>
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
            <ARPlace product={product} onClose={handleClose} />
        </div>
    );
};

export default ARPlacePage;

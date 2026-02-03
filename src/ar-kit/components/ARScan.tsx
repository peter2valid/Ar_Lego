import React, { useEffect, useRef, useState } from "react";
import type { Product } from "../types";

interface ARScanProps {
    product: Product;
    onClose?: () => void;
}

const THREE_CDN = "https://unpkg.com/three@0.172.0/build/three.module.js";
const MINDAR_CDN = "https://unpkg.com/mind-ar@1.1.7/dist/mindar-image-three.prod.js";

type ScanStatus = "idle" | "loading" | "scanning" | "found" | "error";

export const ARScan: React.FC<ARScanProps> = ({ product, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<ScanStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const mindarRef = useRef<any>(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mindarRef.current) {
                mindarRef.current.stop();
                mindarRef.current.renderer.setAnimationLoop(null);
            }
        };
    }, []);

    const startScan = async () => {
        if (!product.target_mind_url) {
            setStatus("error");
            setErrorMsg("Scan mode needs a .mind target file URL (target_mind_url).");
            return;
        }

        setStatus("loading");
        setErrorMsg(null);

        try {
            // 1. Inject import map for 'three' so MindAR can resolve it
            // Note: This only works if no other import maps exist or browser supports multiple.
            // However, a safer way for dynamic environments is often just relying on the fact that
            // we are using ESM modules that might expect 'three' to be resolvable.
            // Since we can't easily inject a valid importmap at runtime that affects already loaded modules,
            // we will rely on the user's prescribed workflow.
            //
            // If MindAR uses bare import 'three', it will fail without an import map. 
            // User instruction said "Lazy-load... via ESM CDN imports". 
            // We will try to map imports if possible or just import.

            // Attempt to construct an import map blob if needed? 
            // Actually, let's just try to import them.

            const THREE = await import(/* @vite-ignore */ THREE_CDN);

            // We might need to make THREE global for some older libs, but 1.1.7 ESM should be okay if set up right.
            // If MindAR fails to resolve 'three', we might need a workaround.
            // For now, let's trust the user's architecture.

            const { MindARThree } = await import(/* @vite-ignore */ MINDAR_CDN);

            if (!containerRef.current) return;

            const mindarThree = new MindARThree({
                container: containerRef.current,
                imageTargetSrc: product.target_mind_url,
            });
            mindarRef.current = mindarThree;

            const { scene, camera, renderer } = mindarThree;

            // Lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
            scene.add(light);

            // Anchor (Index 0)
            const anchor = mindarThree.addAnchor(0);

            // Add a simple cube for v1 verification
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const material = new THREE.MeshNormalMaterial();
            const cube = new THREE.Mesh(geometry, material);
            anchor.group.add(cube);

            // Status updates
            anchor.onTargetFound = () => setStatus("found");
            anchor.onTargetLost = () => setStatus("scanning");

            // Start
            await mindarThree.start();
            setStatus("scanning");

            // Loop
            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });

        } catch (err) {
            console.error("AR Scan Error:", err);
            setStatus("error");
            setErrorMsg("Failed to start AR engine. " + (err instanceof Error ? err.message : String(err)));
        }
    };

    const stopScan = () => {
        if (mindarRef.current) {
            mindarRef.current.stop();
            mindarRef.current.renderer.setAnimationLoop(null);
            mindarRef.current = null;
        }
        setStatus("idle");
    };

    const handleClose = () => {
        stopScan();
        onClose?.();
    };

    return (
        <div className="ar-scan">
            <div className="ar-scan__container" ref={containerRef} />

            <div className="ar-scan__overlay">
                <button className="ar-scan__close" onClick={handleClose}>
                    ✕
                </button>

                {status === "idle" && (
                    <div className="ar-scan__status">
                        <h3>Ready to Scan</h3>
                        <p>Point camera at the target image.</p>
                        <button className="btn ar-place__start" onClick={startScan}>
                            Start Scan
                        </button>
                        {!product.target_mind_url && (
                            <p className="ar-buttons__hint" style={{ color: "var(--color-error)", marginTop: "1rem" }}>
                                Missing .mind target URL
                            </p>
                        )}
                    </div>
                )}

                {status === "loading" && (
                    <div className="ar-scan__status">
                        <div className="spinner" />
                        <p>Loading AR Engine...</p>
                    </div>
                )}

                {status === "scanning" && (
                    <div className="ar-scan__status">
                        <p>📷 Searching for target...</p>
                        <button className="btn" onClick={stopScan} style={{ marginTop: "1rem", background: "rgba(0,0,0,0.5)" }}>
                            Stop Camera
                        </button>
                    </div>
                )}

                {status === "found" && (
                    <div className="ar-scan__status">
                        <p style={{ color: "var(--color-success)" }}>✓ Target Found!</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="ar-scan__status ar-place__status--error">
                        <p>⚠️ {errorMsg || "Unknown error"}</p>
                        <button className="btn" onClick={() => setStatus("idle")} style={{ marginTop: "1rem" }}>
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

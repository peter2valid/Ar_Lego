import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Product, HitTestResult } from "../types";
import { isWebXRSupported, requestCameraPermission } from "../engine/webxrPlace";

interface ARPlaceProps {
    product: Product;
    onClose?: () => void;
}

/**
 * AR Place component using Three.js + WebXR
 * Tap to place objects on real-world surfaces
 */
export const ARPlace: React.FC<ARPlaceProps> = ({ product, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<"checking" | "unsupported" | "ready" | "active" | "error">("checking");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hitResult, setHitResult] = useState<HitTestResult | null>(null);
    const [isPlaced, setIsPlaced] = useState(false);

    // Three.js refs (loaded dynamically)
    const sceneRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const rendererRef = useRef<any>(null);
    const modelRef = useRef<any>(null);
    const sessionRef = useRef<XRSession | null>(null);

    // Check WebXR support on mount
    useEffect(() => {
        const checkSupport = async () => {
            const supported = await isWebXRSupported();
            setStatus(supported ? "ready" : "unsupported");
        };
        checkSupport();
    }, []);

    // Start AR session
    const startAR = useCallback(async () => {
        if (!containerRef.current || !product.model_glb_url) return;

        try {
            // Request camera permission first
            const hasCamera = await requestCameraPermission();
            if (!hasCamera) {
                setStatus("error");
                setErrorMessage("Camera permission denied");
                return;
            }

            // Dynamically import Three.js
            const THREE = await import("three");
            const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

            // Set up Three.js scene
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.xr.enabled = true;
            rendererRef.current = renderer;

            containerRef.current.appendChild(renderer.domElement);

            // Add lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
            scene.add(light);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0.5, 1, 0.5);
            scene.add(directionalLight);

            // Load the 3D model
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(product.model_glb_url);
            const model = gltf.scene;

            // Scale based on product dimensions if available
            if (product.width_m && product.height_m && product.depth_m) {
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetSize = Math.max(product.width_m, product.height_m, product.depth_m);
                const scale = targetSize / maxDim;
                model.scale.setScalar(scale);
            } else {
                // Default scale for visibility
                model.scale.setScalar(0.5);
            }

            model.visible = false;
            scene.add(model);
            modelRef.current = model;

            // Start WebXR session
            const session = await navigator.xr!.requestSession("immersive-ar", {
                requiredFeatures: ["hit-test", "local-floor"],
                optionalFeatures: ["dom-overlay"],
                domOverlay: containerRef.current ? { root: containerRef.current } : undefined,
            });

            sessionRef.current = session;
            renderer.xr.setReferenceSpaceType("local-floor");
            await renderer.xr.setSession(session);

            // Set up hit testing
            const viewerSpace = await session.requestReferenceSpace("viewer");
            const hitTestSource = await session.requestHitTestSource!({ space: viewerSpace });
            const localSpace = await session.requestReferenceSpace("local-floor");

            // Reticle for placement preview
            const reticleGeometry = new THREE.RingGeometry(0.1, 0.12, 32);
            reticleGeometry.rotateX(-Math.PI / 2);
            const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
            const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
            reticle.visible = false;
            scene.add(reticle);

            // Animation loop
            renderer.setAnimationLoop((_time: number, frame?: XRFrame) => {
                if (!frame) return;

                const hitTestResults = frame.getHitTestResults(hitTestSource!);

                if (hitTestResults.length > 0 && !isPlaced) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(localSpace);

                    if (pose) {
                        reticle.visible = true;
                        reticle.position.set(
                            pose.transform.position.x,
                            pose.transform.position.y,
                            pose.transform.position.z
                        );

                        setHitResult({
                            position: {
                                x: pose.transform.position.x,
                                y: pose.transform.position.y,
                                z: pose.transform.position.z,
                            },
                            rotation: {
                                x: pose.transform.orientation.x,
                                y: pose.transform.orientation.y,
                                z: pose.transform.orientation.z,
                                w: pose.transform.orientation.w,
                            },
                        });
                    }
                } else if (!isPlaced) {
                    reticle.visible = false;
                    setHitResult(null);
                }

                renderer.render(scene, camera);
            });

            // Handle tap to place
            session.addEventListener("select", () => {
                if (hitResult && model && !isPlaced) {
                    model.position.set(hitResult.position.x, hitResult.position.y, hitResult.position.z);
                    model.visible = true;
                    reticle.visible = false;
                    setIsPlaced(true);
                }
            });

            session.addEventListener("end", () => {
                setStatus("ready");
                setIsPlaced(false);
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
            });

            setStatus("active");
        } catch (err) {
            console.error("AR Place error:", err);
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Failed to start AR");
        }
    }, [product, hitResult, isPlaced]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                sessionRef.current.end().catch(console.error);
            }
        };
    }, []);

    const handleClose = async () => {
        if (sessionRef.current) {
            await sessionRef.current.end();
        }
        onClose?.();
    };

    return (
        <div className="ar-place" ref={containerRef}>
            {/* UI Overlay */}
            <div className="ar-place__overlay">
                <button onClick={handleClose} className="ar-place__close" aria-label="Close">
                    ✕
                </button>

                {status === "checking" && (
                    <div className="ar-place__status">
                        <p>Checking AR support...</p>
                    </div>
                )}

                {status === "unsupported" && (
                    <div className="ar-place__status ar-place__status--error">
                        <p>WebXR AR is not supported on this device.</p>
                        <p>Try using Chrome on Android.</p>
                    </div>
                )}

                {status === "ready" && (
                    <div className="ar-place__status">
                        <h3>{product.title}</h3>
                        <button onClick={startAR} className="ar-place__start">
                            📍 Start AR Placement
                        </button>
                    </div>
                )}

                {status === "active" && !isPlaced && (
                    <div className="ar-place__instructions">
                        <p>{hitResult ? "Tap to place" : "Point at a surface"}</p>
                    </div>
                )}

                {status === "active" && isPlaced && (
                    <div className="ar-place__instructions">
                        <p>✓ Placed! Pinch to resize, drag to move.</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="ar-place__status ar-place__status--error">
                        <p>{errorMessage || "An error occurred"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ARPlace;

import type { HitTestResult } from "../types";

/**
 * Check if WebXR is supported
 */
export async function isWebXRSupported(): Promise<boolean> {
    if (!("xr" in navigator)) return false;

    try {
        return await navigator.xr!.isSessionSupported("immersive-ar");
    } catch {
        return false;
    }
}

/**
 * Check if hit-test is supported
 */
export async function isHitTestSupported(): Promise<boolean> {
    if (!("xr" in navigator)) return false;

    try {
        // Check for hit-test feature
        const supported = await navigator.xr!.isSessionSupported("immersive-ar");
        return supported;
    } catch {
        return false;
    }
}

/**
 * Request camera permission explicitly
 */
export async function requestCameraPermission(): Promise<boolean> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
    } catch {
        return false;
    }
}

/**
 * Start a WebXR AR session with hit-test
 */
export async function startARSession(
    onHitTest: (result: HitTestResult | null) => void,
    onSessionEnd: () => void
): Promise<XRSession | null> {
    if (!await isWebXRSupported()) {
        console.error("WebXR AR not supported");
        return null;
    }

    try {
        const session = await navigator.xr!.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test", "local-floor"],
            optionalFeatures: ["dom-overlay"],
        });

        session.addEventListener("end", onSessionEnd);

        // Set up hit-test source
        const viewerSpace = await session.requestReferenceSpace("viewer");
        const hitTestSource = await session.requestHitTestSource!({
            space: viewerSpace,
        });

        const localSpace = await session.requestReferenceSpace("local-floor");

        // Frame loop for hit testing
        const onFrame = (_time: number, frame: XRFrame) => {
            const hitTestResults = frame.getHitTestResults(hitTestSource!);

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(localSpace);

                if (pose) {
                    const { position, orientation } = pose.transform;
                    onHitTest({
                        position: { x: position.x, y: position.y, z: position.z },
                        rotation: {
                            x: orientation.x,
                            y: orientation.y,
                            z: orientation.z,
                            w: orientation.w,
                        },
                    });
                }
            } else {
                onHitTest(null);
            }

            session.requestAnimationFrame(onFrame);
        };

        session.requestAnimationFrame(onFrame);

        return session;
    } catch (error) {
        console.error("Failed to start AR session:", error);
        return null;
    }
}

/**
 * End a WebXR session
 */
export async function endARSession(session: XRSession | null): Promise<void> {
    if (session) {
        try {
            await session.end();
        } catch (error) {
            console.error("Error ending AR session:", error);
        }
    }
}

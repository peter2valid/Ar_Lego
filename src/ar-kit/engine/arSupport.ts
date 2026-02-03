/**
 * Utility to check AR capabilities and device type
 */

/**
 * Check if the device supports WebXR immersive-ar mode
 * This is primarily for Android Chrome
 */
export async function supportsWebXRImmersiveAR(): Promise<boolean> {
    if (typeof navigator === "undefined" || !("xr" in navigator)) {
        return false;
    }

    try {
        // @ts-ignore - xr types might be missing or conflict
        return await navigator.xr.isSessionSupported("immersive-ar");
    } catch (e) {
        console.error("WebXR check failed:", e);
        return false;
    }
}

/**
 * Check if the current device is iOS (iPhone, iPad, iPod)
 * Useful for determining if we should use Quick Look (USDZ)
 */
export function isIOS(): boolean {
    if (typeof navigator === "undefined") return false;

    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
}

/**
 * Check if the current device is Android
 */
export function isAndroid(): boolean {
    if (typeof navigator === "undefined") return false;
    return /android/i.test(navigator.userAgent);
}

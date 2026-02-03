import type { GestureState } from "../types";

/**
 * Calculate pinch scale from two touch points
 */
export function getPinchScale(
    touch1: Touch,
    touch2: Touch,
    initialDistance: number
): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    return currentDistance / initialDistance;
}

/**
 * Calculate rotation angle from two touch points
 */
export function getPinchRotation(
    touch1: Touch,
    touch2: Touch,
    initialAngle: number
): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const currentAngle = Math.atan2(dy, dx);
    return currentAngle - initialAngle;
}

/**
 * Get initial distance between two touches
 */
export function getInitialDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get initial angle between two touches
 */
export function getInitialAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Create gesture handlers for a 3D object
 */
export function createGestureHandlers(
    onUpdate: (state: Partial<GestureState>) => void,
    options: {
        minScale?: number;
        maxScale?: number;
        enableRotation?: boolean;
    } = {}
) {
    const { minScale = 0.1, maxScale = 5, enableRotation = true } = options;

    let initialDistance = 0;
    let initialAngle = 0;
    let initialScale = 1;
    let initialRotation = 0;

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            const [touch1, touch2] = [e.touches[0], e.touches[1]];
            initialDistance = getInitialDistance(touch1, touch2);
            initialAngle = getInitialAngle(touch1, touch2);
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            const [touch1, touch2] = [e.touches[0], e.touches[1]];

            // Scale
            const scaleMultiplier = getPinchScale(touch1, touch2, initialDistance);
            const newScale = clamp(initialScale * scaleMultiplier, minScale, maxScale);

            // Rotation
            let newRotation = initialRotation;
            if (enableRotation) {
                newRotation = initialRotation + getPinchRotation(touch1, touch2, initialAngle);
            }

            onUpdate({ scale: newScale, rotation: newRotation });
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
            // Store the final values for the next gesture
            // This would need to be handled by the component
        }
    };

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        setInitialState: (scale: number, rotation: number) => {
            initialScale = scale;
            initialRotation = rotation;
        },
    };
}

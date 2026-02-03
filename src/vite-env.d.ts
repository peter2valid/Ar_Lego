/// <reference types="vite/client" />

// Environment variables
interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// MindAR module declarations
declare module "mind-ar/dist/mindar-image-three.prod.js" {
    import type { Scene, Camera, WebGLRenderer, Group } from "three";

    export interface MindARThreeOptions {
        container: HTMLElement;
        imageTargetSrc: string;
        maxTrack?: number;
        uiLoading?: string;
        uiScanning?: string;
        uiError?: string;
        filterMinCF?: number;
        filterBeta?: number;
        warmupTolerance?: number;
        missTolerance?: number;
    }

    export class MindARThree {
        constructor(options: MindARThreeOptions);
        scene: Scene;
        camera: Camera;
        renderer: WebGLRenderer;
        start(): Promise<void>;
        stop(): void;
        addAnchor(targetIndex: number): {
            group: Group;
            onTargetFound?: () => void;
            onTargetLost?: () => void;
        };
    }
}

// WebXR types (for browsers that support it)
interface XRSession {
    requestHitTestSource?(options: { space: XRReferenceSpace }): Promise<XRHitTestSource>;
    requestReferenceSpace(type: string): Promise<XRReferenceSpace>;
    requestAnimationFrame(callback: (time: number, frame: XRFrame) => void): number;
    addEventListener(type: string, listener: EventListener): void;
    end(): Promise<void>;
}

interface XRHitTestSource {
    cancel(): void;
}

interface XRFrame {
    getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
}

interface XRHitTestResult {
    getPose(space: XRReferenceSpace): XRPose | null;
}

interface XRPose {
    transform: {
        position: { x: number; y: number; z: number };
        orientation: { x: number; y: number; z: number; w: number };
    };
}

interface XRReferenceSpace { }

interface Navigator {
    xr?: {
        isSessionSupported(mode: string): Promise<boolean>;
        requestSession(mode: string, options?: object): Promise<XRSession>;
    };
}

// Extend JSX to include model-viewer
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    alt?: string;
                    ar?: boolean;
                    "ar-modes"?: string;
                    "camera-controls"?: boolean;
                    "touch-action"?: string;
                    poster?: string;
                    loading?: "auto" | "lazy" | "eager";
                    reveal?: "auto" | "manual";
                    "auto-rotate"?: boolean;
                    "shadow-intensity"?: string;
                    "environment-image"?: string;
                    exposure?: string;
                    "ios-src"?: string;
                },
                HTMLElement
            >;
        }
    }
}

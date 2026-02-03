import React from "react";
import type { ARMode } from "../types";

interface ARButtonProps {
    mode: ARMode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const modeConfig = {
    view: {
        icon: "👁️",
        label: "View",
        description: "View in 3D",
    },
    place: {
        icon: "📍",
        label: "Place",
        description: "Place in room",
    },
    scan: {
        icon: "📷",
        label: "Scan",
        description: "Scan target",
    },
};

/**
 * Reusable AR action button with consistent styling
 */
export const ARButton: React.FC<ARButtonProps> = ({
    mode,
    onClick,
    disabled = false,
    loading = false,
    className = "",
}) => {
    const config = modeConfig[mode];

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`ar-button ar-button--${mode} ${className}`}
            aria-label={config.description}
        >
            <span className="ar-button__icon">{loading ? "⏳" : config.icon}</span>
            <span className="ar-button__label">{config.label}</span>
        </button>
    );
};

export default ARButton;

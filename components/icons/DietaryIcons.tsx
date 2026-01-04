import {
    Nut,
    Wheat,
    Beef,
    Leaf,
    Milk,
    CameraOff,
    ShieldAlert,
    Check,
    X,
    AlertTriangle,
} from 'lucide-react';

/**
 * Professional Icon System for Bekkurinn
 * Replacing emoji with Lucide React icons
 */

// ========================================
// DIETARY NEED ICONS
// ========================================

export const DietaryIcons = {
    peanut: {
        icon: Nut,
        label: 'Jarðhnetur',
        color: 'var(--amber-dark)',
    },
    gluten: {
        icon: Wheat,
        label: 'Glúten',
        color: 'var(--amber-dark)',
    },
    pork: {
        icon: Beef,
        label: 'Svínakjöt',
        color: 'var(--amber-dark)',
    },
    vegan: {
        icon: Leaf,
        label: 'Vegan',
        color: 'var(--green-success)',
    },
    dairy: {
        icon: Milk,
        label: 'Mjólk',
        color: 'var(--amber-dark)',
    },
} as const;

// ========================================
// PRIVACY ICONS
// ========================================

export const PrivacyIcons = {
    photoBlocked: {
        icon: CameraOff,
        label: 'Engar myndir',
        color: 'var(--red)',
    },
    phoneHidden: {
        icon: ShieldAlert,
        label: 'Símanúmer falið',
        color: 'var(--text-tertiary)',
    },
} as const;

// ========================================
// STATUS ICONS
// ========================================

export const StatusIcons = {
    success: {
        icon: Check,
        color: 'var(--green-success)',
    },
    error: {
        icon: X,
        color: 'var(--red)',
    },
    warning: {
        icon: AlertTriangle,
        color: 'var(--amber)',
    },
} as const;

// ========================================
// HELPER COMPONENTS
// ========================================

interface DietaryIconProps {
    type: keyof typeof DietaryIcons;
    size?: number;
    showLabel?: boolean;
}

export function DietaryIcon({ type, size = 20, showLabel = true }: DietaryIconProps) {
    const config = DietaryIcons[type];
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="flex items-center justify-center rounded-full p-1.5"
                style={{ backgroundColor: `${config.color}20` }}
                title={config.label}
            >
                <Icon size={size} style={{ color: config.color }} strokeWidth={2} />
            </div>
            {showLabel && (
                <span
                    className="text-[10px] font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    {config.label}
                </span>
            )}
        </div>
    );
}

interface PrivacyIconProps {
    type: keyof typeof PrivacyIcons;
    size?: number;
}

export function PrivacyIcon({ type, size = 16 }: PrivacyIconProps) {
    const config = PrivacyIcons[type];
    const Icon = config.icon;

    return (
        <div
            className="flex items-center gap-1.5"
            title={config.label}
        >
            <Icon size={size} style={{ color: config.color }} strokeWidth={2} />
        </div>
    );
}

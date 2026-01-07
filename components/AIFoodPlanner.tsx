'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface AIFoodPlannerProps {
    childAge?: number;
    partyTime?: string;
    allergies?: string[];
    attendeeCount?: number;
}

export function AIFoodPlanner({
    childAge = 8,
    partyTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    allergies = [],
    attendeeCount = 12
}: AIFoodPlannerProps) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGetSuggestions = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai-food-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childAge,
                    partyTime,
                    allergies,
                    attendeeCount
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuggestions(data.suggestions);
            } else {
                setError(data.error || 'Villa kom upp');
            }
        } catch (err) {
            setError('Villa kom upp við að tengjast þjónustunni');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, var(--nordic-blue) 0%, var(--nordic-blue-dark) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Sparkles size={24} color="white" />
                </div>
                <div>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                    }}>
                        AI Næringarráðgjafi
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-tertiary)'
                    }}>
                        Fáðu smarta matseðilstillögur fyrir afmælið
                    </p>
                </div>
            </div>

            {/* Info Display */}
            <div style={{
                background: 'var(--stone)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 'var(--space-md)',
                    fontSize: '0.875rem'
                }}>
                    <div>
                        <strong>Aldur:</strong> {childAge} ára
                    </div>
                    <div>
                        <strong>Börn:</strong> {attendeeCount}
                    </div>
                    <div>
                        <strong>Óþol:</strong> {allergies.length > 0 ? allergies.join(', ') : 'Ekkert'}
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            {!suggestions && (
                <button
                    onClick={handleGetSuggestions}
                    disabled={loading}
                    className="nordic-button"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-sm)',
                        fontSize: '1.125rem'
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Býr til matseðil...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Fá matseðilstillögur
                        </>
                    )}
                </button>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    background: '#FEE2E2',
                    border: '1px solid #DC2626',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    color: '#991B1B',
                    marginTop: 'var(--space-lg)'
                }}>
                    {error}
                </div>
            )}

            {/* Suggestions Display */}
            {suggestions && (
                <div style={{
                    marginTop: 'var(--space-lg)',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                        color: 'var(--text-primary)'
                    }}>
                        {suggestions}
                    </div>

                    <button
                        onClick={() => setSuggestions(null)}
                        style={{
                            marginTop: 'var(--space-lg)',
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'transparent',
                            border: '2px solid var(--nordic-blue)',
                            color: 'var(--nordic-blue)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Búa til nýjan matseðil
                    </button>
                </div>
            )}
        </div>
    );
}

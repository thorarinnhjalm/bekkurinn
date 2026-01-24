'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface AIFoodPlannerProps {
    childAge?: number;
    partyTime?: string;
    allergies?: string[];
    attendeeCount?: number;
}

// Types for the AI response
interface MenuPlan {
    menu: Array<{
        title: string;
        description: string;
        isVegan: boolean;
        isGlutenFree: boolean;
    }>;
    shoppingList: string[];
    preparationSteps: string[];
    safetyTips: string[];
    estimatedCost: string;
}

export function AIFoodPlanner({
    childAge = 8,
    partyTime = new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    allergies = [],
    attendeeCount = 12
}: AIFoodPlannerProps) {
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<MenuPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGetSuggestions = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);

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
                // Parse the JSON string from Gemini
                try {
                    const parsedPlan = JSON.parse(data.suggestions);
                    setPlan(parsedPlan);
                } catch (e) {
                    console.error(e);
                    setError('Gat ekki lesið svar frá gervigreind (JSON error)');
                }
            } else {
                setError(data.error || 'Error occurred');
            }
        } catch (err) {
            setError('Error connecting to service');
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
            margin: '0 auto',
            textAlign: 'left'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
                borderBottom: '1px solid var(--stone)',
                paddingBottom: 'var(--space-md)'
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, var(--nordic-blue) 0%, var(--nordic-blue-dark) 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(74, 124, 158, 0.3)'
                }}>
                    <Sparkles size={28} color="white" />
                </div>
                <div>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        marginBottom: '0',
                        lineHeight: 1.2
                    }}>
                        AI Næringarráðgjafi
                    </h3>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        Afmælisveisla án ofnæmis • {attendeeCount} börn • {childAge} ára
                    </p>
                </div>
            </div>

            {/* CTA / Loading */}
            {!plan && !loading && (
                <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                    <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Ýttu á takkann til að fá sérsniðinn matseðil fyrir: <br />
                        <strong>{allergies.join(', ')}</strong>
                    </p>
                    <button
                        onClick={handleGetSuggestions}
                        className="nordic-button"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-sm)',
                            fontSize: '1.125rem',
                            padding: '1rem'
                        }}
                    >
                        <Sparkles size={20} />
                        Búa til matseðil
                    </button>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-secondary)' }}>
                    <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto var(--space-md)', color: 'var(--nordic-blue)' }} />
                    <p>Reikna út örugga valkosti...</p>
                    <small>Skoða innihaldslýsingar... Reikna kostnað...</small>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    color: '#B91C1C',
                    marginBottom: 'var(--space-lg)'
                }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ display: 'block', marginTop: '0.5rem', textDecoration: 'underline', cursor: "pointer", background: "none", border: "none", color: "inherit" }}>Prófa aftur</button>
                </div>
            )}

            {/* RESULT DISPLAY */}
            {plan && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>

                    {/* 1. Matseðill */}
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🍽️ Ráðlagður matseðill
                    </h4>
                    <div style={{ display: 'grid', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        {plan.menu.map((item, i) => (
                            <div key={i} style={{
                                border: '1px solid var(--stone)',
                                borderRadius: '12px',
                                padding: '1rem',
                                background: '#fafafa'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {item.isVegan && <span title="Vegan" style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>🌱 Vegan</span>}
                                        {item.isGlutenFree && <span title="Glútenlaust" style={{ background: '#FEF9C3', color: '#854D0E', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>🌾 GF</span>}
                                    </div>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.description}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
                        {/* 2. Innkaupalisti */}
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>🛒 Innkaupalisti</h4>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)' }}>
                                {plan.shoppingList.map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. Kostnaður & Tips */}
                        <div>
                            <div style={{ background: '#F0F9FF', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#0369A1', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>💰 Áætlaður kostnaður</h4>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0C4A6E', margin: 0 }}>{plan.estimatedCost}</p>
                            </div>

                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>⚠️ Öryggisábendingar</h4>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#B91C1C', fontSize: '0.9rem' }}>
                                {plan.safetyTips.map((tip, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setPlan(null)}
                        style={{
                            marginTop: 'var(--space-xl)',
                            width: '100%',
                            padding: '1rem',
                            background: 'transparent',
                            border: '2px dashed var(--stone)',
                            color: 'var(--text-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}
                    >
                        🔄 Búa til nýjan seðil
                    </button>
                </div>
            )}
        </div>
    );
}

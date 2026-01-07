'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Users, MessageCircle, Calendar, CheckCircle2, Heart, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Landing Page - Sells parents on why they need Bekkurinn
 */

export default function LandingPage() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #ffffff 0%, var(--stone) 100%)',
            fontFamily: 'var(--font-sans)'
        }}>
            {/* Hero Section */}
            <nav style={{
                padding: 'var(--space-lg) var(--space-xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--nordic-blue)'
                }}>
                    <Calendar size={32} />
                    Bekkurinn
                </div>
                <button
                    onClick={() => router.push('/is/login')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'transparent',
                        border: '2px solid var(--nordic-blue)',
                        color: 'var(--nordic-blue)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--nordic-blue)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--nordic-blue)';
                    }}
                >
                    Innskráning
                </button>
            </nav>

            {/* Hero */}
            <section style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease'
            }}>
                <div style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: 'var(--nordic-blue)20',
                    borderRadius: '2rem',
                    color: 'var(--nordic-blue)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    marginBottom: 'var(--space-lg)'
                }}>
                    Skipulagt kerfi fyrir bekkinn
                </div>

                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-lg)',
                    lineHeight: 1.2
                }}>
                    Engir fleiri týndir tölvupóstar.<br />
                    <span style={{ color: 'var(--nordic-blue)' }}>Bara samskipti sem virka.</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '700px',
                    margin: '0 auto var(--space-xl)',
                    lineHeight: 1.6
                }}>
                    Bekkurinn er kerfi sem gerir bekkjarfulltrúum kleift að skipuleggja bekkinn
                    án þess að týnast í Facebook-hópum, Google-skjölum eða tölvupóstum.
                </p>

                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => router.push('/is/login')}
                        className="nordic-button"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            fontSize: '1.125rem',
                            padding: '1rem 2rem'
                        }}
                    >
                        Byrja núna - ókeypis
                        <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={() => router.push('/is/why-us')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--nordic-blue)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1.125rem'
                        }}
                    >
                        Af hverju Bekkurinn?
                    </button>
                </div>
            </section>

            {/* Pain Points - The Problem */}
            <section style={{
                background: 'white',
                padding: 'var(--space-2xl) var(--space-xl)',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 'var(--space-sm)',
                        color: 'var(--text-primary)'
                    }}>
                        Kannast þú við þetta?
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-2xl)',
                        fontSize: '1.125rem'
                    }}>
                        Það sem bekkjarfulltrúar upplifa á hverjum degi:
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: 'var(--space-lg)',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        {[
                            {
                                color: '#EF4444',
                                title: '47 ósvaruð skilaboð',
                                description: 'Facebook-hópurinn er fullur af „Hvað er að gerast?" og „Hvenær er næsti fundur?"'
                            },
                            {
                                color: '#F59E0B',
                                title: 'Týndir tölvupóstar',
                                description: 'Helmingur foreldra sá ekki tilkynninguna þína. Afgangurinn gleymir henni eftir 10 mínútur.'
                            },
                            {
                                color: '#8B5CF6',
                                title: 'Excel-skjal úr helvíti',
                                description: '15 útgáfur af sama skjalinu, enginn veit hvor er rétt og einhver hefur eytt öllu.'
                            },
                            {
                                color: '#EC4899',
                                title: 'Þú ert alltaf að vinna',
                                description: 'Skilaboð klukkan 22:30 um sparinestið í fyrramálið.'
                            }
                        ].map((pain, i) => (
                            <div
                                key={i}
                                className="nordic-card"
                                style={{
                                    padding: 'var(--space-lg)',
                                    transition: 'all 0.3s ease',
                                    borderLeft: `4px solid ${pain.color}`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                }}
                            >
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    marginBottom: 'var(--space-sm)',
                                    color: 'var(--text-primary)'
                                }}>
                                    {pain.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {pain.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Solution */}
            <section style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'var(--space-2xl) var(--space-xl)'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 'var(--space-sm)',
                    color: 'var(--text-primary)'
                }}>
                    Allt sem þú þarft. Einn staður.
                </h2>
                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-2xl)',
                    fontSize: '1.125rem',
                    maxWidth: '600px',
                    margin: '0 auto var(--space-2xl)'
                }}>
                    Bekkurinn er ekki bara enn eitt verkfærið. Það er <strong>eina</strong> verkfærið sem þú þarft.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: 'var(--space-xl)',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}>
                    {[
                        {
                            icon: Users,
                            title: 'Nafnalisti sem uppfærist',
                            description: 'Aldrei aftur Google-blöð með „Símanúmer_Útgáfa_Final_FINAL_2.xlsx"'
                        },
                        {
                            icon: MessageCircle,
                            title: 'Tilkynningar sem virka',
                            description: 'Sendu tilkynningu til allra foreldra. Sjáðu hver hefur séð hana. Enginn týnist.'
                        },
                        {
                            icon: Calendar,
                            title: 'Vaktir og viðburðir',
                            description: 'Foreldrar skrá sig sjálfir. Þú færð áminningar. Ekkert ruglað Google-dagatal.'
                        },
                        {
                            icon: CheckCircle2,
                            title: 'Verkefnalisti',
                            description: 'Merktu verkefni sem kláruð. Allir sjá hvað er í gangi. Ljóst framundan.'
                        }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            style={{
                                textAlign: 'center',
                                padding: 'var(--space-lg)'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--nordic-blue)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto var(--space-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <feature.icon size={40} color="white" />
                            </div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                marginBottom: 'var(--space-sm)',
                                color: 'var(--text-primary)'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Parents Love It */}
            <section style={{
                background: 'linear-gradient(135deg, var(--nordic-blue) 0%, var(--nordic-blue-dark) 100%)',
                color: 'white',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Heart size={48} style={{ margin: '0 auto var(--space-lg)' }} />
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Af hverju foreldrar elska Bekkurinn
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--space-lg)',
                        marginTop: 'var(--space-xl)'
                    }}>
                        {[
                            { icon: Shield, text: 'Ekkert týnist - allt á einum stað' },
                            { icon: Zap, text: '5 mínútur í stað 5 klukkustunda' },
                            { icon: Heart, text: 'Loksins tími fyrir börnin' }
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <item.icon size={32} style={{ margin: '0 auto var(--space-sm)' }} />
                                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-primary)'
                }}>
                    Viltu byrja?
                </h2>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-xl)'
                }}>
                    Það tekur 2 mínútur að setja upp. Ókeypis. Engin kreditkort.
                </p>
                <button
                    onClick={() => router.push('/is/login')}
                    className="nordic-button"
                    style={{
                        fontSize: '1.25rem',
                        padding: '1.25rem 2.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)'
                    }}
                >
                    Byrja núna - ókeypis
                    <ArrowRight size={24} />
                </button>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border-light)',
                padding: 'var(--space-xl)',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                background: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-xl)',
                    marginBottom: 'var(--space-md)',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => router.push('/is/why-us')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--nordic-blue)',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Af hverju Bekkurinn?
                    </button>
                    <a href="#" style={{ color: 'var(--nordic-blue)', textDecoration: 'none' }}>Spurningar</a>
                    <a href="#" style={{ color: 'var(--nordic-blue)', textDecoration: 'none' }}>Verð</a>
                </div>
                <p style={{ fontSize: '0.875rem' }}>
                    © 2026 Bekkurinn. Skipulagt kerfi fyrir bekkjarfulltrúa á Íslandi.
                </p>
            </footer>
        </div>
    );
}

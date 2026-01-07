'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, X, Check, Smartphone, Shield, Zap, Lock, Heart, Clock } from 'lucide-react';

/**
 * Why Us Page - Differentiation from free alternatives
 */

export default function WhyUsPage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--stone)',
            fontFamily: 'var(--font-sans)'
        }}>
            {/* Header */}
            <nav style={{
                background: 'white',
                padding: 'var(--space-lg) var(--space-xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-light)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={() => router.push('/is')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--nordic-blue)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    ← Bekkurinn
                </button>
                <button
                    onClick={() => router.push('/is/login')}
                    className="nordic-button"
                >
                    Byrja núna
                </button>
            </nav>

            {/* Hero */}
            <section style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center'
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
                    Af hverju ekki bara nota Facebook?
                </div>

                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-lg)',
                    lineHeight: 1.2
                }}>
                    Jú, þú getur notað ókeypis tól.<br />
                    <span style={{ color: 'var(--nordic-blue)' }}>En hver er verðið?</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                }}>
                    Facebook, Google Docs og tölvupóstur eru ókeypis. En tíminn þinn og geðheilsan þín eru það ekki.
                </p>
            </section>

            {/* Comparison Table */}
            <section style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 var(--space-xl) var(--space-2xl)'
            }}>
                <div className="nordic-card" style={{
                    overflow: 'hidden',
                    padding: 0
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr',
                        gap: 'var(--space-md)',
                        padding: 'var(--space-lg)',
                        background: 'var(--stone)',
                        borderBottom: '2px solid var(--border-medium)',
                        fontWeight: 'bold'
                    }}>
                        <div></div>
                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            Ókeypis tól
                        </div>
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--nordic-blue)',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '10%',
                                background: 'var(--green-success)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                BEST
                            </div>
                            Bekkurinn
                        </div>
                    </div>

                    {/* Comparison Rows */}
                    {[
                        {
                            feature: 'Allt á einum stað',
                            free: false,
                            bekkurinn: true,
                            description: 'Facebook, Google Docs, tölvupóstur... hvað vantar núna?'
                        },
                        {
                            feature: 'Enginn týnist',
                            free: false,
                            bekkurinn: true,
                            description: 'Sjáðu hver hefur séð tilkynninguna þína'
                        },
                        {
                            feature: 'Verkefnastjórnun',
                            free: false,
                            bekkurinn: true,
                            description: 'Ekki bara „verkefnalisti" heldur raunverulegt stjórnunarkerfi'
                        },
                        {
                            feature: 'Farsímavænn',
                            free: '½',
                            bekkurinn: true,
                            description: 'Smíðað fyrir foreldra á ferðinni'
                        },
                        {
                            feature: 'Einkaréttindi foreldra',
                            free: false,
                            bekkurinn: true,
                            description: 'Bara foreldrar í bekknum. Engin leki.'
                        },
                        {
                            feature: 'Virkar án innskráningar',
                            free: true,
                            bekkurinn: false,
                            description: 'Já, við þurfum innskráningu. En bara 10 sekúndur.'
                        },
                        {
                            feature: 'Sólarhringsupptekið',
                            free: true,
                            bekkurinn: false,
                            description: 'Facebook er alltaf opið. Bekkurinn hefur „þögla tíma".'
                        },
                        {
                            feature: 'Tíminn þinn til baka',
                            free: false,
                            bekkurinn: true,
                            description: '5 tímar á viku → 15 mínútur'
                        }
                    ].map((row, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr',
                                gap: 'var(--space-md)',
                                padding: 'var(--space-lg)',
                                borderBottom: i < 7 ? '1px solid var(--border-light)' : 'none',
                                background: i % 2 === 0 ? 'white' : 'var(--stone)20'
                            }}
                        >
                            <div>
                                <div style={{
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 'var(--space-xs)'
                                }}>
                                    {row.feature}
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-tertiary)'
                                }}>
                                    {row.description}
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {row.free === true ? (
                                    <Check size={24} color="var(--green-success)" />
                                ) : row.free === '½' ? (
                                    <span style={{ color: 'var(--amber-dark)', fontWeight: 'bold' }}>Svona</span>
                                ) : (
                                    <X size={24} color="var(--red)" />
                                )}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {row.bekkurinn ? (
                                    <Check size={24} color="var(--nordic-blue)" strokeWidth={3} />
                                ) : (
                                    <X size={24} color="var(--red)" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* The Hidden Cost */}
            <section style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                padding: 'var(--space-2xl) var(--space-xl)',
                margin: 'var(--space-2xl) 0'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <Clock size={48} style={{ margin: '0 auto var(--space-lg)', color: 'var(--amber-dark)' }} />
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: 'var(--space-lg)',
                        color: 'var(--text-primary)'
                    }}>
                        Falinn kostnaður "ókeypis" tólanna
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--space-xl)',
                        marginTop: 'var(--space-xl)'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: 'var(--amber-dark)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                5 klst/viku
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Meðalbekkjarfulltrúi eyðir í að leita, spyrja aftur, og laga villur
                            </p>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: 'var(--amber-dark)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                47%
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Foreldrar sem týna tilkynningum í Facebook-hópum
                            </p>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: 'var(--amber-dark)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                Geðheilsa
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Ómetanlegt að sofa í friði án áhyggna um týnda tilkynningu
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why We Built This */}
            <section style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'var(--space-2xl) var(--space-xl)'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--space-2xl)'
                }}>
                    <Heart size={48} style={{ margin: '0 auto var(--space-lg)', color: 'var(--nordic-blue)' }} />
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: 'var(--space-md)',
                        color: 'var(--text-primary)'
                    }}>
                        Við erum líka foreldrar
                    </h2>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6
                    }}>
                        Bekkurinn var ekki smíðaður af tæknifyrirtæki sem reynir að selja þér eitthvað.
                        Við gerðum þetta vegna þess að við vorum orðin þreytt á Facebook-hópum klukkan 23:00.
                    </p>
                </div>

                <div className="nordic-card" style={{
                    padding: 'var(--space-xl)',
                    background: 'white'
                }}>
                    <div style={{
                        display: 'grid',
                        gap: 'var(--space-lg)'
                    }}>
                        {[
                            {
                                icon: Smartphone,
                                title: 'Raunverulega farsímavænn',
                                description: 'Ekki „virkar á síma" heldur „smíðað fyrir síma fyrst"'
                            },
                            {
                                icon: Shield,
                                title: 'Einkaréttindi í forgangi',
                                description: 'Gögn foreldra eru varin. Bara foreldrar í bekknum hafa aðgang.'
                            },
                            {
                                icon: Zap,
                                title: 'Einfalt en kraftmikið',
                                description: 'Þú getur gert allt sem þú þarft, en þarft ekki PhD til að byrja'
                            },
                            {
                                icon: Lock,
                                title: 'Þín gögn eru þín',
                                description: 'Við seljum ekki gögn. Við erum ekki með auglýsingar. Bara tól.'
                            }
                        ].map((principle, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    gap: 'var(--space-md)',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'var(--nordic-blue)20',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <principle.icon size={24} color="var(--nordic-blue)" />
                                </div>
                                <div>
                                    <h3 style={{
                                        fontWeight: 'bold',
                                        marginBottom: 'var(--space-xs)',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {principle.title}
                                    </h3>
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6
                                    }}>
                                        {principle.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Philosophy */}
            <section style={{
                background: 'white',
                padding: 'var(--space-2xl) var(--space-xl)',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: 'var(--space-md)',
                        color: 'var(--text-primary)'
                    }}>
                        Er þetta ókeypis?
                    </h2>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--nordic-blue)',
                        fontWeight: 600,
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Já. Að svo stöddu.
                    </p>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Við erum í beta. Við viljum læra hvað virkar og hvað ekki.
                        Þegar við erum tilbúin með fullkomið kerfi munum við byrja að rukka.
                        En það verður <strong>ekki</strong> dýrt og <strong>alltaf</strong> gegnsætt.
                    </p>
                    <div style={{
                        background: 'var(--stone)',
                        padding: 'var(--space-lg)',
                        borderRadius: 'var(--radius-lg)',
                        borderLeft: '4px solid var(--nordic-blue)'
                    }}>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            lineHeight: 1.6
                        }}>
                            <strong>Fyrirheit:</strong> Ef þú byrjar núna, færðu ávallt betri verð en nýir notendur.
                            Þú ert að hjálpa okkur að byggja eitthvað betra, og við gleymum því ekki.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
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
                    Tilbúinn til að fá tímann þinn til baka?
                </h2>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-xl)'
                }}>
                    Prófaðu Bekkurinn í dag. Ef þú hefur ekki sparað þér að minnsta kosti 2 tíma í fyrstu viku skaltu senda okkur tölvupóst og við lögum það.
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
                <p style={{
                    marginTop: 'var(--space-md)',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.875rem'
                }}>
                    Engin kreditkort. Sett upp á 2 mínútum.
                </p>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border-light)',
                padding: 'var(--space-xl)',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                background: 'white'
            }}>
                <p style={{ fontSize: '0.875rem' }}>
                    © 2026 Bekkurinn. Skipulagt kerfi fyrir bekkjarfulltrúa á Íslandi.
                </p>
            </footer>
        </div>
    );
}

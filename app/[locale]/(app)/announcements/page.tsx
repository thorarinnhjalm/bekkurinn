import { Pin, Calendar, User, Heart, MessageCircle } from 'lucide-react';

/**
 * Announcements Page - "Auglýsingataflan" (The Fridge)
 * 
 * Features:
 * - Pinned important announcements
 * - Chronological feed
 * - Admin-only posting
 * - Clean, scannable design
 */

export default function AnnouncementsPage() {
    // Mock data with richer content
    const mockAnnouncements = [
        {
            id: 1,
            title: 'Foreldrafundur - 15. janúar',
            content: 'Næsti foreldrafundur er þriðjudaginn 15. janúar kl. 19:00 í matsalnum.\n\nDagskrá:\n• Skíðaferð til Bláfjalla\n• Foreldrarölt - niðurstöður haustannar\n• Gjafasöfnun fyrir kennara\n• Vetrarfrí og næstu viðburðir\n\nKaffiveitingar í boði!',
            date: '2026-01-01',
            pinned: true,
            author: 'Guðrún Magnúsdóttir',
            role: 'Formaður',
            likes: 12,
        },
        {
            id: 2,
            title: '⛷️ Skíðaferð 21.-23. febrúar',
            content: 'Árlega skíðaferð bekkjarins verður haldin 21.-23. febrúar í Bláfjöll!\n\nVerð: 15.000 kr. á barn (innifalið: gisting, matur, skíðagögn)\n\nSkráning fyrir 1. febrúar á linknum hér að neðan. Hámark 20 börn.\n\nKontakt: Birna (699-1234)',
            date: '2026-01-01',
            pinned: false,
            author: 'Birna Sigurðardóttir',
            role: 'Viðburðastjóri',
            likes: 18,
        },
        {
            id: 3,
            title: 'Íþróttadagur 8. febrúar',
            content: 'Bekkurinn okkar mun taka þátt í íþróttadegi skólans laugardaginn 8. febrúar.\n\nVið þurfum 4 foreldra til að hjálpa til með:\n• Tímatöku (2)\n• Skráningu (1)\n• Ljósmyndun (1)\n\nVinsamlegast skráið ykkur í Tasks síðunni.',
            date: '2025-12-28',
            pinned: false,
            author: 'Magnús Gunnarsson',
            role: null,
            likes: 8,
        },
        {
            id: 4,
            title: 'Bókaþjófurinn 🎄',
            content: 'Gleymdu ekki að senda barnið með bók í dag fyrir bókaþjófinn!\n\nFyrirmæli frá kennaranum:\n• Verð 500-1000 kr\n• Ekki setja nafn á bókina\n• Aldurshópur 9-10 ára\n\nBækurnar verða gefnar út á jólahátíðinni!',
            date: '2025-12-23',
            pinned: false,
            author: 'Anna Jónsdóttir',
            role: null,
            likes: 15,
        },
        {
            id: 5,
            title: 'Takk fyrir frábæra jólahátíð!',
            content: 'Hjartanlegar þakkir til allra sem komu og tóku þátt í jólahátíð bekkjarins! 🎅\n\nSérstakar þakkir til:\n• Katrín og Sigrún fyrir kökurnar\n• Dagur fyrir músíkina\n• Þóra fyrir skreytingarnar\n• Allir foreldrar sem mættu og studdu\n\nBörnin voru mjög ánægð!',
            date: '2025-12-21',
            pinned: false,
            author: 'Guðrún Magnúsdóttir',
            role: 'Formaður',
            likes: 24,
        },
        {
            id: 6,
            title: 'Ljósmyndir frá haustdögum',
            content: 'Ljósmyndirnar frá haustdögunum eru komnar!\n\nÞið getið skoðað þær á Google Drive: [hlekkur]\n\nAthugið: Einungis foreldrar með aðgang að bekknum sjá myndirnar.',
            date: '2025-12-15',
            pinned: false,
            author: 'Lilja Sigurðardóttir',
            role: null,
            likes: 19,
        },
    ];

    const pinnedAnnouncements = mockAnnouncements.filter(a => a.pinned);
    const regularAnnouncements = mockAnnouncements.filter(a => !a.pinned);

    return (
        <div className="min-h-screen p-4 space-y-6 pb-24 pt-24">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--sage-green)' }}>
                    Auglýsingataflan
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Fréttir og tilkynningar frá stjórn
                </p>
            </header>

            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Pin size={16} style={{ color: 'var(--amber)' }} />
                        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                            Fest efst
                        </h2>
                    </div>

                    {pinnedAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="nordic-card p-5 space-y-3 border-2"
                            style={{ borderColor: 'var(--amber)' }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                        {announcement.title}
                                    </h3>
                                    <p className="text-sm mt-2 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                        {announcement.content}
                                    </p>
                                </div>
                                <Pin size={20} style={{ color: 'var(--amber)' }} className="flex-shrink-0" />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                                            style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
                                        >
                                            {announcement.author[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium">{announcement.author}</p>
                                            {announcement.role && (
                                                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                                    {announcement.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        <Calendar size={12} />
                                        {new Date(announcement.date).toLocaleDateString('is-IS', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    <Heart size={14} />
                                    <span>{announcement.likes}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Regular Announcements */}
            <div className="space-y-3">
                {regularAnnouncements.length > 0 && (
                    <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Allar tilkynningar
                    </h2>
                )}

                {regularAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="nordic-card p-5 space-y-3">
                        <div>
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                {announcement.title}
                            </h3>
                            <p className="text-sm mt-2 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                {announcement.content}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                                        style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
                                    >
                                        {announcement.author[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium">{announcement.author}</p>
                                        {announcement.role && (
                                            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                                {announcement.role}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    <Calendar size={12} />
                                    {new Date(announcement.date).toLocaleDateString('is-IS', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <Heart size={14} />
                                <span>{announcement.likes}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Admin Action (Hidden for non-admins) */}
            <div className="nordic-card p-4 text-center" style={{ borderStyle: 'dashed', borderColor: 'var(--border-medium)' }}>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Aðeins stjórn getur búið til auglýsingar
                </p>
            </div>
        </div>
    );
}

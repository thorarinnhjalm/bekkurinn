'use client';

import { CalendarDays, Users as UsersIcon, Clock, MapPin, Cake, PartyPopper, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function CalendarPage() {
    const [showJanBirthdays, setShowJanBirthdays] = useState(false);
    const [showFebBirthdays, setShowFebBirthdays] = useState(false);
    const [showMarBirthdays, setShowMarBirthdays] = useState(false);
    const [showPatrols, setShowPatrols] = useState(false);
    const [showActivities, setShowActivities] = useState(true);

    const januaryBirthdays = [
        { name: 'Ari Jónsson', date: '15. janúar', age: 10 },
        { name: 'Íris Kristjánsdóttir', date: '13. janúar', age: 10 },
    ];

    const februaryBirthdays = [{ name: 'Finnur Þorsteinsson', date: '11. febrúar', age: 10 }];
    const marchBirthdays = [{ name: 'Auður Sigurðardóttir', date: '22. mars', age: 10 }];

    const upcomingPatrols = [
        { date: '2026-01-13', time: '16:00 - 18:00', location: 'Leikskóli → Bæjarlind', volunteers: ['Birna Sigurðardóttir'], slots: 2, filled: 1 },
        { date: '2026-01-20', time: '16:00 - 18:00', location: 'Leikskóli → Bæjarlind', volunteers: [], slots: 2, filled: 0 },
        { date: '2026-01-27', time: '16:00 - 18:00', location: 'Leikskóli → Bæjarlind', volunteers: ['Guðrún Magnúsdóttir', 'Þú'], slots: 2, filled: 2 },
    ];

    const activities = [
        { title: 'Foreldrafundur', date: '2026-01-15', time: '19:00', location: 'Matsalur' },
        { title: 'Íþróttadagur', date: '2026-02-08', time: '10:00', location: 'Íþróttahús' },
        { title: 'Skíðaferð til Bláfjalla', date: '2026-02-21', time: 'Allan daginn', location: 'Bláfjöll' },
    ];

    return (
        <div className="min-h-screen p-4 space-y-4 pb-24 pt-[88px]">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--sage-green)' }}>Dagatal</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Viðburðir, afmæli og foreldrarölt</p>
            </header>

            {/* Activities */}
            <div className="nordic-card overflow-hidden">
                <button onClick={() => setShowActivities(!showActivities)}
                    className="w-full p-4 flex items-center justify-between text-left transition-colors"
                    style={{ backgroundColor: showActivities ? 'var(--sage-green)' : 'var(--stone)', color: showActivities ? 'white' : 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={20} />
                        <span className="font-semibold">Viðburðir ({activities.length})</span>
                    </div>
                    {showActivities ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showActivities && (
                    <div className="p-4 space-y-3">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--stone)' }}>
                                <p className="font-semibold">{activity.title}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    <span>{new Date(activity.date).toLocaleDateString('is-IS', { day: 'numeric', month: 'long' })}</span>
                                    <span>{activity.time}</span>
                                    <span>{activity.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* January Birthdays - Highlighted */}
            <div className="nordic-card overflow-hidden" style={{ borderColor: 'var(--amber)', borderWidth: '2px' }}>
                <button onClick={() => setShowJanBirthdays(!showJanBirthdays)}
                    className="w-full p-4 flex items-center justify-between text-left"
                    style={{ backgroundColor: 'var(--amber)20' }}>
                    <div className="flex items-center gap-2">
                        <Cake size={20} style={{ color: 'var(--amber-dark)' }} />
                        <span className="font-semibold" style={{ color: 'var(--amber-dark)' }}>
                            Afmæli í janúar 🎉 ({januaryBirthdays.length})
                        </span>
                    </div>
                    {showJanBirthdays ? <ChevronUp size={20} style={{ color: 'var(--amber-dark)' }} /> : <ChevronDown size={20} style={{ color: 'var(--amber-dark)' }} />}
                </button>
                {showJanBirthdays && (
                    <div className="p-4 space-y-3">
                        {januaryBirthdays.map((birthday, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--white)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                        style={{ backgroundColor: 'var(--amber)', color: 'white' }}>{birthday.name[0]}</div>
                                    <div>
                                        <p className="font-semibold">{birthday.name}</p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{birthday.date} - verður {birthday.age} ára</p>
                                    </div>
                                </div>
                                <PartyPopper size={20} style={{ color: 'var(--amber-dark)' }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* February Birthdays */}
            <div className="nordic-card overflow-hidden">
                <button onClick={() => setShowFebBirthdays(!showFebBirthdays)}
                    className="w-full p-4 flex items-center justify-between text-left" style={{ backgroundColor: 'var(--stone)' }}>
                    <div className="flex items-center gap-2">
                        <Cake size={18} style={{ color: 'var(--text-secondary)' }} />
                        <span className="font-medium">Afmæli í febrúar ({februaryBirthdays.length})</span>
                    </div>
                    {showFebBirthdays ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showFebBirthdays && (
                    <div className="p-4 space-y-2">
                        {februaryBirthdays.map((birthday, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ backgroundColor: 'var(--stone)', color: 'var(--text-primary)' }}>{birthday.name[0]}</div>
                                <div><p className="font-medium text-sm">{birthday.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{birthday.date}</p></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* March Birthdays */}
            <div className="nordic-card overflow-hidden">
                <button onClick={() => setShowMarBirthdays(!showMarBirthdays)}
                    className="w-full p-4 flex items-center justify-between text-left" style={{ backgroundColor: 'var(--stone)' }}>
                    <div className="flex items-center gap-2">
                        <Cake size={18} style={{ color: 'var(--text-secondary)' }} />
                        <span className="font-medium">Afmæli í mars ({marchBirthdays.length})</span>
                    </div>
                    {showMarBirthdays ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showMarBirthdays && (
                    <div className="p-4 space-y-2">
                        {marchBirthdays.map((birthday, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ backgroundColor: 'var(--stone)', color: 'var(--text-primary)' }}>{birthday.name[0]}</div>
                                <div><p className="font-medium text-sm">{birthday.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{birthday.date}</p></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Foreldrarölt */}
            <div className="nordic-card overflow-hidden">
                <button onClick={() => setShowPatrols(!showPatrols)}
                    className="w-full p-4 flex items-center justify-between text-left" style={{ backgroundColor: 'var(--stone)' }}>
                    <div className="flex items-center gap-2">
                        <UsersIcon size={20} style={{ color: 'var(--text-secondary)' }} />
                        <span className="font-semibold">Foreldrarölt ({upcomingPatrols.length})</span>
                    </div>
                    {showPatrols ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showPatrols && (
                    <div className="p-4 space-y-3">
                        {upcomingPatrols.map((patrol, idx) => (
                            <div key={idx} className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'var(--paper)' }}>
                                <p className="font-medium">{new Date(patrol.date).toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                <div className="flex items-start gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <div className="flex items-center gap-1.5"><Clock size={14} /><span>{patrol.time}</span></div>
                                    <div className="flex items-center gap-1.5"><MapPin size={14} /><span>{patrol.location}</span></div>
                                </div>
                                {patrol.volunteers.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {patrol.volunteers.map((vol, vIdx) => (
                                            <span key={vIdx} className="text-xs px-2 py-1 rounded-full"
                                                style={{ backgroundColor: vol === 'Þú' ? 'var(--sage-green)' : 'var(--stone)', color: vol === 'Þú' ? 'white' : 'var(--text-primary)' }}>{vol}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{patrol.filled}/{patrol.slots} foreldrar</span>
                                    {patrol.filled < patrol.slots && <button className="nordic-button text-sm px-6">Taka vaktina</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Eye, Clock, Activity, ExternalLink } from 'lucide-react';

interface PlausibleStats {
    period: string;
    aggregate: {
        visitors: { value: number };
        pageviews: { value: number };
        bounce_rate: { value: number };
        visit_duration: { value: number };
    };
    topPages: Array<{ page: string; visitors: number }>;
    realtimeVisitors: number;
    lastUpdated: string;
}

export default function AnalyticsWidget() {
    const [stats, setStats] = useState<PlausibleStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        // Refresh every 5 minutes
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/plausible-stats');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch');
            }
            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Villa við að sækja gögn');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    if (loading) {
        return (
            <div className="professional-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-blue-600" />
                    <h3 className="font-bold text-xl text-gray-900">Heimsóknir (Plausible)</h3>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-100 rounded-lg"></div>
                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="professional-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-blue-600" />
                    <h3 className="font-bold text-xl text-gray-900">Heimsóknir (Plausible)</h3>
                </div>
                <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-2 text-gray-400">
                        Athugaðu hvort PLAUSIBLE_API_KEY sé stillt í .env
                    </p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="professional-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    <h3 className="font-bold text-xl text-gray-900">Heimsóknir (30 dagar)</h3>
                </div>
                <a
                    href="https://plausible.io/bekkurinn.is"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    Opna Plausible <ExternalLink size={14} />
                </a>
            </div>

            {/* Realtime indicator */}
            {stats.realtimeVisitors > 0 && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-green-700">
                        {stats.realtimeVisitors} á síðunni núna
                    </span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Users size={14} />
                        <span className="text-xs font-bold uppercase">Gestir</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        {stats.aggregate.visitors.value.toLocaleString()}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Eye size={14} />
                        <span className="text-xs font-bold uppercase">Síðuflettingar</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        {stats.aggregate.pageviews.value.toLocaleString()}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Activity size={14} />
                        <span className="text-xs font-bold uppercase">Fráhlaup</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        {stats.aggregate.bounce_rate.value}%
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase">Heimsókn</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        {formatDuration(stats.aggregate.visit_duration.value)}
                    </p>
                </div>
            </div>

            {/* Top Pages */}
            {stats.topPages.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Vinsælustu síður</h4>
                    <div className="space-y-2">
                        {stats.topPages.map((page, i) => (
                            <div
                                key={page.page}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                        {page.page === '/' ? 'Forsíða' : page.page}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {page.visitors.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Last updated */}
            <p className="text-xs text-gray-400 mt-4 text-right">
                Uppfært: {new Date(stats.lastUpdated).toLocaleTimeString('is-IS')}
            </p>
        </div>
    );
}

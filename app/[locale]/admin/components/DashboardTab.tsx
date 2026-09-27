'use client';

import { Users, SchoolIcon, GraduationCap, Shield } from 'lucide-react';
import type { SystemStats } from '@/services/admin';
import AnalyticsWidget from './AnalyticsWidget';

interface DashboardTabProps {
    stats: SystemStats | null;
    pendingCount: number;
    onNavigate: (tab: string) => void;
}

export default function DashboardTab({ stats, pendingCount, onNavigate }: DashboardTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="professional-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-on-surface-variant uppercase">Notendur</p>
                            <p className="text-3xl font-black text-on-surface mt-2">{stats?.totalUsers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center">
                            <Users size={24} className="text-primary" />
                        </div>
                    </div>
                </div>

                <div className="professional-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-on-surface-variant uppercase">Skólar</p>
                            <p className="text-3xl font-black text-on-surface mt-2">{stats?.totalSchools || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center">
                            <SchoolIcon size={24} className="text-primary" />
                        </div>
                    </div>
                </div>

                <div className="professional-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-on-surface-variant uppercase">Bekkir</p>
                            <p className="text-3xl font-black text-on-surface mt-2">{stats?.totalClasses || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                            <GraduationCap size={24} className="text-on-secondary-container" />
                        </div>
                    </div>
                </div>

                <div className="professional-card p-6 border-2 border-tertiary/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-on-tertiary-fixed uppercase">Samþykktir</p>
                            <p className="text-3xl font-black text-on-tertiary-fixed mt-2">{pendingCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-tertiary-fixed/60 rounded-lg flex items-center justify-center">
                            <Shield size={24} className="text-on-tertiary-fixed" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="professional-card p-6">
                <h3 className="font-bold text-xl text-on-surface mb-4">Flýtiaðgerðir</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => onNavigate('approvals')}
                        className="p-4 border-2 border-outline-variant/30 rounded-lg hover:border-primary hover:bg-primary-container/15 transition-all text-left"
                    >
                        <div className="font-bold text-on-surface">Skoða samþykktir</div>
                        <div className="text-sm text-on-surface-variant mt-1">{pendingCount} bíða</div>
                    </button>
                    <button
                        onClick={() => onNavigate('users')}
                        className="p-4 border-2 border-outline-variant/30 rounded-lg hover:border-primary hover:bg-primary-container/15 transition-all text-left"
                    >
                        <div className="font-bold text-on-surface">Stjórna notendum</div>
                        <div className="text-sm text-on-surface-variant mt-1">{stats?.totalUsers || 0} notendur</div>
                    </button>
                    <button
                        onClick={() => onNavigate('schools')}
                        className="p-4 border-2 border-outline-variant/30 rounded-lg hover:border-primary hover:bg-primary-container/15 transition-all text-left"
                    >
                        <div className="font-bold text-on-surface">Stjórna skólum</div>
                        <div className="text-sm text-on-surface-variant mt-1">{stats?.totalSchools || 0} skólar</div>
                    </button>
                </div>
            </div>

            {/* Website Analytics */}
            <AnalyticsWidget />
        </div>
    );
}

'use client';

import { Users, SchoolIcon, GraduationCap, Shield } from 'lucide-react';
import type { SystemStats } from '@/services/admin';

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
                            <p className="text-sm font-bold text-gray-500 uppercase">Notendur</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="professional-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">Skólar</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">{stats?.totalSchools || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <SchoolIcon size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="professional-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">Bekkir</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">{stats?.totalClasses || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <GraduationCap size={24} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="professional-card p-6 border-2 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-orange-600 uppercase">Samþykktir</p>
                            <p className="text-3xl font-black text-orange-600 mt-2">{pendingCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Shield size={24} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="professional-card p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-4">Flýtiaðgerðir</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => onNavigate('approvals')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-nordic-blue hover:bg-blue-50 transition-all text-left"
                    >
                        <div className="font-bold text-gray-900">Skoða samþykktir</div>
                        <div className="text-sm text-gray-600 mt-1">{pendingCount} bíða</div>
                    </button>
                    <button
                        onClick={() => onNavigate('users')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-nordic-blue hover:bg-blue-50 transition-all text-left"
                    >
                        <div className="font-bold text-gray-900">Stjórna notendum</div>
                        <div className="text-sm text-gray-600 mt-1">{stats?.totalUsers || 0} notendur</div>
                    </button>
                    <button
                        onClick={() => onNavigate('schools')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-nordic-blue hover:bg-blue-50 transition-all text-left"
                    >
                        <div className="font-bold text-gray-900">Stjórna skólum</div>
                        <div className="text-sm text-gray-600 mt-1">{stats?.totalSchools || 0} skólar</div>
                    </button>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="professional-card p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-4">Nýleg virkni</h3>
                <div className="text-center py-8 text-gray-500">
                    <p>Activity tracking kemur í næstu útgáfu</p>
                </div>
            </div>
        </div>
    );
}

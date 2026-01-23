'use client';

import { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, Clock, MessageSquare } from 'lucide-react';
import { getAllTestimonials, updateTestimonialStatus, deleteTestimonial } from '@/services/firestore';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Testimonial } from '@/types';

export default function TestimonialsTab() {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        setLoading(true);
        const data = await getAllTestimonials();
        setTestimonials(data);
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        if (!user) return;
        await updateTestimonialStatus(id, 'approved', user.uid);
        loadTestimonials();
    };

    const handleReject = async (id: string) => {
        if (!user) return;
        await updateTestimonialStatus(id, 'rejected', user.uid);
        loadTestimonials();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ertu viss um að þú viljir eyða þessari umsögn?')) return;
        await deleteTestimonial(id);
        loadTestimonials();
    };

    const filteredTestimonials = testimonials.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const counts = {
        all: testimonials.length,
        pending: testimonials.filter(t => t.status === 'pending').length,
        approved: testimonials.filter(t => t.status === 'approved').length,
        rejected: testimonials.filter(t => t.status === 'rejected').length,
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Allar" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
                <StatCard label="Bíða" count={counts.pending} active={filter === 'pending'} onClick={() => setFilter('pending')} color="orange" />
                <StatCard label="Samþykktar" count={counts.approved} active={filter === 'approved'} onClick={() => setFilter('approved')} color="green" />
                <StatCard label="Hafnað" count={counts.rejected} active={filter === 'rejected'} onClick={() => setFilter('rejected')} color="red" />
            </div>

            {/* Testimonials List */}
            {filteredTestimonials.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Engar umsagnir fundust</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTestimonials.map(testimonial => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            onApprove={() => handleApprove(testimonial.id)}
                            onReject={() => handleReject(testimonial.id)}
                            onDelete={() => handleDelete(testimonial.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, count, active, onClick, color = 'blue' }: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    color?: 'blue' | 'orange' | 'green' | 'red';
}) {
    const colors = {
        blue: 'bg-blue-100 text-blue-700 border-blue-300',
        orange: 'bg-orange-100 text-orange-700 border-orange-300',
        green: 'bg-green-100 text-green-700 border-green-300',
        red: 'bg-red-100 text-red-700 border-red-300',
    };

    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
                active ? colors[color] : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
        >
            <p className="text-2xl font-black">{count}</p>
            <p className="text-sm font-medium opacity-80">{label}</p>
        </button>
    );
}

function TestimonialCard({ testimonial, onApprove, onReject, onDelete }: {
    testimonial: Testimonial;
    onApprove: () => void;
    onReject: () => void;
    onDelete: () => void;
}) {
    const statusColors = {
        pending: 'bg-orange-100 text-orange-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
        pending: 'Bíður',
        approved: 'Samþykkt',
        rejected: 'Hafnað',
    };

    return (
        <div className="professional-card p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={16}
                                    className={star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[testimonial.status]}`}>
                            {statusLabels[testimonial.status]}
                        </span>
                    </div>

                    {/* Text */}
                    <p className="text-gray-800 mb-3">"{testimonial.text}"</p>

                    {/* Author */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{testimonial.userName}</span>
                        <span>•</span>
                        <span>{testimonial.userRole}</span>
                        {testimonial.schoolName && (
                            <>
                                <span>•</span>
                                <span>{testimonial.schoolName}</span>
                            </>
                        )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Clock size={12} />
                        <span>
                            {testimonial.createdAt?.toDate?.()
                                ? testimonial.createdAt.toDate().toLocaleDateString('is-IS')
                                : 'Óþekkt'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {testimonial.status === 'pending' && (
                        <>
                            <button
                                onClick={onApprove}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Samþykkja"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={onReject}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Hafna"
                            >
                                <X size={18} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Eyða"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

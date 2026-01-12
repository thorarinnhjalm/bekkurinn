import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { collection, query, where, limit, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface Address {
    streetName: string;
    houseNumber: string;
    zip: string;
    city: string;
    fullAddress: string;
    location: GeoPoint;
}

interface AddressAutocompleteProps {
    onSelect: (address: Address) => void;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
}

export function AddressAutocomplete({ onSelect, defaultValue = '', placeholder = 'Sláðu inn heimilisfang...', className = '' }: AddressAutocompleteProps) {
    const [searchTerm, setSearchTerm] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                // Search by street name (lowercase)
                // Note: 'array-contains' matches exact elements. 
                // For prefix search, we usually need a specific 'keywords' map or simple >= <= query on a string field.
                // But since we stored 'searchTerms' as specific strings like "bæjarlind" and "bæjarlind 8", 
                // direct "array-contains" only works if user types EXACTly that.
                // BETTER: Query 'streetName' or 'fullAddress' with >= searchTerm
                // BUT Firestore range queries are case sensitive.
                // Strategy: Use the searchTerms array logic properly?
                // Actually, strict prefix search on 'streetName' is safest if stored as lowercase or just rely on proper casing.
                // Let's try flexible search:

                // Converting input to lowercase for safer comparison if using case-insensitive tokens
                const qLower = searchTerm.toLowerCase();

                const addressesRef = collection(db, 'addresses');
                // We'll try a range query on 'streetName' if capitalized? 
                // Our import script saved 'streetName' as is (Capitalized).
                // Let's assume user types capitalized or we capitalize first letter? 
                // The import script saved: streetName: "Bæjarlind".
                // If user types "bæ", we want "Bæjarlind".
                // Allow simple prefix query on streetName
                // We need to capitalize the first letter to match standard Icelandic naming.
                const qCap = qLower.charAt(0).toUpperCase() + qLower.slice(1);

                const q = query(
                    addressesRef,
                    where('fullAddress', '>=', qCap),
                    where('fullAddress', '<=', qCap + '\uf8ff'),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const results: Address[] = [];
                querySnapshot.forEach((doc) => {
                    results.push(doc.data() as Address);
                });

                // If we didn't find enough, maybe try searching by full address or just filter client side?
                // With 100k docs, client side is impossible.
                // The range query is fast.

                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error searching addresses:", error);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSelect = (addr: Address) => {
        setSearchTerm(addr.fullAddress);
        setShowSuggestions(false);
        onSelect(addr);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-nordic-blue transition-all"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-nordic-blue" size={18} />
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((addr, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(addr)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b last:border-0 transition-colors"
                        >
                            <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="font-medium text-gray-900">{addr.fullAddress}</p>
                                <p className="text-sm text-gray-500">{addr.zip} {addr.city}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

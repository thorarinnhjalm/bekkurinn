'use client';

import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';

interface MobileNavWrapperProps {
    locale: string;
    translations: {
        home: string;
        directory: string;
        patrol: string;
        tasks: string;
        announcements: string;
        agreement: string;
        skutl: string;
        settings?: string;
        logout?: string;
        my_account?: string;
        class_settings?: string;
    };
}

export function MobileNavWrapper({ locale, translations }: MobileNavWrapperProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <BottomNav
                locale={locale}
                translations={translations}
                onMenuToggle={() => setIsMenuOpen(true)}
            />
            <MobileDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                locale={locale}
                translations={translations}
            />
        </>
    );
}

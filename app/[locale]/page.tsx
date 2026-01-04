import { redirect } from 'next/navigation';

/**
 * Locale Home Page - Redirects to Directory
 */

export default function LocaleHomePage() {
    redirect('/directory');
}

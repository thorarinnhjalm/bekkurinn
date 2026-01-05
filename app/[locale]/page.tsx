import { redirect } from 'next/navigation';

/**
 * Locale Home Page - Redirects to Login
 */

export default function LocaleHomePage() {
    redirect('login');
}

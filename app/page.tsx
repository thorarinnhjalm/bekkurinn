import { redirect } from 'next/navigation';

/**
 * Home Page - Redirects to Directory
 * 
 * For now, we redirect to the main app.
 * Later, this will be:
 *  - Auth gate (if not logged in → login page)
 *  - Onboarding (if no class → join/create flow)
 *  - App (if authenticated + has class → directory)
 */

export default function HomePage() {
  redirect('/is/dashboard');
}

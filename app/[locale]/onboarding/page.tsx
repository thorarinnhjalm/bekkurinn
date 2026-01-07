import { Suspense } from 'react';
import OnboardingView from './OnboardingView';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        }>
            <OnboardingView />
        </Suspense>
    );
}

import DashboardView from './DashboardView';

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Load translations manually
    const messages = (await import(`@/messages/${locale}.json`)).default;

    return <DashboardView translations={messages.dashboard} />;
}

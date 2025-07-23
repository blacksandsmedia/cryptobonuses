import PrivacyPage from '../../privacy/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangPrivacyPageProps {
  params: {
    lang: string;
  };
}

export default function LangPrivacyPage({ params }: LangPrivacyPageProps) {
  // For now, just render the main privacy page
  // In the future, this could have localized content
  return <PrivacyPage />;
} 
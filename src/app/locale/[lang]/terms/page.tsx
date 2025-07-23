import TermsPage from '../../terms/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangTermsPageProps {
  params: {
    lang: string;
  };
}

export default function LangTermsPage({ params }: LangTermsPageProps) {
  // For now, just render the main terms page
  // In the future, this could have localized content
  return <TermsPage />;
} 
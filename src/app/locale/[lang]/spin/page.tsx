import SpinPage from '../../spin/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangSpinPageProps {
  params: {
    lang: string;
  };
}

export default function LangSpinPage({ params }: LangSpinPageProps) {
  // For now, just render the main spin page
  // In the future, this could have localized content
  return <SpinPage />;
} 
import ContactPage from '../../contact/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangContactPageProps {
  params: {
    lang: string;
  };
}

export default function LangContactPage({ params }: LangContactPageProps) {
  // For now, just render the main contact page
  // In the future, this could have localized content
  return <ContactPage />;
} 
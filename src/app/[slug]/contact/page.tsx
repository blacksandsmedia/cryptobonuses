import { notFound } from 'next/navigation';
import ContactPage from '../../contact/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LangContactPageProps {
  params: {
    slug: string;
  };
}

export default function LangContactPage({ params }: LangContactPageProps) {
  const { slug: lang } = params;
  
  // Validate that the slug is a valid language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (!supportedLanguages.includes(lang)) {
    notFound();
  }
  
  // Render the contact page
  return <ContactPage />;
} 
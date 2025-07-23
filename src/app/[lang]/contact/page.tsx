import ContactPage from '../../contact/page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface LocaleContactPageProps {
  params: {
    locale: string;
  };
}

export default function LocaleContactPage({ params }: LocaleContactPageProps) {
  // For now, just render the main contact page
  // In the future, this could have localized content
  return <ContactPage />;
} 
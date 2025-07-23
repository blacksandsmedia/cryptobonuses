import { redirect } from 'next/navigation';
import HomePage from '../page';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Return empty array to make this fully dynamic and avoid route conflicts
  return [];
}

interface LangPageProps {
  params: {
    lang: string;
  };
}

export default function LangPage({ params }: LangPageProps) {
  // For now, just render the main homepage
  // In the future, this could have localized content
  return <HomePage />;
} 
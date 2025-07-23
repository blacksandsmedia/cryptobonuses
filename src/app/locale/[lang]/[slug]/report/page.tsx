import ReportPage from '../../../[slug]/report/page';

export async function generateStaticParams() {
  // For report pages, we'll generate them dynamically
  // Return empty array to indicate dynamic generation
  return [];
}

interface LangReportPageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export default function LangReportPage({ params }: LangReportPageProps) {
  // For now, just render the main report page
  // In the future, this could have localized content
  const reportPageProps = {
    params: {
      slug: params.slug
    }
  };
  
  return <ReportPage {...reportPageProps} />;
} 
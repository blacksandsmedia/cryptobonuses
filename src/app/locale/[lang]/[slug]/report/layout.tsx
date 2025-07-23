import ReportLayout from '../../../[slug]/report/layout';
import { ReactNode } from 'react';

interface LangReportLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
    slug: string;
  };
}

export default function LangReportLayout({ children, params }: LangReportLayoutProps) {
  // For now, just render the main report layout
  // In the future, this could have localized content
  const reportLayoutProps = {
    children,
    params: {
      slug: params.slug
    }
  };
  
  return <ReportLayout {...reportLayoutProps} />;
} 
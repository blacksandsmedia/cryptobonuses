'use client';

import ErrorPage from '../error';

interface LangErrorProps {
  params: {
    lang: string;
  };
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LangError({ params, error, reset }: LangErrorProps) {
  // For now, just render the main error page
  // In the future, this could have localized content
  return <ErrorPage error={error} reset={reset} />;
} 
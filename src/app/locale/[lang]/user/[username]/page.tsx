import UserProfilePage from '../../../user/[username]/page';

export async function generateStaticParams() {
  // For user pages, we'll generate them dynamically
  // Return empty array to indicate dynamic generation
  return [];
}

interface LangUserProfilePageProps {
  params: {
    lang: string;
    username: string;
  };
}

export default function LangUserProfilePage({ params }: LangUserProfilePageProps) {
  // For now, just render the main user profile page
  // In the future, this could have localized content
  const userPageProps = {
    params: {
      username: params.username
    }
  };
  
  return <UserProfilePage {...userPageProps} />;
} 
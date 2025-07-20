"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface UserProfile {
  id: string;
  name: string | null;
  bio: string | null;
  username: string | null;
  profilePicture: string | null;
  image: string | null;
  createdAt: string;
}

interface Props {
  user: UserProfile;
}

export default function UserProfileClient({ user }: Props) {
  return (
    <div className="min-h-screen bg-[#1a1b23] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* User Profile Header */}
          <div className="bg-[#373946] rounded-lg p-6 sm:p-8 border border-[#404055]">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {user.profilePicture || user.image ? (
                  <Image
                    src={user.profilePicture || user.image || ''}
                    alt={user.name || 'User avatar'}
                    width={120}
                    height={120}
                    className="rounded-full border-2 border-[#404055]"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] bg-gradient-to-br from-[#68D08B] to-[#5bc47d] rounded-full flex items-center justify-center border-2 border-[#404055]">
                    <span className="text-white text-3xl font-bold">
                      {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {user.name || 'Anonymous User'}
                </h1>
                
                {user.username && (
                  <p className="text-[#68D08B] text-lg mb-3">
                    @{user.username}
                  </p>
                )}
                
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[#a7a9b4] mb-6">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                </div>

                {user.bio && (
                  <div className="bg-[#292932] rounded-lg p-4 border border-[#404055]">
                    <h2 className="text-lg font-semibold text-white mb-2">About</h2>
                    <p className="text-[#a7a9b4] leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-[#373946] rounded-lg p-6 sm:p-8 border border-[#404055]">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#292932] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#404055]">
                <svg className="w-8 h-8 text-[#68D08B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Activity Yet</h3>
              <p className="text-[#a7a9b4] max-w-sm mx-auto">
                This user hasn't had any activity to display yet. Check back later for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
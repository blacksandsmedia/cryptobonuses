export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-[#1a1b23] pt-24 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          User Not Found
        </h1>
        <p className="text-[#a7a9b4] mb-6">
          The user profile you're looking for doesn't exist or has been removed.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-[#68D08B] text-white rounded-lg hover:bg-[#5bc47d] transition-colors duration-200"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
} 
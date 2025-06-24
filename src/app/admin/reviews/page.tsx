"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  casinoId: string;
  casino: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  verified?: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Fetch reviews from the API
  const fetchReviewsFromAPI = async () => {
    try {
      console.log("Refetching reviews for admin panel...");
      setLoading(true);
      setError(null);
      
      // Add a unique query parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/reviews?t=${timestamp}&page=1&pageSize=100`);
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log(`Raw response length: ${text.length} characters`);
      
      if (!text || text.trim() === '') {
        throw new Error("Received empty response from server");
      }
      
      let data;
      try {
        data = JSON.parse(text);
        console.log("Parsed response:", data);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        console.error("Response text sample:", text.substring(0, 200));
        throw new Error("Invalid JSON response from server");
      }
      
      // Check if the response has the expected structure
      if (!data || typeof data !== 'object') {
        throw new Error("Unexpected response format");
      }
      
      // Extract the review data from the paginated response
      const reviewsData = data.data || [];
      
      if (!Array.isArray(reviewsData)) {
        console.error("Expected array of reviews but received:", typeof reviewsData);
        throw new Error("Unexpected reviews data format: not an array");
      }
      
      console.log(`Received ${reviewsData.length} reviews`);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clear localStorage cache for all casinos
  const clearAllReviewsCache = () => {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      
      // Clear all casino review caches
      keys.forEach(key => {
        if (key.startsWith('casino_reviews_')) {
          localStorage.removeItem(key);
          console.log(`Cleared localStorage cache for: ${key}`);
        }
      });
      
      console.log("Cleared all casino review caches from localStorage");
    } catch (error) {
      console.error("Error clearing localStorage cache:", error);
    }
  };

  // Handle review deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      console.log(`Deleting review ${id}...`);
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete review: ${errorData.error || response.statusText}`);
      }
      
      console.log(`Review ${id} deleted successfully from backend`);
      
      // Clear localStorage cache for all casinos to ensure fresh data everywhere
      clearAllReviewsCache();
      
      // Immediately remove the review from the local state
      setReviews(prevReviews => {
        const updatedReviews = prevReviews.filter((review) => review.id !== id);
        console.log(`Updated local state: removed review ${id}, now ${updatedReviews.length} reviews`);
        return updatedReviews;
      });
      
      // Also remove from selection if it was selected
      setSelectedReviews(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(id);
        return newSelected;
      });
      
      // Show success message
      console.log("Review deleted successfully from UI and cache cleared");
      
      // Optional: Refresh data after a short delay to ensure consistency
      setTimeout(() => {
        console.log("Refetching reviews to ensure data consistency...");
        fetchReviewsFromAPI();
      }, 1000);
      
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert(`Error deleting review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setVerifying(id);
      console.log(`Verifying review ${id}...`);
      
      const response = await fetch(`/api/reviews/${id}/verify`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to verify review: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Verification response:", data);
      
        // Update the reviews list with the verified review
        setReviews(reviews.map(review => 
          review.id === id ? { ...review, verified: true } : review
        ));
      
        alert("Review has been verified and published");
    } catch (error) {
      console.error("Failed to verify review:", error);
      alert(`An error occurred while verifying the review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVerifying(null);
    }
  };

  const toggleSelectReview = (id: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      // If all are selected, deselect all
      setSelectedReviews(new Set());
    } else {
      // Otherwise, select all
      setSelectedReviews(new Set(reviews.map(review => review.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.size === 0) {
      alert("Please select at least one review to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedReviews.size} selected reviews?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const selectedIds = Array.from(selectedReviews);
      console.log(`Bulk deleting ${selectedIds.length} reviews:`, selectedIds);
      
      const response = await fetch('/api/reviews/bulk-delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete reviews: ${errorData.error || response.statusText}`);
      }

      console.log(`Bulk delete successful for ${selectedIds.length} reviews`);

      // Clear localStorage cache for all casinos to ensure fresh data everywhere
      clearAllReviewsCache();

      // Remove the deleted reviews from the local state
      setReviews(prevReviews => {
        const updatedReviews = prevReviews.filter(review => !selectedReviews.has(review.id));
        console.log(`Updated local state: removed ${selectedIds.length} reviews, now ${updatedReviews.length} reviews`);
        return updatedReviews;
      });
      
      // Clear selection
      setSelectedReviews(new Set());
      
      console.log(`Successfully deleted ${selectedIds.length} reviews from UI and cleared cache`);
      
      // Optional: Refresh data after a short delay to ensure consistency
      setTimeout(() => {
        console.log("Refetching reviews after bulk delete to ensure data consistency...");
        fetchReviewsFromAPI();
      }, 1000);
      
    } catch (error) {
      console.error("Failed to bulk delete reviews:", error);
      alert(`Error deleting reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchReviewsFromAPI();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Error loading reviews</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews</h2>
          <p className="text-[#a7a9b4] mt-1">
            Total: {reviews.length} ({reviews.filter(r => r.verified).length} verified)
            {selectedReviews.size > 0 && ` • ${selectedReviews.size} selected`}
          </p>
        </div>
        <div className="flex gap-4">
          {selectedReviews.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className={`px-4 py-2 bg-red-600 text-white rounded-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'} transition-colors`}
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedReviews.size})`}
            </button>
          )}
        <Link
          href="/admin/reviews/new"
          className="btn-primary"
        >
          Add New Review
        </Link>
        </div>
      </div>

      <div className="bg-[#292932] shadow-md rounded-lg overflow-hidden border border-[#404055]">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-12">
                <input 
                  type="checkbox" 
                  checked={selectedReviews.size === reviews.length && reviews.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th>Casino</th>
              <th>Author</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className={!review.verified ? "bg-[#342e32]" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={selectedReviews.has(review.id)}
                    onChange={() => toggleSelectReview(review.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {review.casino?.name || "Unknown Casino"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{review.author}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{review.rating} / 5</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {review.verified ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#68D08B] text-[#292932]">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#f59e0b] text-[#292932]">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#a7a9b4]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!review.verified && (
                    <button
                      onClick={() => handleVerify(review.id)}
                      disabled={verifying === review.id}
                      className={`${verifying === review.id ? 'opacity-50 cursor-not-allowed' : 'text-[#68D08B] hover:text-[#5abc7a]'} mr-4`}
                    >
                      {verifying === review.id ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/admin/reviews/${review.id}`)}
                    className="admin-link mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-[#a7a9b4]">
                  No reviews found. Create your first review by clicking the "Add New Review" button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
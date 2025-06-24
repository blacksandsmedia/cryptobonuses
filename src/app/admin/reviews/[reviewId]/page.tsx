"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Casino {
  id: string;
  name: string;
}

const reviewSchema = z.object({
  author: z.string().min(1, "Author name is required"),
  content: z.string().min(3, "Review content is required"),
  rating: z.union([z.number(), z.string()]).transform((val) => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  casinoId: z.string().min(1, "Casino is required"),
  verified: z.boolean().optional().default(false)
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function EditReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: "",
      content: "",
      rating: 5,
      casinoId: "",
      verified: false
    }
  });

  useEffect(() => {
    const fetchCasinos = async () => {
      try {
        const response = await fetch('/api/casinos');
        if (!response.ok) {
          throw new Error("Failed to fetch casinos");
        }
        const data = await response.json();
        setCasinos(data);
      } catch (err) {
        setError("Error fetching casinos. Please try again.");
        console.error(err);
      }
    };

    const fetchReview = async () => {
      try {
        // Only fetch review data if we have an ID (not for new reviews)
        if (params.id !== "new") {
          const response = await fetch(`/api/reviews/${params.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch review");
          }
          const review = await response.json();
          
          // Populate the form with fetched data
          setValue("author", review.author);
          setValue("content", review.content);
          setValue("rating", review.rating);
          setValue("casinoId", review.casinoId);
          setValue("verified", review.verified || false);
        }
      } catch (err) {
        setError("Error fetching review. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    Promise.all([fetchCasinos(), fetchReview()])
      .then(() => setLoading(false))
      .catch(err => {
        console.error("Error during initialization:", err);
        setLoading(false);
        setError("An error occurred. Please try again.");
      });
  }, [params.id, setValue]);

  const onSubmit = async (data: ReviewFormData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const url = params.id === "new" 
        ? '/api/reviews' 
        : `/api/reviews/${params.id}`;
      
      const method = params.id === "new" ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save review");
      }
      
      router.push('/admin/reviews');
    } catch (err: any) {
      setError(err.message || "An error occurred saving the review");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">
        {params.id === "new" ? "Add New Review" : "Edit Review"}
      </h1>
      
      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-group">
          <label className="block mb-2 font-medium">Casino</label>
          <select
            {...register("casinoId")}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700"
          >
            <option value="">Select a casino</option>
            {casinos.map(casino => (
              <option key={casino.id} value={casino.id}>
                {casino.name}
              </option>
            ))}
          </select>
          {errors.casinoId && (
            <p className="admin-error mt-1">{errors.casinoId.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label className="block mb-2 font-medium">Author Name</label>
          <input
            type="text"
            {...register("author")}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700"
            placeholder="John Doe"
          />
          {errors.author && (
            <p className="admin-error mt-1">{errors.author.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label className="block mb-2 font-medium">Rating (1-5)</label>
          <input
            type="number"
            {...register("rating")}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700"
            min="1"
            max="5"
            step="0.1"
          />
          {errors.rating && (
            <p className="admin-error mt-1">{errors.rating.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label className="block mb-2 font-medium">Review Content</label>
          <textarea
            {...register("content")}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700"
            rows={6}
            placeholder="Write your review here..."
          ></textarea>
          {errors.content && (
            <p className="admin-error mt-1">{errors.content.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("verified")}
              id="verified"
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="verified" className="font-medium">
              Verified Review
            </label>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Check this to show the review with a verified badge on the frontend
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Review"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/reviews')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 
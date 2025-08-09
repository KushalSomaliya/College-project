"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/app/contexts/AuthContext";
// Categories and experience levels
const GIG_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Design',
  'Marketing',
  'Writing',
  'Video Editing',
  'Translation',
  'Research',
  'Other'
] as const

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner - New to this type of work' },
  { value: 'intermediate', label: 'Intermediate - Some experience required' },
  { value: 'advanced', label: 'Advanced - Expert level needed' }
] as const

const postGigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(5, "Description must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
  budget: z
    .number()
    .min(5, "Budget must be at least $5")
    .max(10000, "Budget cannot exceed $10,000"),
  duration: z.string().min(1, "Duration is required"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

type PostGigFormData = z.infer<typeof postGigSchema>;

export default function PostGigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostGigFormData>({
    resolver: zodResolver(postGigSchema),
    defaultValues: {
      experienceLevel: "beginner",
    },
  });

  const onSubmit = async (data: PostGigFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          employerId: user.id,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/my-gigs");
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to post gig');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Post gig error:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!user || user.userType !== "employer") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Post a New Gig
        </h1>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-300">
              Gig posted successfully! Redirecting to your gigs...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Gig Title *
            </label>
            <input
              {...register("title")}
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
              placeholder="e.g., React Developer for E-commerce Website"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Category *
            </label>
            <select
              {...register("category")}
              id="category"
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {GIG_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Description *
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
              placeholder="Describe the work that needs to be done..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget (Fixed only) */}
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-[var(--foreground)] mb-1"
              >
                Budget (Fixed Price) *
              </label>
              <input
                {...register("budget", { valueAsNumber: true })}
                type="number"
                id="budget"
                className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
                placeholder="Enter amount in $"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.budget.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-[var(--foreground)] mb-1"
              >
                Duration *
              </label>
              <input
                {...register("duration")}
                type="text"
                id="duration"
                className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
                placeholder="e.g., 2 weeks, 1 month"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label
              htmlFor="experienceLevel"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Experience Level *
            </label>
            <select
              {...register("experienceLevel")}
              id="experienceLevel"
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSubmitting ? "Posting..." : "Post Gig"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-md font-medium hover:bg-[var(--foreground)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

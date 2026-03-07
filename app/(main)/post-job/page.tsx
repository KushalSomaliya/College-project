"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/app/contexts/AuthContext";
// Categories and experience levels
const JOB_CATEGORIES = [
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

const postJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(5, "Description must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
  budget: z
    .number()
    .min(5, "Budget must be at least ₹5")
    .max(1000000, "Budget cannot exceed ₹10,00,000"),
  duration: z.string().min(1, "Duration is required"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

type PostJobFormData = z.infer<typeof postJobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostJobFormData>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      experienceLevel: "beginner",
    },
  });

  const onSubmit = async (data: PostJobFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
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
          router.push("/my-jobs");
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to post job');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Post job error:', error);
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
      <div className="bg-[var(--background)] border border-gray-200 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Post a New Job
        </h1>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">
              Job posted successfully! Redirecting to your jobs...
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
              Job Title *
            </label>
            <input
              {...register("title")}
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {JOB_CATEGORIES.map((category) => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                placeholder="Enter amount in ₹"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 border border-gray-300 text-[var(--foreground)] rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

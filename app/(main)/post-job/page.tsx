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
    .min(5, "Pay must be at least ₹5")
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

  const inputClasses =
    "w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all";

  return (
    <div className="max-w-[820px] mx-auto">
      <div
        className="bg-white border border-white rounded-3xl p-8"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
      >
        <h1
          className="text-[1.75rem] font-extrabold text-[#111] mb-6"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Post a New Job
        </h1>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
            <p className="text-[#166534] text-sm font-medium">
              Job posted successfully! Redirecting to your jobs...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
            >
              Job Title *
            </label>
            <input
              {...register("title")}
              type="text"
              id="title"
              className={inputClasses}
              placeholder="e.g., React Developer for E-commerce Website"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-[#e85d2f]">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
            >
              Category *
            </label>
            <select
              {...register("category")}
              id="category"
              className={inputClasses}
            >
              <option value="">Select a category</option>
              {JOB_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-[#e85d2f]">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
            >
              Description *
            </label>
            <textarea
              {...register("description")}
              id="description"
              rows={4}
              className={inputClasses}
              placeholder="Describe the work that needs to be done..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[#e85d2f]">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget (Fixed only) */}
            <div>
              <label
                htmlFor="budget"
                className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
              >
                Pay (Fixed Price) *
              </label>
              <input
                {...register("budget", { valueAsNumber: true })}
                type="number"
                id="budget"
                className={inputClasses}
                placeholder="Enter amount in ₹"
              />
              {errors.budget && (
                <p className="mt-1 text-xs text-[#e85d2f]">
                  {errors.budget.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
              >
                Duration *
              </label>
              <input
                {...register("duration")}
                type="text"
                id="duration"
                className={inputClasses}
                placeholder="e.g., 2 weeks, 1 month"
              />
              {errors.duration && (
                <p className="mt-1 text-xs text-[#e85d2f]">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label
              htmlFor="experienceLevel"
              className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
            >
              Experience Level *
            </label>
            <select
              {...register("experienceLevel")}
              id="experienceLevel"
              className={inputClasses}
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
              className="flex-1 py-2.5 px-4 bg-[#e85d2f] text-white rounded-full font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#e85d2f]/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                fontFamily: "'Syne', sans-serif",
                boxShadow: "0 4px 16px rgba(232,93,47,0.18)",
              }}
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 border-[1.5px] border-[#e5e2db] text-[#111] rounded-full font-medium hover:bg-[#f7f5f0] focus:outline-none focus:ring-2 focus:ring-[#e85d2f]/20 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

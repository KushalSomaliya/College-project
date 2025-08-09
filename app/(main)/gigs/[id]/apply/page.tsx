"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Gig {
  _id: string
  title: string
  description: string
  company: string
  employerId: string
  employerName: string
  budget: number
  duration: string
  postedDate: string
  status: 'active' | 'closed' | 'completed'
  category: string
  experienceLevel: string
}

const applySchema = z.object({
  experienceYears: z.number().min(0).max(50),
  experienceMonths: z.number().min(0).max(11),
  coverLetter: z
    .string()
    .min(1, "Cover letter is required")
    .min(50, "Cover letter must be at least 50 characters")
    .max(1000, "Cover letter cannot exceed 1000 characters"),
  proposedRate: z
    .number()
    .min(5, "Proposed rate must be at least $5")
    .max(10000, "Proposed rate cannot exceed $10,000"),
});

type ApplyFormData = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gigId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gig, setGig] = useState<Gig | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      experienceYears: 0,
      experienceMonths: 0,
      coverLetter: "",
      proposedRate: 0,
    },
  });

  useEffect(() => {
    if (user && gigId) {
      fetchData();
    }
  }, [user, gigId]);

  const fetchData = async () => {
    try {
      // Fetch gig details
      const gigResponse = await fetch(`/api/gigs/${gigId}`);
      if (gigResponse.ok) {
        const gigData = await gigResponse.json();
        setGig(gigData.gig);
      }

      // Check if student has already applied
      const appsResponse = await fetch(`/api/applications?studentId=${user?.id}&gigId=${gigId}`);
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setAlreadyApplied(appsData.applications.length > 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== "student") {
    router.push("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--foreground)]/60">Loading...</p>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--foreground)]/60 mb-4">Gig not found</p>
        <Link href="/gigs" className="text-[var(--foreground)] hover:underline">
          Back to Browse Gigs
        </Link>
      </div>
    );
  }

  if (gig.status !== "active") {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--foreground)]/60 mb-4">
          This gig is no longer accepting applications
        </p>
        <Link href="/gigs" className="text-[var(--foreground)] hover:underline">
          Back to Browse Gigs
        </Link>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--foreground)]/60 mb-4">
          You have already applied to this gig
        </p>
        <Link
          href="/dashboard"
          className="text-[var(--foreground)] hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true);

    // Format experience text
    const experienceParts = [];
    if (data.experienceYears > 0) {
      experienceParts.push(
        `${data.experienceYears} year${data.experienceYears > 1 ? "s" : ""}`
      );
    }
    if (data.experienceMonths > 0) {
      experienceParts.push(
        `${data.experienceMonths} month${data.experienceMonths > 1 ? "s" : ""}`
      );
    }

    const experienceText =
      experienceParts.length > 0
        ? experienceParts.join(" and ") + " of experience"
        : "No prior experience";

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gigId: gigId,
          studentId: user.id,
          coverLetter: data.coverLetter,
          proposedRate: data.proposedRate,
          experience: experienceText,
        }),
      });

      if (response.ok) {
        // Redirect to dashboard with success
        router.push("/dashboard?applied=true");
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit application');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const experienceYears = watch("experienceYears");
  const experienceMonths = watch("experienceMonths");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/gigs"
          className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-2 inline-block"
        >
          ← Back to Browse Gigs
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Apply to Gig
        </h1>
      </div>

      {/* Gig Details */}
      <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {gig.title}
          </h2>
          <p className="text-[var(--foreground)]/60">
            {gig.company} • {gig.employerName}
          </p>
        </div>

        <p className="text-[var(--foreground)]/80 mb-4">{gig.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--foreground)]/60">Budget</p>
            <p className="font-semibold text-[var(--foreground)]">
              ${gig.budget}
            </p>
          </div>
          <div>
            <p className="text-[var(--foreground)]/60">Duration</p>
            <p className="text-[var(--foreground)]">{gig.duration}</p>
          </div>
          <div>
            <p className="text-[var(--foreground)]/60">Experience</p>
            <p className="text-[var(--foreground)] capitalize">
              {gig.experienceLevel}
            </p>
          </div>
          <div>
            <p className="text-[var(--foreground)]/60">Posted</p>
            <p className="text-[var(--foreground)]">
              {formatDate(gig.postedDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Your Application
          </h3>

          {/* Experience */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Experience in {gig.category}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="experienceYears"
                  className="block text-sm text-[var(--foreground)]/60 mb-1"
                >
                  Years
                </label>
                <input
                  {...register("experienceYears", { valueAsNumber: true })}
                  type="number"
                  id="experienceYears"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
                />
                {errors.experienceYears && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.experienceYears.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="experienceMonths"
                  className="block text-sm text-[var(--foreground)]/60 mb-1"
                >
                  Months
                </label>
                <input
                  {...register("experienceMonths", { valueAsNumber: true })}
                  type="number"
                  id="experienceMonths"
                  min="0"
                  max="11"
                  className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
                />
                {errors.experienceMonths && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.experienceMonths.message}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground)]/60">
              {experienceYears === 0 && experienceMonths === 0
                ? "No prior experience"
                : `${
                    experienceYears > 0
                      ? `${experienceYears} year${
                          experienceYears > 1 ? "s" : ""
                        }`
                      : ""
                  }${
                    experienceYears > 0 && experienceMonths > 0 ? " and " : ""
                  }${
                    experienceMonths > 0
                      ? `${experienceMonths} month${
                          experienceMonths > 1 ? "s" : ""
                        }`
                      : ""
                  } of experience`}
            </p>
          </div>

          {/* Cover Letter */}
          <div className="mb-6">
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Cover Letter
            </label>
            <textarea
              {...register("coverLetter")}
              id="coverLetter"
              rows={6}
              placeholder="Explain why you're the perfect fit for this gig..."
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent resize-none"
            />
            {errors.coverLetter && (
              <p className="mt-1 text-sm text-red-500">
                {errors.coverLetter.message}
              </p>
            )}
            <p className="mt-1 text-sm text-[var(--foreground)]/60">
              {watch("coverLetter")?.length || 0}/1000 characters
            </p>
          </div>

          {/* Proposed Rate */}
          <div>
            <label
              htmlFor="proposedRate"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Proposed Rate ($)
            </label>
            <input
              {...register("proposedRate", { valueAsNumber: true })}
              type="number"
              id="proposedRate"
              min="5"
              max="10000"
              placeholder={`Budget: $${gig.budget}`}
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            />
            {errors.proposedRate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.proposedRate.message}
              </p>
            )}
            <p className="mt-1 text-sm text-[var(--foreground)]/60">
              The employer's budget for this gig is ${gig.budget}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? "Submitting Application..." : "Apply Now"}
          </button>
          <Link
            href="/gigs"
            className="px-4 py-2 border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-md font-medium hover:bg-[var(--foreground)]/5 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

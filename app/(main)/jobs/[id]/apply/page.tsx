"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Job {
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
    .min(5, "Proposed rate must be at least ₹5")
    .max(1000000, "Proposed rate cannot exceed ₹10,00,000"),
});

type ApplyFormData = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
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
    if (user && jobId) {
      fetchData();
    }
  }, [user, jobId]);

  const fetchData = async () => {
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData.job);
      }

      // Check if employee has already applied
      const appsResponse = await fetch(`/api/applications?employeeId=${user?.id}&jobId=${jobId}`);
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

  if (!user || user.userType !== "employee") {
    router.push("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#bbb] font-light">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-[#bbb] font-light mb-4">Job not found</p>
        <Link href="/jobs" className="text-[0.82rem] text-[#e85d2f] font-medium hover:underline">
          Back to Browse Jobs
        </Link>
      </div>
    );
  }

  if (job.status !== "active") {
    return (
      <div className="text-center py-12">
        <p className="text-[#bbb] font-light mb-4">
          This job is no longer accepting applications
        </p>
        <Link href="/jobs" className="text-[0.82rem] text-[#e85d2f] font-medium hover:underline">
          Back to Browse Jobs
        </Link>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="text-center py-12">
        <p className="text-[#bbb] font-light mb-4">
          You have already applied to this job
        </p>
        <Link
          href="/dashboard"
          className="text-[0.82rem] text-[#e85d2f] font-medium hover:underline"
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
          jobId: jobId,
          employeeId: user.id,
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
          href="/jobs"
          className="text-[0.82rem] text-[#e85d2f] font-medium hover:underline mb-2 inline-block"
        >
          ← Back to Browse Jobs
        </Link>
        <h1
          className="text-2xl font-bold text-[#111]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Apply to Job
        </h1>
      </div>

      {/* Job Details */}
      <div className="bg-white border border-[#ede9e3] rounded-2xl p-6">
        <div className="mb-4">
          <h2
            className="text-xl font-semibold text-[#111] mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {job.title}
          </h2>
          <p className="text-[#aaa]">
            {job.company} • {job.employerName}
          </p>
        </div>

        <p className="text-[#555] mb-4">{job.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#aaa]">Budget</p>
            <p className="font-semibold text-[#111]">
              ₹{job.budget}
            </p>
          </div>
          <div>
            <p className="text-[#aaa]">Duration</p>
            <p className="text-[#111]">{job.duration}</p>
          </div>
          <div>
            <p className="text-[#aaa]">Experience</p>
            <p className="text-[#111] capitalize">
              {job.experienceLevel}
            </p>
          </div>
          <div>
            <p className="text-[#aaa]">Posted</p>
            <p className="text-[#111]">
              {formatDate(job.postedDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-6">
          <h3
            className="text-lg font-semibold text-[#111] mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Your Application
          </h3>

          {/* Experience */}
          <div className="mb-6">
            <label className="block text-[0.82rem] font-medium text-[#444] mb-1.5">
              Experience in {job.category}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="experienceYears"
                  className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
                >
                  Years
                </label>
                <input
                  {...register("experienceYears", { valueAsNumber: true })}
                  type="number"
                  id="experienceYears"
                  min="0"
                  max="50"
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
                />
                {errors.experienceYears && (
                  <p className="mt-1 text-xs text-[#e85d2f]">
                    {errors.experienceYears.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="experienceMonths"
                  className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
                >
                  Months
                </label>
                <input
                  {...register("experienceMonths", { valueAsNumber: true })}
                  type="number"
                  id="experienceMonths"
                  min="0"
                  max="11"
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
                />
                {errors.experienceMonths && (
                  <p className="mt-1 text-xs text-[#e85d2f]">
                    {errors.experienceMonths.message}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-[#aaa]">
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
              className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
            >
              Cover Letter
            </label>
            <textarea
              {...register("coverLetter")}
              id="coverLetter"
              rows={6}
              placeholder="Explain why you're the perfect fit for this job..."
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] resize-none"
            />
            {errors.coverLetter && (
              <p className="mt-1 text-xs text-[#e85d2f]">
                {errors.coverLetter.message}
              </p>
            )}
            <p className="mt-1 text-sm text-[#aaa]">
              {watch("coverLetter")?.length || 0}/1000 characters
            </p>
          </div>

          {/* Proposed Rate */}
          <div>
            <label
              htmlFor="proposedRate"
              className="block text-[0.82rem] font-medium text-[#444] mb-1.5"
            >
              Proposed Rate (₹)
            </label>
            <input
              {...register("proposedRate", { valueAsNumber: true })}
              type="number"
              id="proposedRate"
              min="5"
              max="10000"
              placeholder={`Budget: ₹${job.budget}`}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            />
            {errors.proposedRate && (
              <p className="mt-1 text-xs text-[#e85d2f]">
                {errors.proposedRate.message}
              </p>
            )}
            <p className="mt-1 text-sm text-[#aaa]">
              The employer's budget for this job is ₹{job.budget}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-[#e85d2f] text-white rounded-full font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#e85d2f]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              fontFamily: "'Syne', sans-serif",
              boxShadow: '0 4px 16px rgba(232,93,47,0.3)',
            }}
          >
            {isSubmitting ? "Submitting Application..." : "Apply Now"}
          </button>
          <Link
            href="/jobs"
            className="px-4 py-2.5 border-[1.5px] border-[#e5e2db] text-[#111] rounded-full font-medium hover:bg-[#f7f5f0] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Job {
  _id: string;
  id?: string;
  title: string;
  description: string;
  company: string;
  employerId: string;
  employerName: string;
  budget: number;
  duration: string;
  applicationsCount: number;
  postedDate: string;
  status: 'active' | 'closed' | 'completed';
  category: string;
  experienceLevel: string;
}

export default function MyJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    jobId: string | null;
  }>({
    isOpen: false,
    jobId: null,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userType === "employer") {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs?employerId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== "employer") {
    router.push("/dashboard");
    return null;
  }

  const activeJobs = jobs.filter((job) => job.status === "active");
  const closedJobs = jobs.filter(
    (job) => job.status === "closed" || job.status === "completed"
  );

  const handleCloseJob = (jobId: string) => {
    setConfirmDialog({ isOpen: true, jobId });
  };

  const confirmCloseJob = async () => {
    if (confirmDialog.jobId) {
      try {
        const response = await fetch(`/api/jobs/${confirmDialog.jobId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'closed' }),
        });

        if (response.ok) {
          // Refresh jobs list
          fetchJobs();
        }
      } catch (error) {
        console.error('Error closing job:', error);
      }
    }
    setConfirmDialog({ isOpen: false, jobId: null });
  };

  const cancelCloseJob = () => {
    setConfirmDialog({ isOpen: false, jobId: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--foreground)]/60">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            My Jobs
          </h1>
          <Link
            href="/post-job"
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Post New Job
          </Link>
        </div>

        {/* Active Jobs */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="grid gap-4">
            {activeJobs.map((job) => (
              <div
                key={job._id}
                className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                      {job.title}
                    </h3>
                    <p className="text-[var(--foreground)]/60 text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm rounded-full">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[var(--foreground)]/60">Applications</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {job.applicationsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Budget</p>
                    <p className="font-medium text-[var(--foreground)]">
                      ${job.budget}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Posted</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {formatDate(job.postedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleCloseJob(job._id)}
                    className="px-4 py-2 border border-red-500/50 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-500/10 transition-colors"
                  >
                    Close Job
                  </button>
                </div>
              </div>
            ))}
            {activeJobs.length === 0 && (
              <div className="text-center py-8 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg">
                <p className="text-[var(--foreground)]/60">
                  No active jobs. Post your first job to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Closed Jobs */}
        {closedJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
              Closed Jobs ({closedJobs.length})
            </h2>
            <div className="grid gap-4">
              {closedJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6 opacity-75"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        {job.title}
                      </h3>
                      <p className="text-[var(--foreground)]/60 text-sm mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 text-sm rounded-full">
                      {job.status === "completed" ? "Completed" : "Closed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--foreground)]/60">
                        Applications
                      </p>
                      <p className="font-medium text-[var(--foreground)]">
                        {job.applicationsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground)]/60">Budget</p>
                      <p className="font-medium text-[var(--foreground)]">
                        ${job.budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground)]/60">Posted</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {formatDate(job.postedDate)}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[var(--foreground)]/60">&nbsp;</p>
                      <Link
                        href={`/jobs/${job._id}`}
                        className="text-sm text-[var(--foreground)] hover:underline inline-block font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background)] border border-[var(--foreground)]/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Close Job
            </h3>
            <p className="text-[var(--foreground)]/80 mb-6">
              Are you sure you want to close this job? This action cannot be
              undone and the job will no longer accept applications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelCloseJob}
                className="px-4 py-2 border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-md font-medium hover:bg-[var(--foreground)]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseJob}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Close Job
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

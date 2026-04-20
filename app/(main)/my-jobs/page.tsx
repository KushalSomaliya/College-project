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
        <p className="text-[#bbb] font-light text-base">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h1
            className="text-[1.75rem] font-extrabold text-[#111]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            My Jobs
          </h1>
          <Link
            href="/post-job"
            className="px-5 py-2.5 bg-[#e85d2f] text-white rounded-full font-semibold text-sm hover:brightness-110 transition-all"
            style={{
              fontFamily: "'Syne', sans-serif",
              boxShadow: "0 4px 16px rgba(232,93,47,0.18)",
            }}
          >
            Post New Job
          </Link>
        </div>

        {/* Active Jobs */}
        <div>
          <h2
            className="text-[1.1rem] font-extrabold text-[#111] mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="grid gap-4">
            {activeJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-[#ede9e3] rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-bold text-[#111] mb-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.title}
                    </h3>
                    <p className="text-[#888] text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                      Applications
                    </p>
                    <p
                      className="font-bold text-[#111]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.applicationsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                      Pay
                    </p>
                    <p
                      className="font-bold text-[#111]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      ₹{job.budget}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                      Posted
                    </p>
                    <p
                      className="font-bold text-[#111]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {formatDate(job.postedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="px-4 py-2 bg-[#111] text-white rounded-full text-sm font-medium hover:bg-[#222] transition-colors"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleCloseJob(job._id)}
                    className="px-4 py-2 border border-[#fecaca] text-[#991b1b] rounded-full text-sm font-medium hover:bg-[#fef2f2] transition-colors"
                  >
                    Close Job
                  </button>
                </div>
              </div>
            ))}
            {activeJobs.length === 0 && (
              <div className="text-center py-8 bg-white border border-[#ede9e3] rounded-2xl">
                <p className="text-[#bbb] font-light">
                  No active jobs. Post your first job to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Closed Jobs */}
        {closedJobs.length > 0 && (
          <div>
            <h2
              className="text-[1.1rem] font-extrabold text-[#111] mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Closed Jobs ({closedJobs.length})
            </h2>
            <div className="grid gap-4">
              {closedJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-[#ede9e3] rounded-2xl p-6 opacity-75"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-bold text-[#111] mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {job.title}
                      </h3>
                      <p className="text-[#888] text-sm mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#d69191] text-[#7c0d0df7] text-xs font-medium rounded-full">
                      {job.status === "completed" ? "Completed" : "Closed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                        Applications
                      </p>
                      <p
                        className="font-bold text-[#111]"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {job.applicationsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                        Budget
                      </p>
                      <p
                        className="font-bold text-[#111]"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        ₹{job.budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                        Posted
                      </p>
                      <p
                        className="font-bold text-[#111]"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {formatDate(job.postedDate)}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[0.75rem] text-[#696969] uppercase tracking-wide mb-0.5">
                        &nbsp;
                      </p>
                      <Link
                        href={`/jobs/${job._id}`}
                        className="text-[.82rem] text-[#e29222] hover:text-[#111] inline-block font-normal border-[1.5px] border-white transition-colors"
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
          <div className="bg-white border border-[#ede9e3] rounded-3xl p-6 max-w-md w-full">
            <h3
              className="text-lg font-extrabold text-[#111] mb-3"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Close Job
            </h3>
            <p className="text-[#888] mb-6 text-sm leading-relaxed">
              Are you sure you want to close this job? This action cannot be
              undone and the job will no longer accept applications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelCloseJob}
                className="px-4 py-2 border border-[#ede9e3] text-[#111] rounded-full font-medium hover:bg-[#f7f5f0] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseJob}
                className="px-4 py-2 bg-[#e85d2f] text-white rounded-full font-medium hover:brightness-110 transition-all text-sm"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: "0 4px 16px rgba(232,93,47,0.18)",
                }}
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

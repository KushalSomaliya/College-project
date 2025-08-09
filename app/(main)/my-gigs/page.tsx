"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Gig {
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

export default function MyGigsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    gigId: string | null;
  }>({
    isOpen: false,
    gigId: null,
  });
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userType === "employer") {
      fetchGigs();
    }
  }, [user]);

  const fetchGigs = async () => {
    try {
      const response = await fetch(`/api/gigs?employerId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setGigs(data.gigs);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== "employer") {
    router.push("/dashboard");
    return null;
  }

  const activeGigs = gigs.filter((gig) => gig.status === "active");
  const closedGigs = gigs.filter(
    (gig) => gig.status === "closed" || gig.status === "completed"
  );

  const handleCloseGig = (gigId: string) => {
    setConfirmDialog({ isOpen: true, gigId });
  };

  const confirmCloseGig = async () => {
    if (confirmDialog.gigId) {
      try {
        const response = await fetch(`/api/gigs/${confirmDialog.gigId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'closed' }),
        });

        if (response.ok) {
          // Refresh gigs list
          fetchGigs();
        }
      } catch (error) {
        console.error('Error closing gig:', error);
      }
    }
    setConfirmDialog({ isOpen: false, gigId: null });
  };

  const cancelCloseGig = () => {
    setConfirmDialog({ isOpen: false, gigId: null });
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
            My Gigs
          </h1>
          <Link
            href="/post-gig"
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Post New Gig
          </Link>
        </div>

        {/* Active Gigs */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Active Gigs ({activeGigs.length})
          </h2>
          <div className="grid gap-4">
            {activeGigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                      {gig.title}
                    </h3>
                    <p className="text-[var(--foreground)]/60 text-sm mb-3 line-clamp-2">
                      {gig.description}
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
                      {gig.applicationsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Budget</p>
                    <p className="font-medium text-[var(--foreground)]">
                      ${gig.budget}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Posted</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {formatDate(gig.postedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/gigs/${gig._id}`}
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleCloseGig(gig._id)}
                    className="px-4 py-2 border border-red-500/50 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-500/10 transition-colors"
                  >
                    Close Gig
                  </button>
                </div>
              </div>
            ))}
            {activeGigs.length === 0 && (
              <div className="text-center py-8 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg">
                <p className="text-[var(--foreground)]/60">
                  No active gigs. Post your first gig to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Closed Gigs */}
        {closedGigs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
              Closed Gigs ({closedGigs.length})
            </h2>
            <div className="grid gap-4">
              {closedGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6 opacity-75"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        {gig.title}
                      </h3>
                      <p className="text-[var(--foreground)]/60 text-sm mb-3 line-clamp-2">
                        {gig.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 text-sm rounded-full">
                      {gig.status === "completed" ? "Completed" : "Closed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--foreground)]/60">
                        Applications
                      </p>
                      <p className="font-medium text-[var(--foreground)]">
                        {gig.applicationsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground)]/60">Budget</p>
                      <p className="font-medium text-[var(--foreground)]">
                        ${gig.budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground)]/60">Posted</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {formatDate(gig.postedDate)}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[var(--foreground)]/60">&nbsp;</p>
                      <Link
                        href={`/gigs/${gig._id}`}
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
              Close Gig
            </h3>
            <p className="text-[var(--foreground)]/80 mb-6">
              Are you sure you want to close this gig? This action cannot be
              undone and the gig will no longer accept applications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelCloseGig}
                className="px-4 py-2 border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-md font-medium hover:bg-[var(--foreground)]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseGig}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Close Gig
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

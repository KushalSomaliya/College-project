"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Gig {
  _id: string;
  title: string;
  description: string;
  company: string;
  employerId: string;
  employerName: string;
  budget: number;
  duration: string;
  applicationsCount: number;
  postedDate: string;
  status: "active" | "closed" | "completed";
  category: string;
  experienceLevel: string;
}

interface Application {
  gigId: any; // Can be string or populated object
  studentId: string;
}

const GIG_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Design",
  "Marketing",
  "Writing",
  "Video Editing",
  "Translation",
  "Research",
  "Other",
] as const;

export default function GigsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userType === "student") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch active gigs
      const gigsResponse = await fetch("/api/gigs?status=active");
      if (gigsResponse.ok) {
        const gigsData = await gigsResponse.json();
        setGigs(gigsData.gigs);
      }

      // Fetch student's applications
      const appsResponse = await fetch(
        `/api/applications?studentId=${user?.id}`
      );
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setMyApplications(appsData.applications);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only students can browse gigs
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

  // Get applied gig IDs for checking (handle both string and populated object)
  const appliedGigIds = myApplications.map((app) => 
    typeof app.gigId === 'string' ? app.gigId : app.gigId._id
  );
  console.log("appliedGigIds:", appliedGigIds);


  // Only filter active gigs
  const activeGigs = gigs.filter((gig) => gig.status === "active");

  // Apply filters
  const filteredGigs = activeGigs.filter((gig) => {
    const matchesCategory =
      selectedCategory === "all" || gig.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.company.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Get unique categories from active gigs
  const availableCategories = [
    "all",
    ...Array.from(new Set(activeGigs.map((gig) => gig.category))),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Browse Gigs
        </h1>
        <p className="text-[var(--foreground)]/60 mt-1">
          Find freelance opportunities that match your skills
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Search gigs
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or company..."
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-[var(--foreground)]/60">
        Showing {filteredGigs.length}{" "}
        {filteredGigs.length === 1 ? "gig" : "gigs"}
        {selectedCategory !== "all" && ` in ${selectedCategory}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGigs.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg">
            <p className="text-[var(--foreground)]/60">
              {searchQuery || selectedCategory !== "all"
                ? "No gigs found matching your criteria. Try adjusting your filters."
                : "No active gigs available at the moment."}
            </p>
            <Link
              href="/my-applications"
              className="text-[var(--foreground)] hover:underline font-medium mt-4 inline-block"
            >
              View Your Applications
            </Link>
          </div>
        ) : (
          filteredGigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* Gig Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2">
                    {gig.title}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-full whitespace-nowrap ml-2">
                    {gig.category}
                  </span>
                </div>
                <p className="text-sm text-[var(--foreground)]/60">
                  {gig.company} • {gig.employerName}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--foreground)]/80 mb-4 line-clamp-3 flex-grow">
                {gig.description}
              </p>

              {/* Gig Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Budget</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    ${gig.budget}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Duration</span>
                  <span className="text-[var(--foreground)]">
                    {gig.duration}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">
                    Experience
                  </span>
                  <span className="text-[var(--foreground)] capitalize">
                    {gig.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--foreground)]/10 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-[var(--foreground)]/60">
                    Posted {formatDate(gig.postedDate)}
                  </span>
                  <span className="text-xs text-[var(--foreground)]/60">
                    {gig.applicationsCount}{" "}
                    {gig.applicationsCount === 1 ? "applicant" : "applicants"}
                  </span>
                </div>

                {appliedGigIds.includes(gig._id) ? (
                  <div className="w-full text-center py-2 px-4 bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-md border border-[var(--foreground)]/20">
                    Applied ✓
                  </div>
                ) : (
                  <Link
                    href={`/gigs/${gig._id}/apply`}
                    className="w-full block text-center py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 transition-opacity"
                  >
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

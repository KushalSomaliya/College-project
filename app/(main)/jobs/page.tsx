"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Job {
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
  jobId: any; // Can be string or populated object
  employeeId: string;
}

const JOB_CATEGORIES = [
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

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userType === "employee") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch active jobs
      const jobsResponse = await fetch("/api/jobs?status=active");
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs);
      }

      // Fetch employee's applications
      const appsResponse = await fetch(
        `/api/applications?employeeId=${user?.id}`
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

  // Only employees can browse jobs
  if (!user || user.userType !== "employee") {
    router.push("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Get applied job IDs for checking (handle both string and populated object)
  const appliedJobIds = myApplications.map((app) => 
    typeof app.jobId === 'string' ? app.jobId : app.jobId?._id
  );
  console.log("appliedJobIds:", appliedJobIds);


  // Only filter active jobs
  const activeJobs = jobs.filter((job) => job.status === "active");

  // Apply filters
  const filteredJobs = activeJobs.filter((job) => {
    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Get unique categories from active jobs
  const availableCategories = [
    "all",
    ...Array.from(new Set(activeJobs.map((job) => job.category))),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Browse Jobs
        </h1>
        <p className="text-gray-500 mt-1">
          Find freelance opportunities that match your skills
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--background)] border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Search jobs
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or company..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
      <div className="text-sm text-gray-500">
        Showing {filteredJobs.length}{" "}
        {filteredJobs.length === 1 ? "job" : "jobs"}
        {selectedCategory !== "all" && ` in ${selectedCategory}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[var(--background)] border border-gray-200 rounded-lg">
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== "all"
                ? "No jobs found matching your criteria. Try adjusting your filters."
                : "No active jobs available at the moment."}
            </p>
            <Link
              href="/my-applications"
              className="text-primary hover:underline font-medium mt-4 inline-block"
            >
              View Your Applications
            </Link>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-[var(--background)] border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* Job Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2">
                    {job.title}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-[var(--foreground)] rounded-full whitespace-nowrap ml-2">
                    {job.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {job.company} • {job.employerName}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                {job.description}
              </p>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    ₹{job.budget}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-[var(--foreground)]">
                    {job.duration}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Experience
                  </span>
                  <span className="text-[var(--foreground)] capitalize">
                    {job.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500">
                    Posted {formatDate(job.postedDate)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {job.applicationsCount}{" "}
                    {job.applicationsCount === 1 ? "applicant" : "applicants"}
                  </span>
                </div>

                {appliedJobIds.includes(job._id) ? (
                  <div className="w-full text-center py-2 px-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                    Applied ✓
                  </div>
                ) : (
                  <Link
                    href={`/jobs/${job._id}/apply`}
                    className="w-full block text-center py-2 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors"
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

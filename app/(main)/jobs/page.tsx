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
        <p className="text-[#bbb] text-sm font-light">Loading...</p>
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
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div>
        <h1
          className="text-[1.75rem] font-extrabold text-[#111]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Browse Jobs
        </h1>
        <p className="text-[#aaa] font-light mt-1">
          Find freelance opportunities that match your skills
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ede9e3] rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-2"
            >
              Search jobs
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or company..."
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] placeholder:text-[#ccc] focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label
              htmlFor="category"
              className="block text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
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
      <div className="text-[0.82rem] text-[#bbb] font-light">
        Showing <span className="font-bold text-[#111]">{filteredJobs.length}</span>{" "}
        {filteredJobs.length === 1 ? "job" : "jobs"}
        {selectedCategory !== "all" && (
          <> in <span className="font-bold text-[#111]">{selectedCategory}</span></>
        )}
        {searchQuery && (
          <> matching <span className="font-bold text-[#111]">&ldquo;{searchQuery}&rdquo;</span></>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full bg-white border border-[#ede9e3] rounded-2xl py-16 px-6 text-center">
            <div className="text-4xl mb-4">
              {searchQuery || selectedCategory !== "all" ? "🔍" : "📭"}
            </div>
            <p className="text-[#bbb] font-light">
              {searchQuery || selectedCategory !== "all"
                ? "No jobs found matching your criteria. Try adjusting your filters."
                : "No active jobs available at the moment."}
            </p>
            <Link
              href="/my-applications"
              className="inline-block mt-5 px-5 py-2 bg-[#e85d2f] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              View Your Applications
            </Link>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all flex flex-col"
            >
              {/* Job Header */}
              <div className="mb-3">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3
                    className="text-[1.05rem] font-bold text-[#111] line-clamp-2 leading-snug"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {job.title}
                  </h3>
                  <span className="text-[0.68rem] px-2.5 py-1 bg-[#f3f1ed] text-[#888] rounded-full whitespace-nowrap uppercase font-medium tracking-wide">
                    {job.category}
                  </span>
                </div>
                <p className="text-[0.82rem] text-[#bbb] font-light">
                  {job.company} &middot; {job.employerName}
                </p>
              </div>

              {/* Description */}
              <p className="text-[0.85rem] text-[#888] mb-4 line-clamp-3 flex-grow font-light leading-relaxed">
                {job.description}
              </p>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-[#bbb] font-light">Budget</span>
                  <span
                    className="font-bold text-[#111]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    ₹{job.budget}
                  </span>
                </div>
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-[#bbb] font-light">Duration</span>
                  <span className="text-[#111]">
                    {job.duration}
                  </span>
                </div>
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-[#bbb] font-light">
                    Experience
                  </span>
                  <span className="text-[#111] capitalize">
                    {job.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#f3f1ed] pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[0.75rem] text-[#bbb]">
                    Posted {formatDate(job.postedDate)}
                  </span>
                  <span className="text-[0.75rem] text-[#bbb]">
                    {job.applicationsCount}{" "}
                    {job.applicationsCount === 1 ? "applicant" : "applicants"}
                  </span>
                </div>

                {appliedJobIds.includes(job._id) ? (
                  <div className="w-full text-center py-2 px-4 bg-[#f0fdf4] text-[#166534] rounded-full border border-[#bbf7d0] text-sm font-medium">
                    Applied ✓
                  </div>
                ) : (
                  <Link
                    href={`/jobs/${job._id}/apply`}
                    className="w-full block text-center py-2 px-4 bg-[#111] text-white rounded-full font-medium hover:bg-[#333] transition-colors text-sm"
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

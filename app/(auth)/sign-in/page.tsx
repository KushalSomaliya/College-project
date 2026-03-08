"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/app/contexts/AuthContext";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setLoginError("");

    const loggedInUser = await login(data.email, data.password);

    if (loggedInUser) {
      router.push(loggedInUser.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setLoginError("Invalid email or password");
    }
  };

  return (
    <div className="bg-[var(--background)] border border-gray-200 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6 text-center">
        Welcome back
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">
              {loginError}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            // Mock for development
            // Remove mock value for production
            // defaultValue="test@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--foreground)] mb-1"
          >
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            // Mock for development
            // Remove mock value for production
            // defaultValue="password123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center space-y-1">
        <p className="text-xs text-gray-400">
          Employee demo: employee@test.com / password123
        </p>
        <p className="text-xs text-gray-400">
          Employer demo: employer@test.com / password123
        </p>
        <p className="text-xs text-gray-400">
          Admin: admin@skillorbit.com / admin@123
        </p>
      </div>
    </div>
  );
}

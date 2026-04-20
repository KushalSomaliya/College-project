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
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const fillDemo = (email: string, password = "password123") => {
    setValue("email", email);
    setValue("password", password);
  };

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
    <div
      className="w-full max-w-[920px] border border-[#ede9e3] rounded-3xl p-10 sm:p-10"
      style={{
        background: 'rgba(247, 205, 180, 0.51)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
        animation: 'fadeUp 0.5s ease both',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-[#fff7f4] border border-[#fdd5c7] text-[#e85d2f] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Welcome Back
        </div>
        <h2 className="text-[1.75rem] font-extrabold text-[#111] tracking-tight" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
          Sign in
        </h2>
        <p className="text-sm text-[#999] font-light mt-2">Good to see you again</p>
      </div>

      {loginError && (
        <div className="bg-[#fff5f5] border border-[#fecaca] rounded-xl px-4 py-3 text-sm text-[#dc2626] mb-5">
          {loginError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            placeholder="SkillOrbit@example.com"
          />
          {errors.email && (
            <p className="text-xs text-[#e85d2f] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-[#e85d2f] mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#e85d2f] text-white border-none rounded-full text-[0.95rem] font-bold cursor-pointer mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Syne', sans-serif",
            boxShadow: '0 4px 16px rgba(232,93,47,0.3)',
          }}
        >
          {isSubmitting ? "Signing in..." : "Sign In \u2192"}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-[#999] font-light">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-[#e85d2f] font-medium no-underline hover:underline">
          Sign up free
        </Link>
      </div>

      {/* Demo Credentials */}
      {/* <div className="mt-6 bg-[#f7f5f0] border border-[#ede9e3] rounded-xl p-4">
        <div className="text-[0.72rem] font-semibold text-[#aaa] uppercase tracking-widest mb-2.5">
          Demo Accounts — click to fill
        </div>
        <div
          className="flex justify-between items-center py-1.5 border-b border-[#ede9e3] cursor-pointer group"
          onClick={() => fillDemo("employee@test.com")}
        >
          <span className="text-xs font-semibold text-[#888]" style={{ fontFamily: "'Syne', sans-serif" }}>Employee</span>
          <span className="text-xs text-[#bbb] font-light group-hover:text-[#e85d2f] transition-colors">employee@test.com / password123</span>
        </div>
        <div
          className="flex justify-between items-center py-1.5 border-b border-[#ede9e3] cursor-pointer group"
          onClick={() => fillDemo("employer@test.com")}
        >
          <span className="text-xs font-semibold text-[#888]" style={{ fontFamily: "'Syne', sans-serif" }}>Employer</span>
          <span className="text-xs text-[#bbb] font-light group-hover:text-[#e85d2f] transition-colors">employer@test.com / password123</span>
        </div>
        <div
          className="flex justify-between items-center py-1.5 cursor-pointer group"
          onClick={() => fillDemo("admin@skillorbit.com", "admin@123")}
        >
          <span className="text-xs font-semibold text-[#888]" style={{ fontFamily: "'Syne', sans-serif" }}>Admin</span>
          <span className="text-xs text-[#bbb] font-light group-hover:text-[#e85d2f] transition-colors">admin@skillorbit.com / admin@123</span>
        </div>
      </div> */}
    </div>
  );
}

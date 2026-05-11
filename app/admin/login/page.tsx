"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin-auth";
import { Input } from "@/components/ui/input";

const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(() => {
    const err = searchParams.get("error");
    if (err === "forbidden") {
      return "You do not have admin access. Contact the site owner if you need help.";
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      void createClient().auth.signOut();
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
      if (error) {
        setFormError("Invalid email or password.");
        return;
      }

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user || !isAdminUser(user)) {
        await supabase.auth.signOut();
        setFormError(
          "This account is not authorized for admin access. Use an admin email or ask for the admin role in Supabase."
        );
        return;
      }

      const dest = searchParams.get("redirect");
      const safe =
        dest &&
        dest.startsWith("/admin") &&
        !dest.startsWith("/admin/login") &&
        !dest.includes("..")
          ? dest
          : "/admin";
      router.push(safe);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image
            src={GOLDEN_LOGO}
            alt="Nauvaraha"
            width={200}
            height={50}
            className="h-auto w-[200px]"
            priority
          />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-[#1A1A1A]">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Supabase Auth — admin role or allowlisted email only.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-medium text-[#1A1A1A]"
            >
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              className="h-11 border-[#E8E8E8] bg-white"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-[#1A1A1A]"
            >
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="h-11 border-[#E8E8E8] bg-white"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient h-11 w-full rounded-full text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#999999]">
          Access restricted to Nauvaraha administrators.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white" />
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

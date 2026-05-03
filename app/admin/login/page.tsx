'use client'

// To create admin user: go to Supabase Dashboard → Authentication → Users → Add User
// Add your email and password there. That user can log in here.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
  })

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        setFormError("Invalid email or password")
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setFormError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>Sign in with your admin email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Email
              </label>
              <Input
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Password
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            {formError && (
              <p className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-zinc-500">
            Access restricted to Nauvaraha admins.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}


'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export function AdminLogout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
      router.push("/admin/login")
      router.refresh()
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Signing out…" : "Logout"}
    </Button>
  )
}


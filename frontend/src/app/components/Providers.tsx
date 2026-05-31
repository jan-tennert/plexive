"use client"

// This file exists solely to create a "use client" boundary so that
// AuthProvider (which uses React context) can be imported from layout.tsx,
// which is a Server Component and cannot import client code directly.
import { AuthProvider } from "@/app/lib/auth"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

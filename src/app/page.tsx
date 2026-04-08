'use client'

import React from 'react'
import LandingPage from '@/components/pages/landing'
import Dashboard from '@/components/pages/dashboard'
import { authClient } from '@/lib/auth-client'

const Page = () => {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return data?.user ? <Dashboard /> : <LandingPage />
}

export default Page
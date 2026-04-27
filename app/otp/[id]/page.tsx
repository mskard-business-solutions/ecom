
import OTPVerification from '@/components/otp'
import React from 'react'

async function page({params}: {params: Promise<{ id: string }>}) {
    const { id } = await params
    
  return (
   <OTPVerification id={id} />
  )
}

export default page
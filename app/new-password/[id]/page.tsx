
import NewPassword from '@/components/NewPassword'
import React from 'react'

async function page({params}: {params: Promise<{ id: string }>}) {
    const { id } = await params
    
  return (
   <NewPassword id={id} />
  )
}

export default page
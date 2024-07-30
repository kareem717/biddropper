'use client' // Error components must be Client Components

import { LogoDiv } from '@/components/app/LogoDiv'
import { Icons } from '@/components/Icons'
import { Button, buttonVariants } from '@/components/ui/button'
import redirects from '@/config/redirects'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 justify-center h-screen w-full">
      <Icons.biddropper className='w-40 h-40' />
      <h2 className='text-2xl font-semibold'>Something went wrong!</h2>
      <div className='flex gap-4 w-1/3 max-w-md min-w-[200px]'>
        <Button
          onClick={
            () => reset()
          }
          className='w-full'
        >
          Try again
        </Button>
        <Link href={redirects.home} className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}>
          Go back to home
        </Link>
      </div>
    </div>
  )
}
import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import { buttonVariants } from './ui/button'
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className='sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-16 items-center justify-between border-b border-zinc-200'>
          <Link href='/' className='flex z-40 font-bold text-2xl'>
            <span>Transcripto.</span>
          </Link>

          <div className='hidden items-center space-x-6 sm:flex'>
            <Link
              href='/pricing'
              className={buttonVariants({
                variant: 'ghost',
                size: 'lg',
                className: 'text-lg',
              })}
            >
              Pricing
            </Link>
            <LoginLink
              className={buttonVariants({
                variant: 'ghost',
                size: 'lg',
                className: 'text-lg',
              })}
            >
              Sign in
            </LoginLink>
            <RegisterLink
              className={buttonVariants({
                size: 'lg',
                className: 'text-lg font-semibold',
              })}
            >
              Get started <ArrowRight className='ml-1.5 h-6 w-6' />
            </RegisterLink>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar

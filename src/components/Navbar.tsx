import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import { buttonVariants } from './ui/button'
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const Navbar = async () => {
  const { isAuthenticated } = getKindeServerSession()

  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link
            href='/'
            className='flex items-center font-semibold z-40 gap-2'>
            <Image 
              src="/navbar_logo.png"
              alt="Transcripto Logo"
              width={30}
              height={30}
            />
            <span>Transcripto</span>
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
            
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <Link
                href='/dashboard'
                className={buttonVariants({
                  size: 'lg',
                  className: 'text-lg font-semibold',
                })}
              >
                Dashboard <ArrowRight className='ml-1.5 h-6 w-6' />
              </Link>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar

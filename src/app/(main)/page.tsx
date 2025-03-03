"use client"

import { useState, useEffect } from 'react';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import Link from 'next/link';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'

export default function Home() {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { isAuthenticated } = useKindeAuth()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <MaxWidthWrapper className='mb-6 mt-10 sm:mt-28 flex flex-col items-center justify-center text-center'>
        <div className='mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-10 py-4 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50'>
          <p className='text-base font-semibold text-gray-900'>
            Transcripto is now public!
          </p>
        </div>

        <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
          <span className='text-blue-600'>Transcribe</span> &{' '}
          <span className='text-blue-600'>Translate</span> your content in seconds.
        </h1>
        <p className='mt-5 max-w-prose text-zinc-900 sm:text-lg'>
          Transcripto lets you transcribe, translate, and publish your content in multiple languages, making it easy to create and share blogs with global reach.
        </p>

        {isAuthenticated ? (
          <Link
            className={buttonVariants({
              size: 'lg',
              className: 'mt-5',
            })}
            href='/dashboard'
          >
            Go to Dashboard{' '}
            <ArrowRight className='ml-2 h-5 w-5' />
          </Link>
        ) : (
          <LoginLink
            className={buttonVariants({
              size: 'lg',
              className: 'mt-5',
            })}
          >
            Get started{' '}
            <ArrowRight className='ml-2 h-5 w-5' />
          </LoginLink>
        )}
      </MaxWidthWrapper>

      {/* Value Proposition Section */}
      <div>
        <div className='relative isolate'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
            />
          </div>

          <div>
            <div className='mx-auto max-w-6xl px-6 lg:px-8'>
              <div className='mt-16 flow-root sm:mt-24'>
                <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
                  <Image
                    src='/dashboard-preview.jpg'
                    alt='product preview'
                    width={1364}
                    height={866}
                    quality={100}
                    className='rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className='mx-auto mb-32 mt-32 max-w-5xl sm:mt-56'>
        <div className='mb-12 px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl sm:text-center'>
            <h2 className='mt-2 font-bold text-4xl text-gray-900 sm:text-5xl'>
              Start <span className='text-blue-600'>Transcribing</span> and <span className='text-blue-600'>Translating</span> in Seconds
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              With Transcripto, you can effortlessly transcribe and translate your content in multiple languages, all within seconds.
            </p>
          </div>
        </div>

        {/* Steps */}
        <ol className='my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0'>
          {['Sign up for an account', 'Enter or Upload your txt file', 'Start posting them as Blogs'].map(
            (step, index) => (
              <li key={index} className='md:flex-1'>
                <div className='flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-blue-600'>Step {index + 1}</span>
                  <span className='text-xl font-semibold'>{step}</span>
                  <span className='mt-2 text-zinc-900'>
                    {index === 0
                      ? 'Either starting out with a free plan or choose our ' 
                      : index === 1
                      ? 'We\'ll process your file and transcribe it into various languages'
                      : 'It\'s that simple. Try out Transcripto today - it really takes less than a minute.'}
                  </span>
                </div>
              </li>
            )
          )}
        </ol>

        <div className='mx-auto max-w-6xl px-6 lg:px-8'>
          <div className='mt-16 flow-root sm:mt-24'>
            <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
              <Image
                src='/file-upload-preview.jpg'
                alt='uploading preview'
                width={1419}
                height={732}
                quality={100}
                className='rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10'
              />
            </div>
          </div>
        </div>
      </div>
 

      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          title="Scroll to top"
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all hover:bg-blue-700"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </>
  );
}

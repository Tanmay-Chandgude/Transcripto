"use client"

import { useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

const pricingItems = [
  {
    plan: 'Free',
    tagline: 'For small blogs and personal use.',
    price: 0,
    features: [
      'Up to 5 blogs per month',
      'Basic translation features',
      'Standard support',
      'Community access'
    ]
  },
  {
    plan: 'Pro',
    tagline: 'For professional content creators.',
    price: 15,
    features: [
      'Unlimited blogs',
      'Advanced translation features',
      'Priority support',
      'Analytics dashboard',
      'Custom domain support',
      'API access'
    ]
  },
  {
    plan: 'Enterprise',
    tagline: 'For large organizations.',
    price: 49,
    features: [
      'Everything in Pro',
      'Custom translation models',
      'Dedicated support',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
]

export default function PricingPage() {
  const { isAuthenticated } = useKindeAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <MaxWidthWrapper className="mb-8 mt-24 text-center">
      <div className="mx-auto mb-10 sm:max-w-lg">
        <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
        <p className="mt-5 text-gray-600 sm:text-lg">
          Choose the perfect plan for your content creation needs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {pricingItems.map(({ plan, tagline, price, features }) => {
          return (
            <div
              key={plan}
              className={`relative rounded-2xl bg-white p-8 shadow-lg ${
                plan === 'Pro' ? 'border-2 border-blue-600 scale-105' : ''
              }`}
            >
              {plan === 'Pro' && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                  Popular
                </div>
              )}

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-gray-900">{plan}</h3>
                <p className="mt-2 text-gray-500">{tagline}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">${price}</span>
                  <span className="text-gray-500">/mo</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-blue-600" />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {isAuthenticated ? (
                <Link
                  href={selectedPlan === plan ? '/dashboard' : '#'}
                  onClick={() => setSelectedPlan(plan)}
                  className={buttonVariants({
                    className: 'mt-8 w-full',
                    variant: plan === 'Pro' ? 'default' : 'outline',
                  })}
                >
                  {selectedPlan === plan ? 'Manage Subscription' : 'Get Started'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <LoginLink
                  className={buttonVariants({
                    className: 'mt-8 w-full',
                    variant: plan === 'Pro' ? 'default' : 'outline',
                  })}
                >
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </LoginLink>
              )}
            </div>
          )
        })}
      </div>
    </MaxWidthWrapper>
  )
} 
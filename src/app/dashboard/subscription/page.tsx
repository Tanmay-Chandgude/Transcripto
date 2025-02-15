"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      '5 blogs per month',
      'Basic translations',
      'Standard support',
    ]
  },
  {
    name: 'Pro',
    price: 15,
    features: [
      'Unlimited blogs',
      'Advanced translations',
      'Priority support',
      'Analytics dashboard',
    ]
  },
  {
    name: 'Enterprise',
    price: 49,
    features: [
      'Everything in Pro',
      'Custom translation models',
      'Dedicated support',
      'API access',
    ]
  }
]

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === 'Pro' ? 'border-blue-500 shadow-lg' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal">/mo</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6">
                {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
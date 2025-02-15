"use client"

import { useState } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { PAYPAL_CLIENT_ID, SUBSCRIPTION_PLANS } from '@/lib/paypal'
import { supabase } from '@/lib/supabase'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Button } from './ui/button'

export default function SubscriptionPlan() {
  const { user } = useKindeAuth()
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ENTERPRISE' | null>(null)

  const handleSubscription = async (subscriptionID: string) => {
    if (!user) return

    try {
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        paypal_subscription_id: subscriptionID,
        plan_type: selectedPlan?.toLowerCase(),
        status: 'active'
      })

      await supabase
        .from('profiles')
        .update({
          subscription_tier: selectedPlan?.toLowerCase(),
          subscription_status: 'active'
        })
        .eq('id', user.id)

      return true
    } catch (error) {
      console.error('Error updating subscription:', error)
      return false
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {Object.entries(SUBSCRIPTION_PLANS).map(([plan, details]) => (
        <div
          key={plan}
          className="rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-2xl font-bold">{plan}</h3>
          <p className="mt-2 text-3xl font-bold">${details.price}/month</p>
          <ul className="mt-4 space-y-2">
            {details.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {selectedPlan === plan ? (
              <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
                <PayPalButtons
                  createSubscription={(data, actions) => {
                    return actions.subscription.create({
                      'plan_id': plan === 'PRO' ? 'PRO_PLAN_ID' : 'ENTERPRISE_PLAN_ID' // Replace with actual PayPal plan IDs
                    })
                  }}
                  onApprove={async (data) => {
                    if (data.subscriptionID) {
                      await handleSubscription(data.subscriptionID)
                    }
                  }}
                />
              </PayPalScriptProvider>
            ) : (
              <Button
                onClick={() => setSelectedPlan(plan as 'PRO' | 'ENTERPRISE')}
                className="w-full"
              >
                Select {plan}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 
export type Profile = {
  id: string;
  full_name: string | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Blog = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  description?: string;
  original_language: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

export type Translation = {
  id: string;
  blog_id: string;
  language: string;
  translated_title: string;
  translated_content: string;
  accuracy_score: number;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  paypal_subscription_id: string | null;
  plan_type: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}; 
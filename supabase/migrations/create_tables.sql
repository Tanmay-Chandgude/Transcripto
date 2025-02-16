-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  subscription_tier text default 'free',
  subscription_status text default 'inactive',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role text default 'user',
  email text
);

-- Create blogs table
create table public.blogs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  description text,
  original_language text not null,
  status text default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create translations table
create table public.translations (
  id uuid default uuid_generate_v4() primary key,
  blog_id uuid references public.blogs(id) on delete cascade not null,
  language text not null,
  translated_title text not null,
  translated_content text not null,
  accuracy_score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  paypal_subscription_id text,
  plan_type text not null,
  status text not null,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
); 
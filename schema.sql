-- CivicAssist AI Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  age integer,
  occupation text,
  income integer,
  state text,
  district text,
  education text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Schemes Table
CREATE TABLE IF NOT EXISTS public.schemes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  description text,
  department text,
  state text,
  tags text[],
  benefit text,
  eligibility_criteria jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  scheme_id uuid REFERENCES public.schemes(id),
  status text DEFAULT 'draft',
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  document_type text,
  file_url text,
  extracted_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Optional: Insert a sample scheme so the AI has something to recommend
INSERT INTO public.schemes (name, description, department, state, benefit, eligibility_criteria) 
VALUES (
  'PM Vidyalakshmi Education Loan Scheme',
  'Collateral-free loans up to Rs. 7.5 lakh for higher education students.',
  'Ministry of Education',
  'All',
  'Rs. 7,50,000 Loan',
  '{"occupation": ["Student"], "income_limit": 800000}'
) ON CONFLICT DO NOTHING;

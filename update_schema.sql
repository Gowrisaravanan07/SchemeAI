-- Run this in your Supabase SQL Editor to add the category column to your users table
-- This will fix the database error when registering new citizens.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS category text;

-- Become Platform — Initial Database Schema
-- Migration: 00001_initial_schema
-- Date: 2026-05-29
-- Description: Creates all core tables, RLS policies, indexes, and enables pgvector

-- Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- USER PROFILES
-- =============================================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  fitness_goal TEXT NOT NULL DEFAULT 'improve_mobility'
    CHECK (fitness_goal IN ('lose_fat','build_muscle','improve_mobility','reduce_stress')),
  activity_level TEXT NOT NULL DEFAULT 'moderately_active'
    CHECK (activity_level IN ('sedentary','lightly_active','moderately_active','very_active')),
  dietary_preferences JSONB NOT NULL DEFAULT '[]',
  onboarding_completed_at TIMESTAMPTZ,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

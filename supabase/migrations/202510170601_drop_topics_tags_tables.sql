-- Migration: Drop topics/tags tables and join tables
-- Date: 2025-10-17 06:01 UTC
-- Notes: Safe, idempotent drops using IF EXISTS; explicit schema qualification (public.)

-- 1) Drop dependent constraints and indexes that reference public.challenge_topics
ALTER TABLE public.challenge_topics DROP CONSTRAINT IF EXISTS challenge_topics_challenge_id_fkey;
ALTER TABLE public.challenge_topics DROP CONSTRAINT IF EXISTS challenge_topics_topic_id_fkey;
ALTER TABLE public.challenge_topics DROP CONSTRAINT IF EXISTS challenge_topics_pkey;
DROP INDEX IF EXISTS public.idx_challenge_topics_challenge_id;
DROP INDEX IF EXISTS public.idx_challenge_topics_topic_id;

-- 1) Drop dependent constraints and indexes that reference public.challenge_tags
ALTER TABLE public.challenge_tags DROP CONSTRAINT IF EXISTS challenge_tags_challenge_id_fkey;
ALTER TABLE public.challenge_tags DROP CONSTRAINT IF EXISTS challenge_tags_tag_id_fkey;
ALTER TABLE public.challenge_tags DROP CONSTRAINT IF EXISTS challenge_tags_pkey;
DROP INDEX IF EXISTS public.idx_challenge_tags_challenge_id;
DROP INDEX IF EXISTS public.idx_challenge_tags_tag_id;

-- 1) Drop dependent constraints and indexes on base tables public.topics and public.tags
-- Unique and primary key constraints (with their backing indexes)
ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_name_key;
ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_pkey;
ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_pkey;
-- Potentially created standalone indexes on name columns
DROP INDEX IF EXISTS public.idx_topics_name;
DROP INDEX IF EXISTS public.idx_tags_name;

-- 2) Drop join tables first
DROP TABLE IF EXISTS public.challenge_topics;
DROP TABLE IF EXISTS public.challenge_tags;

-- 2) Then drop base tables
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.tags;
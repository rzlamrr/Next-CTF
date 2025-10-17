-- Migration: Remove topic and tags columns from challenges
-- Date: 2025-10-17 05:33 UTC
-- Notes: Safe drops with IF EXISTS; drop indexes/constraints first, then columns

-- Drop potential indexes on challenges(topic) and challenges(tags)
DROP INDEX IF EXISTS idx_challenges_topic;
DROP INDEX IF EXISTS idx_challenges_tags;
DROP INDEX IF EXISTS idx_challenges_tags_gin;
DROP INDEX IF EXISTS gin_challenges_tags;

-- Drop potential constraints referencing 'topic' or 'tags' on challenges
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_topic_check;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_tags_check;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_topic_fk;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_tags_fk;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_topic_unique;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_tags_unique;

-- No triggers, views, or materialized views reference these columns in initial schema;
-- If any exist, they should be updated separately. Using IF EXISTS keeps this migration safe.

-- Finally, drop the columns from challenges (no-op if absent)
ALTER TABLE challenges DROP COLUMN IF EXISTS topic;
ALTER TABLE challenges DROP COLUMN IF EXISTS tags;
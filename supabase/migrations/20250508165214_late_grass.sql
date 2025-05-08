/*
  # Create property records table

  1. New Tables
    - `property_records`
      - `id` (uuid, primary key)
      - `original_address` (text)
      - `processed_data` (jsonb)
      - `date_processed` (timestamptz)
      - `status` (text)
      - `error_message` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `property_records` table
    - Add policies for authenticated users to:
      - Read their own records
      - Insert their own records
      - Update their own records
*/

CREATE TABLE IF NOT EXISTS property_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_address text NOT NULL,
  processed_data jsonb,
  date_processed timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending', 'processed', 'error')),
  error_message text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own records"
  ON property_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON property_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON property_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
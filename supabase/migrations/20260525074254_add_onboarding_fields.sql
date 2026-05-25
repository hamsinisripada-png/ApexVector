/*
  # Add onboarding fields to profiles

  Adds car_number (text), favorite_driver, and onboarding_complete fields
  that the 3-step onboarding flow will populate.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='car_number') THEN
    ALTER TABLE profiles ADD COLUMN car_number text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='favorite_driver') THEN
    ALTER TABLE profiles ADD COLUMN favorite_driver text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='onboarding_complete') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_complete boolean NOT NULL DEFAULT false;
  END IF;
END $$;

/*
  # Add session summary fields

  Extends telemetry_sessions with aggregated race summary data
  saved when a session ends: best lap, avg speed, max RPM, total laps, tyre wear %.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_sessions' AND column_name='best_lap_time') THEN
    ALTER TABLE telemetry_sessions ADD COLUMN best_lap_time double precision;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_sessions' AND column_name='avg_speed') THEN
    ALTER TABLE telemetry_sessions ADD COLUMN avg_speed double precision DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_sessions' AND column_name='max_rpm') THEN
    ALTER TABLE telemetry_sessions ADD COLUMN max_rpm double precision DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_sessions' AND column_name='total_laps') THEN
    ALTER TABLE telemetry_sessions ADD COLUMN total_laps integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_sessions' AND column_name='tyre_wear_pct') THEN
    ALTER TABLE telemetry_sessions ADD COLUMN tyre_wear_pct double precision DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='telemetry_sessions' AND column_name='duration_seconds') THEN
    ALTER TABLE telemetry_sessions ADD COLUMN duration_seconds integer DEFAULT 0;
  END IF;
END $$;

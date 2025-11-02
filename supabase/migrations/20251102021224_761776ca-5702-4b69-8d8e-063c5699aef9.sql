-- Drop and recreate the view with security_invoker = true
-- This ensures the view executes with the permissions of the querying user
DROP VIEW IF EXISTS public.v_interval_hourly_city;

CREATE VIEW public.v_interval_hourly_city
WITH (security_invoker = true)
AS
SELECT 
  date_trunc('hour'::text, ir.ts) AS hour,
  gn.tenant_id AS city_tenant_id,
  avg(ir.kw) AS avg_kw,
  sum(ir.kwh) AS total_kwh,
  avg(ir.voltage_v) AS avg_voltage_v,
  count(DISTINCT ir.meter_id) AS meter_count
FROM interval_readings ir
JOIN meters m ON m.id = ir.meter_id
JOIN grid_nodes gn ON gn.id = m.service_point_id
GROUP BY date_trunc('hour'::text, ir.ts), gn.tenant_id
HAVING count(DISTINCT ir.meter_id) >= 30;
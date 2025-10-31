-- Create new enums for Infinity Force
CREATE TYPE public.asset_type AS ENUM (
  'pm_generator', 'inverter', 'battery', 'evse', 'rose_panel', 
  'pmu', 'relay', 'meter', 'transformer', 'feeder', 'substation', 
  'rtu', 'recloser', 'edge_gateway'
);

CREATE TYPE public.asset_status AS ENUM ('planned', 'installed', 'active', 'inactive', 'retired');
CREATE TYPE public.operating_mode AS ENUM ('SIM', 'FIELD');
CREATE TYPE public.node_type AS ENUM ('substation', 'feeder', 'transformer', 'service_point', 'microgrid', 'dc_bus');
CREATE TYPE public.der_tech AS ENUM ('pm_gen', 'pv', 'battery', 'ev', 'rose', 'microturbine');
CREATE TYPE public.event_severity AS ENUM ('info', 'warning', 'critical', 'emergency');
CREATE TYPE public.command_type AS ENUM ('set_power', 'set_pf', 'set_var_curve', 'open', 'close', 'arm_island', 'disarm_island', 'price_signal', 'charge', 'discharge', 'workload_cap');
CREATE TYPE public.command_status AS ENUM ('pending', 'applied', 'failed');
CREATE TYPE public.switch_action AS ENUM ('open', 'close');
CREATE TYPE public.forecast_scope AS ENUM ('feeder', 'substation', 'city');
CREATE TYPE public.forecast_horizon AS ENUM ('15min', 'day', 'week', 'year', '10year');
CREATE TYPE public.tariff_type AS ENUM ('flat', 'tou', 'rtp', 'demand');
CREATE TYPE public.dr_program_type AS ENUM ('capacity', 'energy', 'fast_reg', 'volt_var');
CREATE TYPE public.resource_type AS ENUM ('der', 'flex_load', 'ev', 'rose');
CREATE TYPE public.privacy_level AS ENUM ('agg', 'dp');
CREATE TYPE public.test_verdict AS ENUM ('pass', 'fail', 'inconclusive', 'transcendent');
CREATE TYPE public.calc_method AS ENUM ('true_power', 'ohmic_estimate');
CREATE TYPE public.ev_direction AS ENUM ('charge', 'discharge');
CREATE TYPE public.workload_class AS ENUM ('render', 'ml', 'edge', 'archive');
CREATE TYPE public.compliance_standard AS ENUM ('IEEE1547', 'UL1741SB', 'IEEE2030_5', 'ANSI_C12', 'IEEE519', 'NERC_CIP', 'FICTIONAL_IFX');
CREATE TYPE public.city_climate AS ENUM ('hot', 'temperate', 'cold', 'tropical');

-- Core schema tables
CREATE TABLE public.grid_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type node_type NOT NULL,
  parent_id UUID REFERENCES public.grid_nodes(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  lat NUMERIC,
  lon NUMERIC,
  tenant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_grid_nodes_tenant ON public.grid_nodes(tenant_id);
CREATE INDEX idx_grid_nodes_parent ON public.grid_nodes(parent_id);
CREATE INDEX idx_grid_nodes_location ON public.grid_nodes(lat, lon);

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type asset_type NOT NULL,
  make TEXT,
  model TEXT,
  firmware TEXT,
  serial TEXT,
  nameplate_kw NUMERIC,
  nameplate_kvar NUMERIC,
  voltage_class TEXT,
  owner_tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  grid_node_id UUID REFERENCES public.grid_nodes(id),
  location_geo JSONB,
  status asset_status NOT NULL DEFAULT 'planned',
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assets_tenant ON public.assets(owner_tenant_id);
CREATE INDEX idx_assets_node ON public.assets(grid_node_id);
CREATE INDEX idx_assets_type ON public.assets(asset_type);
CREATE INDEX idx_assets_status ON public.assets(status);

CREATE TABLE public.meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_point_id UUID REFERENCES public.grid_nodes(id) NOT NULL,
  interval_secs INTEGER NOT NULL DEFAULT 900,
  firmware TEXT,
  comms_path TEXT,
  revenue_grade BOOLEAN DEFAULT false,
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meters_service_point ON public.meters(service_point_id);

CREATE TABLE public.interval_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID REFERENCES public.meters(id) NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  kwh NUMERIC,
  kw NUMERIC,
  kvar NUMERIC,
  pf NUMERIC,
  voltage_v NUMERIC,
  current_a NUMERIC,
  thd_pct NUMERIC,
  freq_hz NUMERIC,
  quality_flag TEXT,
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interval_readings_meter_ts ON public.interval_readings(meter_id, ts DESC);
CREATE INDEX idx_interval_readings_ts ON public.interval_readings(ts DESC);

CREATE TABLE public.pmu_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.grid_nodes(id) NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  freq_hz NUMERIC,
  rocof_hz_s NUMERIC,
  v_phasor_json JSONB,
  i_phasor_json JSONB,
  angle_deg NUMERIC,
  quality_flag TEXT,
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pmu_streams_node_ts ON public.pmu_streams(node_id, ts DESC);
CREATE INDEX idx_pmu_streams_ts ON public.pmu_streams(ts DESC);

CREATE TABLE public.der_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.grid_nodes(id) NOT NULL,
  tech der_tech NOT NULL,
  nameplate_kw NUMERIC NOT NULL,
  interconnection_status TEXT,
  telemetry_topic TEXT,
  control_profile_json JSONB DEFAULT '{}',
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_der_devices_site ON public.der_devices(site_id);
CREATE INDEX idx_der_devices_tech ON public.der_devices(tech);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  node_id UUID REFERENCES public.grid_nodes(id),
  asset_id UUID REFERENCES public.assets(id),
  event_type TEXT NOT NULL,
  severity event_severity NOT NULL DEFAULT 'info',
  payload_json JSONB DEFAULT '{}',
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_ts TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_ts ON public.events(ts DESC);
CREATE INDEX idx_events_severity ON public.events(severity);
CREATE INDEX idx_events_node ON public.events(node_id);

-- Ops tables
CREATE TABLE public.commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_asset_id UUID REFERENCES public.assets(id) NOT NULL,
  cmd_type command_type NOT NULL,
  payload_json JSONB DEFAULT '{}',
  status command_status NOT NULL DEFAULT 'pending',
  applied_ts TIMESTAMPTZ,
  corr_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commands_asset ON public.commands(target_asset_id);
CREATE INDEX idx_commands_status ON public.commands(status);

CREATE TABLE public.topology_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  feeder_id UUID REFERENCES public.grid_nodes(id) NOT NULL,
  action switch_action NOT NULL,
  device_asset_id UUID REFERENCES public.assets(id),
  reason TEXT,
  operator_id UUID REFERENCES auth.users(id),
  auto BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topology_switches_feeder ON public.topology_switches(feeder_id);

CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope forecast_scope NOT NULL,
  horizon forecast_horizon NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_forecasts_scope_horizon ON public.forecasts(scope, horizon);

-- Market tables
CREATE TABLE public.tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tariff_type tariff_type NOT NULL,
  name TEXT NOT NULL,
  rules_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dr_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  program_type dr_program_type NOT NULL,
  min_kw NUMERIC,
  response_time_s INTEGER,
  telemetry_req_json JSONB DEFAULT '{}',
  compensation_rules_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  site_id UUID REFERENCES public.grid_nodes(id),
  program_id UUID REFERENCES public.dr_programs(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  consent_ts TIMESTAMPTZ,
  meter_id UUID REFERENCES public.meters(id),
  telemetry_topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enrollments_customer ON public.enrollments(customer_id);
CREATE INDEX idx_enrollments_program ON public.enrollments(program_id);

CREATE TABLE public.offers_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  market_window TIMESTAMPTZ NOT NULL,
  resource_id UUID NOT NULL,
  resource_type resource_type NOT NULL,
  location_node_id UUID REFERENCES public.grid_nodes(id),
  qty_kw NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_offers_bids_window ON public.offers_bids(market_window);
CREATE INDEX idx_offers_bids_resource ON public.offers_bids(resource_id);

CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_window TIMESTAMPTZ NOT NULL,
  resource_id UUID NOT NULL,
  qty_kwh NUMERIC NOT NULL,
  clearing_price NUMERIC NOT NULL,
  credits NUMERIC NOT NULL,
  adjustments_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settlements_window ON public.settlements(settlement_window);
CREATE INDEX idx_settlements_resource ON public.settlements(resource_id);

-- Privacy tables
CREATE TABLE public.data_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT,
  schema_json JSONB DEFAULT '{}',
  sampling TEXT,
  privacy_level privacy_level NOT NULL DEFAULT 'agg',
  license_terms TEXT,
  revenue_share_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id UUID REFERENCES public.data_products(id) NOT NULL,
  scope_json JSONB DEFAULT '{}',
  expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_grants_tenant ON public.access_grants(tenant_id);
CREATE INDEX idx_access_grants_product ON public.access_grants(product_id);

-- Labs tables
CREATE TABLE public.test_stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  calibration_date DATE,
  torque_sensor_model TEXT,
  torque_cert_url TEXT,
  power_analyzer_model TEXT,
  scope_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.generator_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_stand_id UUID REFERENCES public.test_stands(id) NOT NULL,
  asset_id UUID REFERENCES public.assets(id),
  operator_id UUID REFERENCES auth.users(id) NOT NULL,
  ts_start TIMESTAMPTZ NOT NULL,
  ts_end TIMESTAMPTZ,
  ambient_c NUMERIC,
  notes TEXT,
  result_json JSONB DEFAULT '{}',
  verdict test_verdict,
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generator_tests_stand ON public.generator_tests(test_stand_id);
CREATE INDEX idx_generator_tests_asset ON public.generator_tests(asset_id);

CREATE TABLE public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.generator_tests(id) NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  rpm NUMERIC,
  torque_nm NUMERIC,
  input_mech_w NUMERIC,
  v_rms NUMERIC,
  i_rms NUMERIC,
  pf NUMERIC,
  p_out_w NUMERIC,
  thd_pct NUMERIC,
  calc_method calc_method NOT NULL,
  instrument_config_json JSONB DEFAULT '{}',
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_measurements_test_ts ON public.measurements(test_id, ts);

-- EV tables
CREATE TABLE public.ev_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_asset_id UUID REFERENCES public.assets(id) NOT NULL,
  vehicle_hash TEXT NOT NULL,
  site_id UUID REFERENCES public.grid_nodes(id),
  ts_start TIMESTAMPTZ NOT NULL,
  ts_end TIMESTAMPTZ,
  kwh NUMERIC,
  direction ev_direction NOT NULL DEFAULT 'charge',
  price NUMERIC,
  soc_start NUMERIC,
  soc_end NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ev_sessions_charger ON public.ev_sessions(charger_asset_id);
CREATE INDEX idx_ev_sessions_site ON public.ev_sessions(site_id);

-- ROSE tables
CREATE TABLE public.rose_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.grid_nodes(id) NOT NULL,
  power_cap_w NUMERIC NOT NULL,
  thermal_kw NUMERIC,
  workload_class workload_class NOT NULL,
  api_endpoint TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  mode operating_mode NOT NULL DEFAULT 'SIM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rose_panels_site ON public.rose_panels(site_id);

-- Compliance tables
CREATE TABLE public.compliance_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) NOT NULL,
  standard compliance_standard NOT NULL,
  doc_url TEXT,
  issue_date DATE,
  expiry DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_artifacts_asset ON public.compliance_artifacts(asset_id);
CREATE INDEX idx_compliance_artifacts_expiry ON public.compliance_artifacts(expiry);

-- Sim tables
CREATE TABLE public.city_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  climate city_climate NOT NULL,
  pop_millions NUMERIC,
  ev_penetration_pct NUMERIC,
  solar_w_per_capita NUMERIC,
  base_peak_mw NUMERIC,
  narrative TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.city_profiles(id) NOT NULL,
  name TEXT NOT NULL,
  start_ts TIMESTAMPTZ NOT NULL,
  duration_h INTEGER NOT NULL,
  weather_seed INTEGER,
  outage_pattern JSONB DEFAULT '{}',
  price_model JSONB DEFAULT '{}',
  pm_overunity_factor NUMERIC DEFAULT 1.00,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scenarios_city ON public.scenarios(city_id);

-- Audit table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  diff_json JSONB DEFAULT '{}',
  signature TEXT
);

CREATE INDEX idx_audit_logs_ts ON public.audit_logs(ts DESC);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);

-- Enable RLS on all tables
ALTER TABLE public.grid_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interval_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.der_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topology_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dr_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generator_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ev_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rose_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (tenant isolation)
CREATE POLICY "Users can view their tenant grid nodes" ON public.grid_nodes FOR SELECT USING (auth.uid() = tenant_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can manage their tenant grid nodes" ON public.grid_nodes FOR ALL USING (auth.uid() = tenant_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their tenant assets" ON public.assets FOR SELECT USING (auth.uid() = owner_tenant_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can manage their tenant assets" ON public.assets FOR ALL USING (auth.uid() = owner_tenant_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view meters" ON public.meters FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.grid_nodes WHERE grid_nodes.id = meters.service_point_id AND (grid_nodes.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);

CREATE POLICY "Users can view interval readings" ON public.interval_readings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.meters 
    JOIN public.grid_nodes ON grid_nodes.id = meters.service_point_id 
    WHERE meters.id = interval_readings.meter_id AND (grid_nodes.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can view PMU streams" ON public.pmu_streams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.grid_nodes WHERE grid_nodes.id = pmu_streams.node_id AND (grid_nodes.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);

CREATE POLICY "Users can view DER devices" ON public.der_devices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.grid_nodes WHERE grid_nodes.id = der_devices.site_id AND (grid_nodes.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);

CREATE POLICY "Users can view events" ON public.events FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'utility_ops'::app_role));

CREATE POLICY "Users can view commands" ON public.commands FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'dispatcher'::app_role));
CREATE POLICY "Dispatchers can create commands" ON public.commands FOR INSERT WITH CHECK (has_role(auth.uid(), 'dispatcher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view tariffs" ON public.tariffs FOR SELECT USING (true);
CREATE POLICY "Anyone can view DR programs" ON public.dr_programs FOR SELECT USING (true);

CREATE POLICY "Users can manage their enrollments" ON public.enrollments FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Anyone can view data products" ON public.data_products FOR SELECT USING (true);
CREATE POLICY "Users can view their access grants" ON public.access_grants FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Anyone can view test stands" ON public.test_stands FOR SELECT USING (true);
CREATE POLICY "Operators can view generator tests" ON public.generator_tests FOR SELECT USING (auth.uid() = operator_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Operators can create generator tests" ON public.generator_tests FOR INSERT WITH CHECK (auth.uid() = operator_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view city profiles" ON public.city_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view scenarios" ON public.scenarios FOR SELECT USING (true);

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create view for privacy-preserving aggregated data
CREATE OR REPLACE VIEW public.v_interval_hourly_city AS
SELECT 
  DATE_TRUNC('hour', ir.ts) as hour,
  gn.tenant_id as city_tenant_id,
  AVG(ir.kw) as avg_kw,
  SUM(ir.kwh) as total_kwh,
  AVG(ir.voltage_v) as avg_voltage_v,
  COUNT(DISTINCT ir.meter_id) as meter_count
FROM public.interval_readings ir
JOIN public.meters m ON m.id = ir.meter_id
JOIN public.grid_nodes gn ON gn.id = m.service_point_id
GROUP BY DATE_TRUNC('hour', ir.ts), gn.tenant_id
HAVING COUNT(DISTINCT ir.meter_id) >= 30;
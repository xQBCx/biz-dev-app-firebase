CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user',
    'partner',
    'staff'
);


--
-- Name: campaign_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.campaign_type AS ENUM (
    'email',
    'sms',
    'direct_mail',
    'phone',
    'social_media',
    'google_ads'
);


--
-- Name: content_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_type AS ENUM (
    'social_post',
    'email_template',
    'ad_copy',
    'direct_mail',
    'sms_template'
);


--
-- Name: lead_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lead_status AS ENUM (
    'new',
    'contacted',
    'interested',
    'negotiating',
    'converted',
    'declined'
);


--
-- Name: lead_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lead_type AS ENUM (
    'office_building',
    'golf_course',
    'high_income_neighborhood',
    'dealership_small',
    'dealership_luxury',
    'fleet_company'
);


--
-- Name: get_user_business_role(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_business_role(_user_id uuid, _business_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.business_members
  WHERE user_id = _user_id
    AND business_id = _business_id
  LIMIT 1
$$;


--
-- Name: get_user_businesses(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_businesses(_user_id uuid) RETURNS TABLE(business_id uuid, role public.app_role)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT business_id, role
  FROM public.business_members
  WHERE user_id = _user_id
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.email
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_customer_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_customer_rating() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Update the rated user's average rating
  UPDATE public.profiles
  SET customer_rating = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
      AND rating_type = 'customer_rating'
  )
  WHERE id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: user_belongs_to_business(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_belongs_to_business(_user_id uuid, _business_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE user_id = _user_id
      AND business_id = _business_id
  )
$$;


SET default_table_access_method = heap;

--
-- Name: availability_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    specific_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    is_available boolean DEFAULT false NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    service_type text NOT NULL,
    vehicle_info text,
    preferred_date date NOT NULL,
    preferred_time text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    zip_code text NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reminder_sent boolean DEFAULT false,
    business_id uuid,
    assigned_staff_id uuid,
    latitude numeric(10,8),
    longitude numeric(11,8),
    cancellation_hours integer,
    cancellation_refund_percent integer,
    cancellation_partial_hours integer,
    cancellation_partial_refund_percent integer,
    payment_status text DEFAULT 'pending'::text,
    payment_intent_id text,
    cancelled_at timestamp with time zone,
    refund_amount numeric,
    refund_status text,
    vehicle_type text,
    vehicle_condition text,
    ai_recommendations jsonb DEFAULT '[]'::jsonb,
    estimated_duration_minutes integer,
    selected_add_ons jsonb DEFAULT '[]'::jsonb
);


--
-- Name: business_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT business_availability_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: business_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: business_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_pricing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    service_type text NOT NULL,
    service_label text NOT NULL,
    price integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    business_name text NOT NULL,
    business_email text NOT NULL,
    business_phone text,
    address text,
    city text,
    zip_code text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cancellation_hours integer DEFAULT 24,
    cancellation_refund_percent integer DEFAULT 100,
    cancellation_partial_hours integer DEFAULT 24,
    cancellation_partial_refund_percent integer DEFAULT 50
);


--
-- Name: job_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    uploaded_by uuid NOT NULL,
    image_url text NOT NULL,
    image_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_photos_image_type_check CHECK ((image_type = ANY (ARRAY['before'::text, 'after'::text])))
);


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    campaign_type public.campaign_type NOT NULL,
    target_lead_types public.lead_type[] DEFAULT '{}'::public.lead_type[] NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    start_date date,
    end_date date,
    budget numeric(10,2),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: marketing_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content_type public.content_type NOT NULL,
    content text NOT NULL,
    target_audience public.lead_type[],
    platforms text[] DEFAULT '{}'::text[],
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_for timestamp with time zone,
    published_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: marketing_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_type public.lead_type NOT NULL,
    business_name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    address text,
    city text DEFAULT 'Houston'::text,
    county text DEFAULT 'Harris'::text,
    state text DEFAULT 'TX'::text,
    zip_code text,
    estimated_income integer,
    fleet_size integer,
    notes text,
    status public.lead_status DEFAULT 'new'::public.lead_status NOT NULL,
    source text,
    assigned_to uuid,
    last_contacted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_sequence_id uuid,
    sequence_step integer DEFAULT 0,
    next_outreach_date timestamp with time zone
);


--
-- Name: outreach_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outreach_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid,
    campaign_id uuid,
    outreach_type public.campaign_type NOT NULL,
    subject text,
    message text,
    status text DEFAULT 'sent'::text NOT NULL,
    response text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    responded_at timestamp with time zone,
    sent_by uuid
);


--
-- Name: outreach_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outreach_sequences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    target_lead_types public.lead_type[] DEFAULT '{}'::public.lead_type[],
    steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: partner_earnings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_earnings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    total_earned numeric DEFAULT 0 NOT NULL,
    available_balance numeric DEFAULT 0 NOT NULL,
    pending_balance numeric DEFAULT 0 NOT NULL,
    total_withdrawn numeric DEFAULT 0 NOT NULL,
    last_payout_date timestamp with time zone,
    stripe_account_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    phone text,
    avatar_url text,
    customer_rating numeric(3,2) DEFAULT 5.0,
    total_bookings integer DEFAULT 0,
    payment_methods jsonb DEFAULT '[]'::jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    phone_number text,
    CONSTRAINT profiles_customer_rating_check CHECK (((customer_rating >= (0)::numeric) AND (customer_rating <= (5)::numeric)))
);


--
-- Name: rating_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rating_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rating_id uuid NOT NULL,
    responder_id uuid NOT NULL,
    response_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    rater_id uuid NOT NULL,
    rated_user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    rating_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    featured boolean DEFAULT false,
    CONSTRAINT ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT ratings_rating_type_check CHECK ((rating_type = ANY (ARRAY['service_rating'::text, 'customer_rating'::text])))
);


--
-- Name: seo_keywords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seo_keywords (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    search_volume integer,
    difficulty integer,
    current_rank integer,
    target_rank integer,
    page_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    account_name text NOT NULL,
    account_id text,
    access_token text,
    refresh_token text,
    connected_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true
);


--
-- Name: social_engagement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_engagement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid,
    platform text NOT NULL,
    post_id text,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    partner_business_id uuid NOT NULL,
    amount numeric NOT NULL,
    stripe_payment_intent_id text,
    transaction_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    stripe_fee numeric DEFAULT 0,
    net_amount numeric NOT NULL,
    processed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['payment'::text, 'refund'::text, 'payout'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: availability_overrides availability_overrides_business_id_specific_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_overrides
    ADD CONSTRAINT availability_overrides_business_id_specific_date_key UNIQUE (business_id, specific_date);


--
-- Name: availability_overrides availability_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_overrides
    ADD CONSTRAINT availability_overrides_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: business_availability business_availability_business_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_availability
    ADD CONSTRAINT business_availability_business_id_day_of_week_key UNIQUE (business_id, day_of_week);


--
-- Name: business_availability business_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_availability
    ADD CONSTRAINT business_availability_pkey PRIMARY KEY (id);


--
-- Name: business_members business_members_business_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_members
    ADD CONSTRAINT business_members_business_id_user_id_key UNIQUE (business_id, user_id);


--
-- Name: business_members business_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_members
    ADD CONSTRAINT business_members_pkey PRIMARY KEY (id);


--
-- Name: business_pricing business_pricing_business_id_service_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_pricing
    ADD CONSTRAINT business_pricing_business_id_service_type_key UNIQUE (business_id, service_type);


--
-- Name: business_pricing business_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_pricing
    ADD CONSTRAINT business_pricing_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_business_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_business_email_key UNIQUE (business_email);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: job_photos job_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: marketing_content marketing_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_pkey PRIMARY KEY (id);


--
-- Name: marketing_leads marketing_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_leads
    ADD CONSTRAINT marketing_leads_pkey PRIMARY KEY (id);


--
-- Name: outreach_history outreach_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outreach_history
    ADD CONSTRAINT outreach_history_pkey PRIMARY KEY (id);


--
-- Name: outreach_sequences outreach_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outreach_sequences
    ADD CONSTRAINT outreach_sequences_pkey PRIMARY KEY (id);


--
-- Name: partner_earnings partner_earnings_business_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_earnings
    ADD CONSTRAINT partner_earnings_business_id_key UNIQUE (business_id);


--
-- Name: partner_earnings partner_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_earnings
    ADD CONSTRAINT partner_earnings_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: rating_responses rating_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating_responses
    ADD CONSTRAINT rating_responses_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_booking_id_rater_id_rating_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_booking_id_rater_id_rating_type_key UNIQUE (booking_id, rater_id, rating_type);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: seo_keywords seo_keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_keywords
    ADD CONSTRAINT seo_keywords_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_engagement social_engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_engagement
    ADD CONSTRAINT social_engagement_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_bookings_vehicle_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_vehicle_type ON public.bookings USING btree (vehicle_type);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_profiles_phone_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_phone_number ON public.profiles USING btree (phone_number);


--
-- Name: ratings on_rating_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_rating_created AFTER INSERT ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_customer_rating();


--
-- Name: availability_overrides update_availability_overrides_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_availability_overrides_updated_at BEFORE UPDATE ON public.availability_overrides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_availability update_business_availability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_availability_updated_at BEFORE UPDATE ON public.business_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_pricing update_business_pricing_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_pricing_updated_at BEFORE UPDATE ON public.business_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: businesses update_businesses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: knowledge_base update_knowledge_base_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_campaigns update_marketing_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_content update_marketing_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_content_updated_at BEFORE UPDATE ON public.marketing_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_leads update_marketing_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_leads_updated_at BEFORE UPDATE ON public.marketing_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: outreach_sequences update_outreach_sequences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_outreach_sequences_updated_at BEFORE UPDATE ON public.outreach_sequences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partner_earnings update_partner_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_partner_earnings_updated_at BEFORE UPDATE ON public.partner_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seo_keywords update_seo_keywords_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_seo_keywords_updated_at BEFORE UPDATE ON public.seo_keywords FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: availability_overrides availability_overrides_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_overrides
    ADD CONSTRAINT availability_overrides_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_assigned_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: business_availability business_availability_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_availability
    ADD CONSTRAINT business_availability_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_members business_members_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_members
    ADD CONSTRAINT business_members_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: business_members business_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_members
    ADD CONSTRAINT business_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: business_pricing business_pricing_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_pricing
    ADD CONSTRAINT business_pricing_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: businesses businesses_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: job_photos job_photos_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: job_photos job_photos_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: marketing_campaigns marketing_campaigns_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: marketing_content marketing_content_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: marketing_leads marketing_leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_leads
    ADD CONSTRAINT marketing_leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: marketing_leads marketing_leads_current_sequence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_leads
    ADD CONSTRAINT marketing_leads_current_sequence_id_fkey FOREIGN KEY (current_sequence_id) REFERENCES public.outreach_sequences(id);


--
-- Name: outreach_history outreach_history_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outreach_history
    ADD CONSTRAINT outreach_history_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL;


--
-- Name: outreach_history outreach_history_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outreach_history
    ADD CONSTRAINT outreach_history_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.marketing_leads(id) ON DELETE CASCADE;


--
-- Name: outreach_history outreach_history_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outreach_history
    ADD CONSTRAINT outreach_history_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES auth.users(id);


--
-- Name: partner_earnings partner_earnings_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_earnings
    ADD CONSTRAINT partner_earnings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: rating_responses rating_responses_rating_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating_responses
    ADD CONSTRAINT rating_responses_rating_id_fkey FOREIGN KEY (rating_id) REFERENCES public.ratings(id) ON DELETE CASCADE;


--
-- Name: rating_responses rating_responses_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating_responses
    ADD CONSTRAINT rating_responses_responder_id_fkey FOREIGN KEY (responder_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_rated_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_rated_user_id_fkey FOREIGN KEY (rated_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_rater_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_rater_id_fkey FOREIGN KEY (rater_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: social_engagement social_engagement_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_engagement
    ADD CONSTRAINT social_engagement_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.marketing_content(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_partner_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_partner_business_id_fkey FOREIGN KEY (partner_business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: businesses Admins can create businesses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create businesses" ON public.businesses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ratings Admins can create ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create ratings" ON public.ratings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: rating_responses Admins can create responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create responses" ON public.rating_responses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins can delete bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_availability Admins can manage all availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all availability" ON public.business_availability USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_members Admins can manage all business members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all business members" ON public.business_members USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: partner_earnings Admins can manage all earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all earnings" ON public.partner_earnings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: availability_overrides Admins can manage all overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all overrides" ON public.availability_overrides USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_pricing Admins can manage all pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all pricing" ON public.business_pricing USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: marketing_campaigns Admins can manage campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage campaigns" ON public.marketing_campaigns USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: marketing_content Admins can manage content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage content" ON public.marketing_content USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: knowledge_base Admins can manage knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: marketing_leads Admins can manage leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage leads" ON public.marketing_leads USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: outreach_history Admins can manage outreach; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage outreach" ON public.outreach_history USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: outreach_sequences Admins can manage outreach sequences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage outreach sequences" ON public.outreach_sequences USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seo_keywords Admins can manage seo keywords; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage seo keywords" ON public.seo_keywords USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: social_accounts Admins can manage social accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage social accounts" ON public.social_accounts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: social_engagement Admins can manage social engagement; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage social engagement" ON public.social_engagement USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins can update all bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: businesses Admins can update all businesses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all businesses" ON public.businesses FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_photos Admins can upload job photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can upload job photos" ON public.job_photos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins can view all bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: business_members Admins can view all business members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all business members" ON public.business_members FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: businesses Admins can view all businesses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all businesses" ON public.businesses FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: job_photos Admins can view all job photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all job photos" ON public.job_photos FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ratings Admins can view all ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all ratings" ON public.ratings FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: rating_responses Admins can view all responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all responses" ON public.rating_responses FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: transactions Admins can view all transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: knowledge_base Anyone can read active knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read active knowledge base" ON public.knowledge_base FOR SELECT USING ((is_active = true));


--
-- Name: business_availability Anyone can view availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view availability" ON public.business_availability FOR SELECT USING (true);


--
-- Name: availability_overrides Anyone can view availability overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view availability overrides" ON public.availability_overrides FOR SELECT USING (true);


--
-- Name: ratings Anyone can view featured ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view featured ratings" ON public.ratings FOR SELECT USING ((featured = true));


--
-- Name: business_pricing Anyone can view pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view pricing" ON public.business_pricing FOR SELECT USING (true);


--
-- Name: bookings Authenticated users can create their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create their bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: job_photos Business members can upload job photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Business members can upload job photos" ON public.job_photos FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (public.bookings b
     JOIN public.business_members bm ON ((b.business_id = bm.business_id)))
  WHERE ((b.id = job_photos.booking_id) AND (bm.user_id = auth.uid()))))));


--
-- Name: businesses Business owners and partners can update their business; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Business owners and partners can update their business" ON public.businesses FOR UPDATE USING (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.business_members
  WHERE ((business_members.business_id = businesses.id) AND (business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role))))));


--
-- Name: job_photos Customers can upload photos for their bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can upload photos for their bookings" ON public.job_photos FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.bookings
  WHERE ((bookings.id = job_photos.booking_id) AND (bookings.user_id = auth.uid()))))));


--
-- Name: bookings Customers can view their own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can view their own bookings" ON public.bookings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: bookings Guest users can create bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Guest users can create bookings" ON public.bookings FOR INSERT TO anon WITH CHECK ((user_id IS NULL));


--
-- Name: businesses Partners can create their own business; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can create their own business" ON public.businesses FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: business_members Partners can delete their business members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can delete their business members" ON public.business_members FOR DELETE USING ((public.get_user_business_role(auth.uid(), business_id) = 'partner'::public.app_role));


--
-- Name: business_pricing Partners can delete their business pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can delete their business pricing" ON public.business_pricing FOR DELETE USING ((public.user_belongs_to_business(auth.uid(), business_id) AND (public.get_user_business_role(auth.uid(), business_id) = 'partner'::public.app_role)));


--
-- Name: partner_earnings Partners can insert their business earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can insert their business earnings" ON public.partner_earnings FOR INSERT WITH CHECK ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: business_availability Partners can manage their business availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can manage their business availability" ON public.business_availability USING ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: availability_overrides Partners can manage their business overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can manage their business overrides" ON public.availability_overrides USING ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: business_pricing Partners can manage their business pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can manage their business pricing" ON public.business_pricing FOR INSERT WITH CHECK ((public.user_belongs_to_business(auth.uid(), business_id) AND (public.get_user_business_role(auth.uid(), business_id) = 'partner'::public.app_role)));


--
-- Name: bookings Partners can update their business bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can update their business bookings" ON public.bookings FOR UPDATE USING ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: partner_earnings Partners can update their business earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can update their business earnings" ON public.partner_earnings FOR UPDATE USING ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: business_members Partners can update their business members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can update their business members" ON public.business_members FOR UPDATE USING ((public.get_user_business_role(auth.uid(), business_id) = 'partner'::public.app_role));


--
-- Name: business_pricing Partners can update their business pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can update their business pricing" ON public.business_pricing FOR UPDATE USING ((public.user_belongs_to_business(auth.uid(), business_id) AND (public.get_user_business_role(auth.uid(), business_id) = 'partner'::public.app_role)));


--
-- Name: business_members Partners can view members of their business; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can view members of their business" ON public.business_members FOR SELECT USING ((public.user_belongs_to_business(auth.uid(), business_id) OR (user_id = auth.uid())));


--
-- Name: bookings Partners can view their business bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can view their business bookings" ON public.bookings FOR SELECT USING ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: partner_earnings Partners can view their business earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can view their business earnings" ON public.partner_earnings FOR SELECT USING ((business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: transactions Partners can view their business transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can view their business transactions" ON public.transactions FOR SELECT USING ((partner_business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'partner'::public.app_role)))));


--
-- Name: businesses Partners can view their own business; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners can view their own business" ON public.businesses FOR SELECT USING (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.business_members
  WHERE ((business_members.business_id = businesses.id) AND (business_members.user_id = auth.uid()))))));


--
-- Name: transactions Service role can insert transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert transactions" ON public.transactions FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: bookings Staff can update assigned bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can update assigned bookings" ON public.bookings FOR UPDATE USING ((assigned_staff_id = auth.uid()));


--
-- Name: bookings Staff can view their assigned bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view their assigned bookings" ON public.bookings FOR SELECT USING (((assigned_staff_id = auth.uid()) OR (business_id IN ( SELECT business_members.business_id
   FROM public.business_members
  WHERE ((business_members.user_id = auth.uid()) AND (business_members.role = 'staff'::public.app_role))))));


--
-- Name: business_members Users can add themselves or partners can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add themselves or partners can add members" ON public.business_members FOR INSERT WITH CHECK (((user_id = auth.uid()) OR (public.get_user_business_role(auth.uid(), business_id) = 'partner'::public.app_role)));


--
-- Name: ratings Users can create ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create ratings" ON public.ratings FOR INSERT WITH CHECK ((auth.uid() = rater_id));


--
-- Name: rating_responses Users can create responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create responses" ON public.rating_responses FOR INSERT WITH CHECK (((auth.uid() = responder_id) AND (EXISTS ( SELECT 1
   FROM public.ratings
  WHERE ((ratings.id = rating_responses.rating_id) AND ((ratings.rater_id = auth.uid()) OR (ratings.rated_user_id = auth.uid())))))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: rating_responses Users can view responses to their ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view responses to their ratings" ON public.rating_responses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.ratings
  WHERE ((ratings.id = rating_responses.rating_id) AND ((ratings.rater_id = auth.uid()) OR (ratings.rated_user_id = auth.uid()))))));


--
-- Name: job_photos Users can view their booking photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their booking photos" ON public.job_photos FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.bookings
  WHERE ((bookings.id = job_photos.booking_id) AND (bookings.user_id = auth.uid())))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ratings Users can view their ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their ratings" ON public.ratings FOR SELECT USING (((auth.uid() = rater_id) OR (auth.uid() = rated_user_id)));


--
-- Name: availability_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: business_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: business_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

--
-- Name: business_pricing; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_pricing ENABLE ROW LEVEL SECURITY;

--
-- Name: businesses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

--
-- Name: job_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

--
-- Name: outreach_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.outreach_history ENABLE ROW LEVEL SECURITY;

--
-- Name: outreach_sequences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.outreach_sequences ENABLE ROW LEVEL SECURITY;

--
-- Name: partner_earnings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_earnings ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: rating_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rating_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: seo_keywords; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

--
-- Name: social_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: social_engagement; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_engagement ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;
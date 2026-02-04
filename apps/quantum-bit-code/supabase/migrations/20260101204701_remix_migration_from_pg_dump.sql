CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
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
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
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
    WHERE user_id = _user_id AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: deals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    short_description text,
    detailed_description text,
    is_active boolean DEFAULT true,
    brand_logo_url text,
    brand_primary_color text DEFAULT '#1e3a8a'::text,
    brand_accent_color text DEFAULT '#d97706'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    includes_digital_asset_acquisitions boolean DEFAULT false
);


--
-- Name: digital_asset_narratives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.digital_asset_narratives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: domain_appraisal_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain_appraisal_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_id uuid,
    appraisal_source text,
    estimated_value numeric,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: domains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_name text NOT NULL,
    category text,
    estimated_value_low numeric,
    estimated_value_high numeric,
    strategic_role text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deal_id uuid NOT NULL,
    folder_id uuid,
    name text NOT NULL,
    storage_path text NOT NULL,
    file_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deal_id uuid NOT NULL,
    parent_folder_id uuid,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: investor_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investor_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    deal_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT investor_access_role_check CHECK ((role = ANY (ARRAY['viewer'::text, 'issuer'::text, 'admin'::text])))
);


--
-- Name: ip_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ip_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    value_low numeric NOT NULL,
    value_high numeric NOT NULL,
    estimated_licensing_low_per_year numeric,
    estimated_licensing_high_per_year numeric,
    markets text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    organization text,
    investor_type text,
    message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: nda_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nda_signatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    deal_id uuid NOT NULL,
    nda_template_id uuid NOT NULL,
    signed_name text NOT NULL,
    signed_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text
);


--
-- Name: nda_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nda_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deal_id uuid,
    version integer DEFAULT 1 NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    company_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tlds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tlds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tld_name text NOT NULL,
    acquisition_target boolean DEFAULT false,
    estimated_cost_low numeric,
    estimated_cost_high numeric,
    strategic_value text,
    status text DEFAULT 'planned'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: deals deals_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_slug_key UNIQUE (slug);


--
-- Name: digital_asset_narratives digital_asset_narratives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.digital_asset_narratives
    ADD CONSTRAINT digital_asset_narratives_pkey PRIMARY KEY (id);


--
-- Name: domain_appraisal_notes domain_appraisal_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_appraisal_notes
    ADD CONSTRAINT domain_appraisal_notes_pkey PRIMARY KEY (id);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: investor_access investor_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_access
    ADD CONSTRAINT investor_access_pkey PRIMARY KEY (id);


--
-- Name: investor_access investor_access_user_id_deal_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_access
    ADD CONSTRAINT investor_access_user_id_deal_id_key UNIQUE (user_id, deal_id);


--
-- Name: ip_assets ip_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_assets
    ADD CONSTRAINT ip_assets_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: nda_signatures nda_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_signatures
    ADD CONSTRAINT nda_signatures_pkey PRIMARY KEY (id);


--
-- Name: nda_signatures nda_signatures_user_id_deal_id_nda_template_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_signatures
    ADD CONSTRAINT nda_signatures_user_id_deal_id_nda_template_id_key UNIQUE (user_id, deal_id, nda_template_id);


--
-- Name: nda_templates nda_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_templates
    ADD CONSTRAINT nda_templates_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: tlds tlds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tlds
    ADD CONSTRAINT tlds_pkey PRIMARY KEY (id);


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
-- Name: domain_appraisal_notes domain_appraisal_notes_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_appraisal_notes
    ADD CONSTRAINT domain_appraisal_notes_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE CASCADE;


--
-- Name: files files_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: files files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: folders folders_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: folders folders_parent_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_parent_folder_id_fkey FOREIGN KEY (parent_folder_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: investor_access investor_access_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_access
    ADD CONSTRAINT investor_access_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: investor_access investor_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_access
    ADD CONSTRAINT investor_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nda_signatures nda_signatures_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_signatures
    ADD CONSTRAINT nda_signatures_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: nda_signatures nda_signatures_nda_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_signatures
    ADD CONSTRAINT nda_signatures_nda_template_id_fkey FOREIGN KEY (nda_template_id) REFERENCES public.nda_templates(id) ON DELETE CASCADE;


--
-- Name: nda_signatures nda_signatures_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_signatures
    ADD CONSTRAINT nda_signatures_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nda_templates nda_templates_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nda_templates
    ADD CONSTRAINT nda_templates_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: domains Admins can delete domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete domains" ON public.domains FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: files Admins can delete files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete files" ON public.files FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: folders Admins can delete folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete folders" ON public.folders FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: digital_asset_narratives Admins can delete narratives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete narratives" ON public.digital_asset_narratives FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tlds Admins can delete tlds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete tlds" ON public.tlds FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: domains Admins can insert domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert domains" ON public.domains FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: files Admins can insert files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert files" ON public.files FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: folders Admins can insert folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert folders" ON public.folders FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: digital_asset_narratives Admins can insert narratives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert narratives" ON public.digital_asset_narratives FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tlds Admins can insert tlds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert tlds" ON public.tlds FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: domains Admins can update domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update domains" ON public.domains FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: files Admins can update files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update files" ON public.files FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: folders Admins can update folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update folders" ON public.folders FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: digital_asset_narratives Admins can update narratives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update narratives" ON public.digital_asset_narratives FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tlds Admins can update tlds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update tlds" ON public.tlds FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leads Anyone can submit leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);


--
-- Name: domain_appraisal_notes Appraisal notes viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Appraisal notes viewable by authenticated users" ON public.domain_appraisal_notes FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: deals Deals are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deals are viewable by authenticated users" ON public.deals FOR SELECT TO authenticated USING (true);


--
-- Name: domains Domains viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Domains viewable by authenticated users" ON public.domains FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: files Files viewable by users with access and signed NDA; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Files viewable by users with access and signed NDA" ON public.files FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.investor_access ia
     JOIN public.nda_signatures ns ON (((ns.user_id = ia.user_id) AND (ns.deal_id = ia.deal_id))))
  WHERE ((ia.deal_id = files.deal_id) AND (ia.user_id = auth.uid())))));


--
-- Name: folders Folders viewable by users with access to deal; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Folders viewable by users with access to deal" ON public.folders FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.investor_access
  WHERE ((investor_access.deal_id = folders.deal_id) AND (investor_access.user_id = auth.uid())))));


--
-- Name: ip_assets IP assets are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "IP assets are viewable by everyone" ON public.ip_assets FOR SELECT USING (true);


--
-- Name: nda_templates NDA templates viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "NDA templates viewable by authenticated users" ON public.nda_templates FOR SELECT TO authenticated USING (true);


--
-- Name: digital_asset_narratives Narratives viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Narratives viewable by everyone" ON public.digital_asset_narratives FOR SELECT USING (true);


--
-- Name: tlds TLDs viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "TLDs viewable by everyone" ON public.tlds FOR SELECT USING (true);


--
-- Name: nda_signatures Users can create their own signatures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own signatures" ON public.nda_signatures FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: investor_access Users can view their own access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own access" ON public.investor_access FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: nda_signatures Users can view their own signatures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own signatures" ON public.nda_signatures FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: deals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

--
-- Name: digital_asset_narratives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.digital_asset_narratives ENABLE ROW LEVEL SECURITY;

--
-- Name: domain_appraisal_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.domain_appraisal_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: domains; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

--
-- Name: files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

--
-- Name: folders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

--
-- Name: investor_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.investor_access ENABLE ROW LEVEL SECURITY;

--
-- Name: ip_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ip_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: nda_signatures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;

--
-- Name: nda_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nda_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tlds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tlds ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;
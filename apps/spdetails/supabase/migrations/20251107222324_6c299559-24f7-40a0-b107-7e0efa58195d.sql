-- RLS Policies for businesses table
CREATE POLICY "Admins can view all businesses"
ON public.businesses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view their own business"
ON public.businesses FOR SELECT
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = businesses.id
      AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can create businesses"
ON public.businesses FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can create their own business"
ON public.businesses FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can update all businesses"
ON public.businesses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Business owners and partners can update their business"
ON public.businesses FOR UPDATE
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = businesses.id
      AND user_id = auth.uid()
      AND role = 'partner'
  )
);

-- RLS Policies for business_members table
CREATE POLICY "Admins can view all business members"
ON public.business_members FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view members of their business"
ON public.business_members FOR SELECT
USING (
  public.user_belongs_to_business(auth.uid(), business_id) OR
  user_id = auth.uid()
);

CREATE POLICY "Admins can manage all business members"
ON public.business_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can manage their business members"
ON public.business_members FOR INSERT
WITH CHECK (
  public.get_user_business_role(auth.uid(), business_id) = 'partner'
);

CREATE POLICY "Partners can update their business members"
ON public.business_members FOR UPDATE
USING (
  public.get_user_business_role(auth.uid(), business_id) = 'partner'
);

CREATE POLICY "Partners can delete their business members"
ON public.business_members FOR DELETE
USING (
  public.get_user_business_role(auth.uid(), business_id) = 'partner'
);

-- RLS Policies for business_pricing table
CREATE POLICY "Anyone can view pricing"
ON public.business_pricing FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all pricing"
ON public.business_pricing FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can manage their business pricing"
ON public.business_pricing FOR INSERT
WITH CHECK (
  public.user_belongs_to_business(auth.uid(), business_id)
  AND public.get_user_business_role(auth.uid(), business_id) = 'partner'
);

CREATE POLICY "Partners can update their business pricing"
ON public.business_pricing FOR UPDATE
USING (
  public.user_belongs_to_business(auth.uid(), business_id)
  AND public.get_user_business_role(auth.uid(), business_id) = 'partner'
);

CREATE POLICY "Partners can delete their business pricing"
ON public.business_pricing FOR DELETE
USING (
  public.user_belongs_to_business(auth.uid(), business_id)
  AND public.get_user_business_role(auth.uid(), business_id) = 'partner'
);

-- Update bookings RLS policies
DROP POLICY IF EXISTS "Users and admins can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view their business bookings"
ON public.bookings FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid()
      AND role = 'partner'
  )
);

CREATE POLICY "Staff can view their assigned bookings"
ON public.bookings FOR SELECT
USING (
  assigned_staff_id = auth.uid() OR
  business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid()
      AND role = 'staff'
  )
);

CREATE POLICY "Customers can view their own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can update their business bookings"
ON public.bookings FOR UPDATE
USING (
  business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid()
      AND role = 'partner'
  )
);

CREATE POLICY "Staff can update assigned bookings"
ON public.bookings FOR UPDATE
USING (assigned_staff_id = auth.uid());
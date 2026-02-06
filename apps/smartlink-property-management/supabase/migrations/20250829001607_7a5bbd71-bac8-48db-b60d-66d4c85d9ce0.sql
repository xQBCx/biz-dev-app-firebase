-- Create maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 9999999 + 1000000)::text, 7, '0'),
  user_id UUID NOT NULL,
  property_id UUID,
  
  -- Request details
  suite_number TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('bedroom', 'bathroom', 'kitchen', 'living_room', 'other')),
  specific_location TEXT,
  
  -- Selected items (array of item codes from the form)
  selected_items JSONB NOT NULL DEFAULT '[]',
  
  -- Priority and status
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  
  -- Assignment
  assigned_to UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Descriptions and notes
  description TEXT,
  remarks TEXT,
  
  -- Completion tracking
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  time_spent INTEGER, -- minutes
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view requests for their property" 
ON public.maintenance_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.property_id = maintenance_requests.property_id
  )
);

CREATE POLICY "Users can create requests" 
ON public.maintenance_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Maintenance staff can update requests" 
ON public.maintenance_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.property_id = maintenance_requests.property_id
    AND profiles.role IN ('maintenance', 'manager', 'owner')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_requests_updated_at
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create maintenance request comments table
CREATE TABLE public.maintenance_request_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for comments
ALTER TABLE public.maintenance_request_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Users can view comments for accessible requests" 
ON public.maintenance_request_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM maintenance_requests mr
    JOIN profiles p ON p.property_id = mr.property_id
    WHERE mr.id = request_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add comments to accessible requests" 
ON public.maintenance_request_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM maintenance_requests mr
    JOIN profiles p ON p.property_id = mr.property_id
    WHERE mr.id = request_id 
    AND p.user_id = auth.uid()
  )
);
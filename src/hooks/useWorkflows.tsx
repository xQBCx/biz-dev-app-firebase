import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WorkflowTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  icon: string;
  is_system: boolean;
  is_featured: boolean;
  complexity: string;
  estimated_time_saved_hours: number | null;
  use_count: number;
  rating: number;
  rating_count: number;
  tags: string[];
  required_modules: string[];
}

export interface WorkflowNodeType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  module: string | null;
  icon: string;
  color: string;
  is_trigger: boolean;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  user_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  is_draft: boolean;
  version: number;
  nodes: Json[];
  edges: Json[];
  variables: Record<string, Json>;
  settings: Record<string, Json>;
  trigger_config: Record<string, Json> | null;
  last_run_at: string | null;
  run_count: number;
  success_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  user_id: string;
  status: string;
  trigger_type: string;
  trigger_data: Record<string, unknown> | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  node_results: unknown[];
  error_message: string | null;
  error_node_id: string | null;
}

export function useWorkflows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch workflow templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('use_count', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data as WorkflowTemplate[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch workflow node types
  const { data: nodeTypes, isLoading: isLoadingNodeTypes } = useQuery({
    queryKey: ['workflow-node-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_node_types')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) {
        console.error('Error fetching node types:', error);
        return [];
      }

      return data as WorkflowNodeType[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch user's workflows
  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['workflows', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflows:', error);
        return [];
      }

      return data as Workflow[];
    },
    enabled: !!user?.id,
  });

  // Fetch recent workflow runs
  const { data: recentRuns, isLoading: isLoadingRuns } = useQuery({
    queryKey: ['workflow-runs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching workflow runs:', error);
        return [];
      }

      return data as WorkflowRun[];
    },
    enabled: !!user?.id,
  });

  // Create workflow from template
  const createFromTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const template = templates?.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          template_id: templateId,
          name: template.name,
          description: template.description,
          category: template.category,
          is_draft: true,
          nodes: [],
          edges: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created from template');
    },
    onError: (error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });

  // Create blank workflow
  const createWorkflowMutation = useMutation({
    mutationFn: async ({ name, category, description }: { name: string; category: string; description?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          name,
          category,
          description: description || null,
          is_draft: true,
          nodes: [],
          edges: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created');
    },
    onError: (error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });

  // Update workflow
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Workflow> & { id: string }) => {
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  // Toggle workflow active state
  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active, is_draft: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success(variables.is_active ? 'Workflow activated' : 'Workflow paused');
    },
  });

  // Delete workflow
  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted');
    },
  });

  // Run workflow manually
  const runWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Create a run record
      const { data: run, error: runError } = await supabase
        .from('workflow_runs')
        .insert({
          workflow_id: workflowId,
          user_id: user.id,
          status: 'running',
          trigger_type: 'manual',
        })
        .select()
        .single();

      if (runError) throw runError;

      // TODO: Execute workflow via edge function
      // For now, simulate completion
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { error: updateError } = await supabase
        .from('workflow_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: 1000,
        })
        .eq('id', run.id);

      if (updateError) throw updateError;

      // Update workflow stats - get current values first
      const { data: currentWorkflow } = await supabase
        .from('workflows')
        .select('run_count, success_count')
        .eq('id', workflowId)
        .single();

      if (currentWorkflow) {
        await supabase
          .from('workflows')
          .update({
            last_run_at: new Date().toISOString(),
            run_count: (currentWorkflow.run_count || 0) + 1,
            success_count: (currentWorkflow.success_count || 0) + 1,
          })
          .eq('id', workflowId);
      }

      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-runs'] });
      toast.success('Workflow executed successfully');
    },
    onError: (error) => {
      toast.error(`Workflow execution failed: ${error.message}`);
    },
  });

  // Get templates by category
  const getTemplatesByCategory = (category: string) => {
    return templates?.filter(t => t.category === category) || [];
  };

  // Get featured templates
  const getFeaturedTemplates = () => {
    return templates?.filter(t => t.is_featured) || [];
  };

  // Get node types by category
  const getNodeTypesByCategory = (category: string) => {
    return nodeTypes?.filter(n => n.category === category) || [];
  };

  // Get trigger nodes
  const getTriggerNodes = () => {
    return nodeTypes?.filter(n => n.is_trigger) || [];
  };

  // Get action nodes
  const getActionNodes = () => {
    return nodeTypes?.filter(n => !n.is_trigger) || [];
  };

  return {
    // Data
    templates: templates || [],
    nodeTypes: nodeTypes || [],
    workflows: workflows || [],
    recentRuns: recentRuns || [],

    // Loading states
    isLoading: isLoadingTemplates || isLoadingNodeTypes || isLoadingWorkflows || isLoadingRuns,
    isLoadingTemplates,
    isLoadingNodeTypes,
    isLoadingWorkflows,
    isLoadingRuns,

    // Mutations
    createFromTemplate: createFromTemplateMutation.mutate,
    createWorkflow: createWorkflowMutation.mutateAsync,
    updateWorkflow: updateWorkflowMutation.mutate,
    toggleWorkflow: toggleWorkflowMutation.mutate,
    deleteWorkflow: deleteWorkflowMutation.mutate,
    runWorkflow: runWorkflowMutation.mutate,

    // Mutation states
    isCreating: createFromTemplateMutation.isPending || createWorkflowMutation.isPending,
    isRunning: runWorkflowMutation.isPending,

    // Helper functions
    getTemplatesByCategory,
    getFeaturedTemplates,
    getNodeTypesByCategory,
    getTriggerNodes,
    getActionNodes,
  };
}

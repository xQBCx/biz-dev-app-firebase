import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GraphNode, GraphEdge } from '@/components/visualization/ForceGraph';

// Platform modules as static nodes
const PLATFORM_MODULES: GraphNode[] = [
  { id: 'mod-dashboard', label: 'Dashboard', type: 'module', value: 100 },
  { id: 'mod-crm', label: 'CRM', type: 'module', value: 90 },
  { id: 'mod-erp', label: 'ERP', type: 'module', value: 85 },
  { id: 'mod-xodiak', label: 'XODIAK', type: 'module', value: 95 },
  { id: 'mod-xbuilderx', label: 'xBUILDERx', type: 'module', value: 88 },
  { id: 'mod-grid-os', label: 'Grid OS', type: 'infrastructure', value: 92 },
  { id: 'mod-iplaunch', label: 'IPLaunch', type: 'module', value: 70 },
  { id: 'mod-marketplace', label: 'Marketplace', type: 'module', value: 75 },
  { id: 'mod-trueodds', label: 'TrueOdds', type: 'module', value: 65 },
  { id: 'mod-broadcast', label: 'Broadcast', type: 'module', value: 60 },
  { id: 'mod-research', label: 'Research Studio', type: 'module', value: 72 },
  { id: 'mod-social', label: 'Social', type: 'module', value: 55 },
  { id: 'mod-workflows', label: 'Workflows', type: 'module', value: 78 },
  { id: 'mod-ecosystem', label: 'Ecosystem', type: 'module', value: 80 },
  { id: 'mod-fleet', label: 'Fleet Intel', type: 'infrastructure', value: 68 },
  { id: 'mod-driveby', label: 'Drive-By Intel', type: 'module', value: 62 },
];

// Module interconnections
const MODULE_EDGES: GraphEdge[] = [
  { source: 'mod-dashboard', target: 'mod-crm', weight: 3 },
  { source: 'mod-dashboard', target: 'mod-erp', weight: 3 },
  { source: 'mod-dashboard', target: 'mod-xodiak', weight: 2 },
  { source: 'mod-crm', target: 'mod-erp', weight: 2 },
  { source: 'mod-crm', target: 'mod-driveby', weight: 3 },
  { source: 'mod-crm', target: 'mod-marketplace', weight: 2 },
  { source: 'mod-xodiak', target: 'mod-grid-os', weight: 4 },
  { source: 'mod-xodiak', target: 'mod-xbuilderx', weight: 3 },
  { source: 'mod-xodiak', target: 'mod-fleet', weight: 3 },
  { source: 'mod-xbuilderx', target: 'mod-erp', weight: 2 },
  { source: 'mod-grid-os', target: 'mod-fleet', weight: 2 },
  { source: 'mod-iplaunch', target: 'mod-crm', weight: 1 },
  { source: 'mod-marketplace', target: 'mod-ecosystem', weight: 2 },
  { source: 'mod-ecosystem', target: 'mod-social', weight: 2 },
  { source: 'mod-research', target: 'mod-crm', weight: 1 },
  { source: 'mod-workflows', target: 'mod-erp', weight: 2 },
  { source: 'mod-workflows', target: 'mod-crm', weight: 2 },
  { source: 'mod-broadcast', target: 'mod-social', weight: 2 },
];

export interface SystemGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    moduleCount: number;
    entityCount: number;
  };
}

export function useSystemGraph() {
  const { user } = useAuth();
  const [data, setData] = useState<SystemGraphData>({
    nodes: PLATFORM_MODULES,
    edges: MODULE_EDGES,
    stats: { totalNodes: PLATFORM_MODULES.length, totalEdges: MODULE_EDGES.length, moduleCount: PLATFORM_MODULES.length, entityCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraphData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all entities in parallel
      const [
        companiesRes,
        contactsRes,
        dealsRes,
        graphEdgesRes,
      ] = await Promise.all([
        supabase.from('crm_companies').select('id, name').limit(100),
        supabase.from('crm_contacts').select('id, first_name, last_name, company_id').limit(200),
        supabase.from('crm_deals').select('id, name, company_id, contact_id').limit(100),
        supabase.from('instincts_graph_edges').select('*').limit(500),
      ]);

      const nodes: GraphNode[] = [...PLATFORM_MODULES];
      const edges: GraphEdge[] = [...MODULE_EDGES];

      // Add companies
      const companies = companiesRes.data ?? [];
      companies.forEach(company => {
        nodes.push({
          id: `company-${company.id}`,
          label: company.name || 'Unknown',
          type: 'company',
          metadata: { entityId: company.id },
        });
        // Connect to CRM module
        edges.push({ source: 'mod-crm', target: `company-${company.id}`, weight: 1 });
      });

      // Add contacts
      const contacts = contactsRes.data ?? [];
      contacts.forEach(contact => {
        nodes.push({
          id: `contact-${contact.id}`,
          label: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown',
          type: 'contact',
          metadata: { entityId: contact.id, companyId: contact.company_id },
        });
        // Connect to company if exists
        if (contact.company_id) {
          edges.push({ source: `company-${contact.company_id}`, target: `contact-${contact.id}`, weight: 2 });
        } else {
          edges.push({ source: 'mod-crm', target: `contact-${contact.id}`, weight: 0.5 });
        }
      });

      // Add deals
      const deals = dealsRes.data ?? [];
      deals.forEach(deal => {
        nodes.push({
          id: `deal-${deal.id}`,
          label: deal.name || 'Deal',
          type: 'deal',
          metadata: { entityId: deal.id, companyId: deal.company_id, contactId: deal.contact_id },
        });
        if (deal.company_id) {
          edges.push({ source: `company-${deal.company_id}`, target: `deal-${deal.id}`, weight: 2 });
        }
        if (deal.contact_id) {
          edges.push({ source: `contact-${deal.contact_id}`, target: `deal-${deal.id}`, weight: 1.5 });
        }
      });

      // Add graph edges from instincts
      const graphEdges = graphEdgesRes.data ?? [];
      graphEdges.forEach(edge => {
        const sourceId = `${edge.source_type}-${edge.source_id}`;
        const targetId = `${edge.target_type}-${edge.target_id}`;
        
        // Only add if both nodes exist
        const sourceExists = nodes.some(n => n.id === sourceId);
        const targetExists = nodes.some(n => n.id === targetId);
        
        if (sourceExists && targetExists) {
          edges.push({
            source: sourceId,
            target: targetId,
            weight: edge.weight ?? 1,
            type: edge.edge_type ?? undefined,
          });
        }
      });

      const moduleCount = nodes.filter(n => n.type === 'module' || n.type === 'infrastructure').length;
      const entityCount = nodes.length - moduleCount;

      setData({
        nodes,
        edges,
        stats: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          moduleCount,
          entityCount,
        },
      });
      setError(null);
    } catch (err) {
      console.error('Error loading graph data:', err);
      setError('Failed to load system graph data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  return {
    ...data,
    loading,
    error,
    refresh: loadGraphData,
  };
}

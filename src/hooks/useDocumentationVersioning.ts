import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { whitePaperContent, WhitePaperData } from '@/components/whitepaper/whitePaperContent';

// Updated Deal Room white paper to version 5 with AI Orchestration Agent documentation

interface SaveVersionOptions {
  moduleKey: string;
  changeSummary: string;
  changeType: 'created' | 'updated' | 'major_revision';
  relatedFeature?: string;
}

/**
 * Hook for managing documentation version history
 * Use this after updating white papers to save the previous version
 */
export function useDocumentationVersioning() {
  const { user } = useAuth();

  /**
   * Archives the current version of a white paper before updating it
   */
  const archiveCurrentVersion = async (options: SaveVersionOptions): Promise<boolean> => {
    const { moduleKey, changeSummary, changeType, relatedFeature } = options;
    
    try {
      const currentContent = whitePaperContent[moduleKey];
      if (!currentContent) {
        console.warn(`No white paper content found for module: ${moduleKey}`);
        return false;
      }

      // Get the current highest version number for this module
      const { data: existingVersions, error: fetchError } = await supabase
        .from('documentation_versions')
        .select('version')
        .eq('module_key', moduleKey)
        .order('version', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextVersion = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].version + 1 
        : currentContent.version;

      // Save the current version to history
      const { data: versionData, error: versionError } = await supabase
        .from('documentation_versions')
        .insert({
          module_key: moduleKey,
          version: nextVersion,
          title: currentContent.title,
          subtitle: currentContent.subtitle,
          content: currentContent.sections,
          change_summary: changeSummary,
          changed_by: user?.id || null,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Add changelog entry
      const { error: changelogError } = await supabase
        .from('documentation_changelog')
        .insert({
          version_id: versionData.id,
          module_key: moduleKey,
          old_version: existingVersions?.[0]?.version || null,
          new_version: nextVersion,
          change_type: changeType,
          change_notes: changeSummary,
          related_feature: relatedFeature || null,
          changed_by: user?.id || null,
        });

      if (changelogError) throw changelogError;

      return true;
    } catch (error: any) {
      console.error('Error archiving documentation version:', error);
      toast.error('Failed to archive documentation version');
      return false;
    }
  };

  /**
   * Quick method to log a documentation update after making changes
   */
  const logDocumentationUpdate = async (
    moduleKey: string,
    changeSummary: string,
    relatedFeature?: string
  ): Promise<boolean> => {
    return archiveCurrentVersion({
      moduleKey,
      changeSummary,
      changeType: 'updated',
      relatedFeature,
    });
  };

  /**
   * Archive all current white papers (useful for initial setup or major platform upgrades)
   */
  const archiveAllWhitePapers = async (changeSummary: string): Promise<number> => {
    let archived = 0;
    
    for (const moduleKey of Object.keys(whitePaperContent)) {
      const success = await archiveCurrentVersion({
        moduleKey,
        changeSummary,
        changeType: 'major_revision',
        relatedFeature: 'Platform-wide update',
      });
      if (success) archived++;
    }
    
    toast.success(`Archived ${archived} white paper versions`);
    return archived;
  };

  return {
    archiveCurrentVersion,
    logDocumentationUpdate,
    archiveAllWhitePapers,
  };
}

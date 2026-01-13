import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchRequest {
  projectImportId: string;
  filePath?: string;
  directory?: string;
  fetchAll?: boolean;
  branch?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectImportId, filePath, directory, fetchAll, branch = 'main' }: FetchRequest = await req.json();

    if (!projectImportId) {
      return new Response(
        JSON.stringify({ error: 'projectImportId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get project import details
    const { data: projectImport, error: importError } = await supabase
      .from('platform_project_imports')
      .select('*, user_platform_connections(*)')
      .eq('id', projectImportId)
      .single();

    if (importError || !projectImport) {
      console.error('Project import not found:', importError);
      return new Response(
        JSON.stringify({ error: 'Project import not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get access token from connection
    const connection = projectImport.user_platform_connections;
    const accessToken = connection?.credentials?.access_token || connection?.credentials?.personal_access_token;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token available. Please reconnect your GitHub account.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract repo info from metadata or project_url
    const metadata = projectImport.metadata || {};
    const repoFullName = metadata.full_name || projectImport.project_url?.replace('https://github.com/', '');

    if (!repoFullName) {
      return new Response(
        JSON.stringify({ error: 'Could not determine repository name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching code from ${repoFullName}, branch: ${branch}`);

    // Create an operation record
    const { data: operation, error: opError } = await supabase
      .from('code_integration_operations')
      .insert({
        user_id: user.id,
        source_project_id: projectImportId,
        operation_type: 'fetch',
        status: 'in_progress',
        files_involved: filePath ? [filePath] : [],
      })
      .select()
      .single();

    if (opError) {
      console.error('Failed to create operation:', opError);
    }

    let fetchedFiles: any[] = [];
    let totalFiles = 0;
    let errors: string[] = [];

    // Determine what to fetch
    if (filePath) {
      // Fetch single file
      const result = await fetchSingleFile(accessToken, repoFullName, filePath, branch);
      if (result.success) {
        fetchedFiles.push(result.file);
      } else {
        errors.push(result.error || 'Unknown error');
      }
    } else if (directory || fetchAll) {
      // Fetch directory or entire repo
      const path = directory || '';
      const result = await fetchDirectory(accessToken, repoFullName, path, branch, supabase, projectImportId, user.id);
      fetchedFiles = result.files;
      totalFiles = result.totalFiles;
      errors = result.errors;
    } else {
      // Default: fetch root directory structure
      const result = await fetchDirectory(accessToken, repoFullName, '', branch, supabase, projectImportId, user.id);
      fetchedFiles = result.files;
      totalFiles = result.totalFiles;
      errors = result.errors;
    }

    // Store files in database
    for (const file of fetchedFiles) {
      const { error: upsertError } = await supabase
        .from('project_code_files')
        .upsert({
          project_import_id: projectImportId,
          user_id: user.id,
          file_path: file.path,
          file_content: file.content,
          file_size: file.size,
          file_hash: file.sha,
          language: detectLanguage(file.path),
          last_fetched_at: new Date().toISOString(),
        }, { onConflict: 'project_import_id,file_path' });

      if (upsertError) {
        console.error(`Failed to store file ${file.path}:`, upsertError);
        errors.push(`Failed to store: ${file.path}`);
      }
    }

    // Update operation status
    if (operation) {
      await supabase
        .from('code_integration_operations')
        .update({
          status: errors.length > 0 ? 'completed' : 'completed',
          progress: 100,
          files_involved: fetchedFiles.map(f => f.path),
          result_data: { 
            filesStored: fetchedFiles.length, 
            totalFiles,
            errors: errors.length > 0 ? errors : undefined
          },
          completed_at: new Date().toISOString(),
        })
        .eq('id', operation.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        filesStored: fetchedFiles.length,
        totalFiles,
        errors: errors.length > 0 ? errors : undefined,
        files: fetchedFiles.map(f => ({ path: f.path, size: f.size, language: detectLanguage(f.path) })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('GitHub fetch code error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchSingleFile(
  accessToken: string,
  repoFullName: string,
  filePath: string,
  branch: string
): Promise<{ success: boolean; file?: any; error?: string }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BizDev-System-Intelligence',
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: `Failed to fetch ${filePath}: ${response.status}` };
    }

    const data = await response.json();
    
    if (data.type !== 'file') {
      return { success: false, error: `${filePath} is not a file` };
    }

    // Decode base64 content
    const content = atob(data.content.replace(/\n/g, ''));

    return {
      success: true,
      file: {
        path: data.path,
        content,
        size: data.size,
        sha: data.sha,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function fetchDirectory(
  accessToken: string,
  repoFullName: string,
  path: string,
  branch: string,
  supabase: any,
  projectImportId: string,
  userId: string
): Promise<{ files: any[]; totalFiles: number; errors: string[] }> {
  const files: any[] = [];
  const errors: string[] = [];
  let totalFiles = 0;

  // File extensions to fetch (code files)
  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html', '.md',
    '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift', '.vue', '.svelte',
    '.yaml', '.yml', '.toml', '.sql', '.graphql', '.prisma', '.env.example'
  ];

  // Directories to skip
  const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'vendor'];

  async function processDirectory(dirPath: string) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${dirPath}?ref=${branch}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'BizDev-System-Intelligence',
          },
        }
      );

      if (!response.ok) {
        errors.push(`Failed to fetch directory ${dirPath}: ${response.status}`);
        return;
      }

      const items = await response.json();
      
      if (!Array.isArray(items)) {
        return;
      }

      for (const item of items) {
        if (item.type === 'dir') {
          // Skip unwanted directories
          if (skipDirs.includes(item.name)) continue;
          // Recursively process subdirectories
          await processDirectory(item.path);
        } else if (item.type === 'file') {
          totalFiles++;
          // Check if it's a code file we want to fetch
          const ext = '.' + item.name.split('.').pop()?.toLowerCase();
          if (codeExtensions.includes(ext) || item.name === 'package.json' || item.name === 'README.md') {
            // Fetch file content
            const result = await fetchSingleFile(accessToken, repoFullName, item.path, branch);
            if (result.success && result.file) {
              files.push(result.file);
            } else if (result.error) {
              errors.push(result.error);
            }
            
            // Rate limiting: small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } catch (error: any) {
      errors.push(`Error processing ${dirPath}: ${error.message}`);
    }
  }

  await processDirectory(path);

  return { files, totalFiles, errors };
}

function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'md': 'markdown',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'kt': 'kotlin',
    'swift': 'swift',
    'vue': 'vue',
    'svelte': 'svelte',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'sql': 'sql',
    'graphql': 'graphql',
    'prisma': 'prisma',
  };
  return langMap[ext] || 'text';
}

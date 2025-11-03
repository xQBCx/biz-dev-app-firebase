import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecordingUploadRequest {
  call_id: string;
  codec: 'flac' | 'mp3' | 'opus' | 'wav';
  duration_sec: number;
  channels: number;
  sample_rate: number;
  file_data: string; // base64
  checksum: string;
  is_archive?: boolean;
  is_preview?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const pbxToken = Deno.env.get('PBX_AUTH_TOKEN') || '';
    
    // Allow either user auth or PBX service token
    const isServiceAuth = authHeader.includes(pbxToken) && pbxToken;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      isServiceAuth 
        ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        : Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      isServiceAuth ? {} : {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    if (!isServiceAuth) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const body: RecordingUploadRequest = await req.json();

    // Decode base64 file data
    const fileData = Uint8Array.from(atob(body.file_data), c => c.charCodeAt(0));
    const fileName = `${body.call_id}.${body.codec}`;
    const filePath = `${body.call_id}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('call-recordings')
      .upload(filePath, fileData, {
        contentType: `audio/${body.codec}`,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading recording:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload recording', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create recording record
    const { data: recording, error: recError } = await supabase
      .from('call_recordings')
      .insert({
        call_id: body.call_id,
        codec: body.codec,
        duration_sec: body.duration_sec,
        channels: body.channels,
        sample_rate: body.sample_rate,
        file_path: filePath,
        size_bytes: fileData.length,
        checksum: body.checksum,
        is_archive: body.is_archive || false,
        is_preview: body.is_preview || false,
      })
      .select()
      .single();

    if (recError) {
      console.error('Error creating recording record:', recError);
      return new Response(
        JSON.stringify({ error: 'Failed to create recording record', details: recError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Recording uploaded: ${recording.id}, call: ${body.call_id}, codec: ${body.codec}`);

    return new Response(
      JSON.stringify({ recording, upload: uploadData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in recording-upload function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

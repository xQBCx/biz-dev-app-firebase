import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRow {
  firstName: string;
  lastName: string;
  companyName: string;
  businessPhone: string;
  title: string;
  email: string;
  state: string;
  country: string;
}

// Enhanced parser that handles multiple formats
function parseContactsFromText(text: string): ContactRow[] {
  const contacts: ContactRow[] = [];
  const lines = text.split('\n');
  
  console.log(`Processing ${lines.length} total lines`);
  
  // Try to detect the format
  const isTabularFormat = lines.some(line => 
    (line.match(/\t/g) || []).length >= 3 || // Tab-separated
    (line.match(/\|/g) || []).length >= 3 || // Pipe-separated
    (line.match(/\s{2,}/g) || []).length >= 4 // Multiple-space separated
  );
  
  console.log(`Detected format: ${isTabularFormat ? 'tabular' : 'mixed'}`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines, headers, and page markers
    if (!line.trim() || 
        line.includes('First&Name') || 
        line.includes('FirstName') ||
        line.includes('## Page') ||
        line.includes('### Images') ||
        line.includes('parsed-documents://') ||
        line.startsWith('#') ||
        /^page\s+\d+/i.test(line.trim()) ||
        /^\s*[\-=]+\s*$/.test(line)) {
      continue;
    }
    
    const contact = parseContactLine(line);
    if (contact) {
      contacts.push(contact);
    }
  }
  
  console.log(`Parsed ${contacts.length} contacts from text`);
  return contacts;
}

function cleanText(text: string): string {
  return text
    .replace(/\./g, ' ')  // PDF uses . for spaces
    .replace(/</g, '-')   // PDF uses < for dashes
    .replace(/&/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseContactLine(line: string): ContactRow | null {
  // Clean the line first
  const cleanedLine = line.trim();
  if (!cleanedLine || cleanedLine.length < 10) return null;
  
  // Extract email (most reliable field)
  const emailMatch = cleanedLine.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].replace(/<$/, '').replace(/\.$/, '') : '';
  
  // Extract phone - multiple formats
  // Format: (xxx).xxx<xxxx, (xxx) xxx-xxxx, xxx-xxx-xxxx, etc.
  const phonePatterns = [
    /\((\d{3})\)[.\s]?(\d{3})[<\-.](\d{4})(\.?x\d+|x\d+)?/,
    /(\d{3})[.\-](\d{3})[.\-](\d{4})/,
    /\+?1?[.\-\s]?\((\d{3})\)[.\-\s]?(\d{3})[.\-\s]?(\d{4})/
  ];
  
  let phone = '';
  for (const pattern of phonePatterns) {
    const match = cleanedLine.match(pattern);
    if (match) {
      if (match[1] && match[2] && match[3]) {
        phone = `(${match[1]}) ${match[2]}-${match[3]}${match[4] ? ` ${match[4].replace('.', '')}` : ''}`;
      }
      break;
    }
  }
  
  // Split by multiple spaces, tabs, or pipes
  let parts = cleanedLine.split(/\s{2,}|\t+|\|/);
  
  // If that doesn't work well, try single space split but smarter
  if (parts.length < 3) {
    parts = cleanedLine.split(/\s+/);
  }
  
  // Filter out empty parts and clean them
  parts = parts.map(p => cleanText(p)).filter(p => p.length > 0);
  
  if (parts.length < 2) return null;
  
  // First part is usually first name
  let firstName = parts[0] || '';
  let lastName = '';
  let companyName = '';
  let title = '';
  let state = '';
  let country = 'United States';
  
  // Try to identify last name (second part that's not a company or title)
  if (parts.length >= 2) {
    // Check if second part looks like a name (short, no spaces, not a company indicator)
    const secondPart = parts[1];
    if (secondPart && 
        secondPart.length < 30 && 
        !secondPart.includes(' ') &&
        !secondPart.includes('@') &&
        !/\d{3}/.test(secondPart) &&
        !secondPart.match(/Inc|LLC|Corp|Company|Ltd|Group/i)) {
      lastName = secondPart;
    } else {
      // Maybe first and last name are together
      const nameMatch = firstName.match(/^(\w+)\s+(\w+)$/);
      if (nameMatch) {
        firstName = nameMatch[1];
        lastName = nameMatch[2];
      }
    }
  }
  
  // Find company name (usually third part or the longest part)
  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (part.length > 5 && 
        !part.includes('@') && 
        !/^\(\d{3}\)/.test(part) &&
        !/^\d{3}[-.]/.test(part) &&
        !part.match(/^[A-Z]{2}$/) &&
        !part.match(/United States|Canada|France|Germany|UK|Australia/i)) {
      // This might be company name
      if (!companyName || (part.length > companyName.length && !part.match(/President|CEO|Director|Manager|VP|Executive|Engineer|Analyst/i))) {
        companyName = part;
      }
      // Check if it's a title
      if (part.match(/President|CEO|Director|Manager|VP|Vice|Executive|Chief|Officer|Head|Lead|Senior|Engineer|Analyst|Specialist|Consultant|Partner|Owner|Founder/i)) {
        title = part;
      }
    }
  }
  
  // Find state (2-letter code or full state name)
  for (const part of parts) {
    if (/^[A-Z]{2}$/.test(part) && !part.match(/VP|HR|IT|UK|US/)) {
      state = part;
      break;
    }
    if (part.match(/^(California|Texas|New York|Florida|Illinois|Pennsylvania|Ohio|Georgia|North Carolina|Michigan|Arizona|Colorado|Washington|Massachusetts|Virginia|New Jersey|Tennessee|Indiana|Missouri|Wisconsin|Minnesota|Oregon|Connecticut|Maryland|Oklahoma|Iowa|Utah|Nevada|Kansas|Arkansas|Nebraska|New Mexico|West Virginia|Idaho|Hawaii|Maine|Rhode Island|Montana|Delaware|South Dakota|North Dakota|Alaska|Vermont|Wyoming)/i)) {
      state = part;
      break;
    }
  }
  
  // Find country
  for (const part of parts) {
    if (part.match(/^(United States|Canada|France|Germany|UK|United Kingdom|Australia|Mexico|Brazil|India|China|Japan|Singapore|Netherlands|Switzerland|Ireland|UAE|United Arab Emirates|Uruguay|Spain|Italy)$/i)) {
      country = part;
      break;
    }
  }
  
  // Validate - must have at least a name
  if (!firstName) return null;
  
  // If we don't have lastName but have two-word firstName, split it
  if (!lastName && firstName.includes(' ')) {
    const nameParts = firstName.split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  }
  
  // Final fallback for lastName
  if (!lastName) lastName = 'Unknown';
  
  return {
    firstName: firstName.substring(0, 100),
    lastName: lastName.substring(0, 100),
    companyName: companyName.substring(0, 255) || '',
    businessPhone: phone,
    title: title.substring(0, 200) || '',
    email: email.substring(0, 255),
    state: state.substring(0, 100),
    country: country.substring(0, 100)
  };
}

// AI-powered parsing for complex formats
async function parseContactsWithAI(text: string, openaiKey: string): Promise<ContactRow[]> {
  console.log("Using AI to parse contacts...");
  
  // Split text into chunks to process
  const lines = text.split('\n').filter(l => l.trim());
  const chunkSize = 100; // Process 100 lines at a time
  const allContacts: ContactRow[] = [];
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a data extraction expert. Extract contact information from the provided text.
              
Return a JSON array of contacts. Each contact should have these fields (use empty string if not found):
- firstName: string
- lastName: string  
- companyName: string
- businessPhone: string (format as (XXX) XXX-XXXX if possible)
- title: string (job title)
- email: string
- state: string
- country: string (default to "United States" if US-based)

Only return valid JSON array, no other text. Extract ALL contacts you can find.
Skip header rows and page markers.`
            },
            {
              role: 'user',
              content: `Extract contacts from this text:\n\n${chunk}`
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        console.error(`AI API error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '[]';
      
      // Parse the JSON response
      try {
        // Clean up the response - remove markdown code blocks if present
        let jsonStr = content.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.slice(7);
        }
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.slice(0, -3);
        }
        
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          allContacts.push(...parsed);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
      
      console.log(`Processed chunk ${Math.floor(i/chunkSize) + 1}, found ${allContacts.length} contacts so far`);
      
    } catch (error) {
      console.error(`Error processing chunk ${i}:`, error);
    }
  }
  
  return allContacts;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { parsedContent, userId, clientId, useAI = false } = await req.json();

    if (!parsedContent || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing parsedContent or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting import for user ${userId}, content length: ${parsedContent.length}`);

    // Parse contacts - try AI first if enabled and available
    let contacts: ContactRow[];
    
    if (useAI && openaiKey) {
      contacts = await parseContactsWithAI(parsedContent, openaiKey);
      console.log(`AI parsing returned ${contacts.length} contacts`);
      
      // If AI fails or returns few results, fallback to regex
      if (contacts.length < 10) {
        console.log("AI returned few results, trying regex parser...");
        const regexContacts = parseContactsFromText(parsedContent);
        if (regexContacts.length > contacts.length) {
          contacts = regexContacts;
        }
      }
    } else {
      contacts = parseContactsFromText(parsedContent);
    }

    console.log(`Final parsed count: ${contacts.length} contacts`);

    if (contacts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No contacts could be parsed from the document",
          stats: {
            totalContactsParsed: 0,
            uniqueCompanies: 0,
            companiesCreated: 0,
            companiesExisted: 0,
            contactsCreated: 0,
            skippedDuplicates: 0
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group contacts by company for deduplication
    const companiesMap = new Map<string, ContactRow[]>();
    
    for (const contact of contacts) {
      if (contact.companyName) {
        const normalizedCompany = contact.companyName.toLowerCase().trim();
        if (!companiesMap.has(normalizedCompany)) {
          companiesMap.set(normalizedCompany, []);
        }
        companiesMap.get(normalizedCompany)!.push(contact);
      }
    }

    console.log(`Found ${companiesMap.size} unique companies`);

    // First, fetch existing companies to avoid duplicates
    const { data: existingCompanies } = await supabase
      .from('crm_companies')
      .select('id, name')
      .eq('user_id', userId);

    const existingCompanyMap = new Map<string, string>();
    for (const company of existingCompanies || []) {
      existingCompanyMap.set(company.name.toLowerCase().trim(), company.id);
    }

    console.log(`Found ${existingCompanyMap.size} existing companies`);

    // Fetch existing contacts to avoid duplicates by email
    const { data: existingContacts } = await supabase
      .from('crm_contacts')
      .select('email')
      .eq('user_id', userId);

    const existingEmails = new Set<string>();
    for (const contact of existingContacts || []) {
      if (contact.email) {
        existingEmails.add(contact.email.toLowerCase());
      }
    }

    console.log(`Found ${existingEmails.size} existing contacts`);

    // Create new companies that don't exist
    const companyIdMap = new Map<string, string>();
    const newCompanies: any[] = [];

    for (const [normalizedName, contactsInCompany] of companiesMap) {
      if (existingCompanyMap.has(normalizedName)) {
        companyIdMap.set(normalizedName, existingCompanyMap.get(normalizedName)!);
      } else {
        // Use the first contact's data for company info
        const firstContact = contactsInCompany[0];
        newCompanies.push({
          user_id: userId,
          client_id: clientId || null,
          name: firstContact.companyName,
          phone: firstContact.businessPhone || null,
          state: firstContact.state || null,
          country: firstContact.country || null,
          source: 'pdf_import',
          custom_fields: { 
            imported_at: new Date().toISOString(), 
            employee_count: contactsInCompany.length 
          }
        });
      }
    }

    // Insert new companies in batches
    const BATCH_SIZE = 100;
    let companiesCreated = 0;

    for (let i = 0; i < newCompanies.length; i += BATCH_SIZE) {
      const batch = newCompanies.slice(i, i + BATCH_SIZE);
      const { data: insertedCompanies, error: companyError } = await supabase
        .from('crm_companies')
        .insert(batch)
        .select('id, name');

      if (companyError) {
        console.error('Error inserting companies batch:', companyError);
        continue;
      }

      for (const company of insertedCompanies || []) {
        companyIdMap.set(company.name.toLowerCase().trim(), company.id);
        companiesCreated++;
      }
      
      console.log(`Inserted company batch ${Math.floor(i / BATCH_SIZE) + 1}, total: ${companiesCreated}`);
    }

    console.log(`Created ${companiesCreated} new companies`);

    // Now create contacts with company associations
    const contactsToInsert: any[] = [];
    let skippedDuplicate = 0;
    let skippedNoEmail = 0;

    for (const contact of contacts) {
      // Generate email if missing
      let emailToUse = contact.email;
      
      if (!emailToUse) {
        // Create placeholder email
        const sanitizedFirst = contact.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const sanitizedLast = contact.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        emailToUse = `${sanitizedFirst}.${sanitizedLast}@imported.placeholder`;
        skippedNoEmail++;
      }
      
      // Skip if email already exists
      if (existingEmails.has(emailToUse.toLowerCase())) {
        skippedDuplicate++;
        continue;
      }
      
      existingEmails.add(emailToUse.toLowerCase()); // Prevent duplicates within same import

      const normalizedCompany = contact.companyName?.toLowerCase().trim();
      const companyId = normalizedCompany ? companyIdMap.get(normalizedCompany) : null;

      contactsToInsert.push({
        user_id: userId,
        client_id: clientId || null,
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: emailToUse,
        phone: contact.businessPhone || null,
        title: contact.title || null,
        company_id: companyId,
        state: contact.state || null,
        country: contact.country || null,
        lead_status: 'new',
        lead_source: 'pdf_import',
        notes: contact.email ? null : 'Email was not provided in import - placeholder generated',
        custom_fields: {
          imported_at: new Date().toISOString(),
          original_company_name: contact.companyName,
          has_real_email: !!contact.email
        }
      });
    }

    console.log(`Preparing to insert ${contactsToInsert.length} contacts (skipped ${skippedDuplicate} duplicates, ${skippedNoEmail} without email)`);

    // Insert contacts in batches
    let contactsCreated = 0;
    const errors: string[] = [];

    for (let i = 0; i < contactsToInsert.length; i += BATCH_SIZE) {
      const batch = contactsToInsert.slice(i, i + BATCH_SIZE);
      const { data: insertedContacts, error: contactError } = await supabase
        .from('crm_contacts')
        .insert(batch)
        .select('id');

      if (contactError) {
        console.error('Error inserting contacts batch:', contactError);
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${contactError.message}`);
        continue;
      }

      contactsCreated += insertedContacts?.length || 0;
      console.log(`Inserted contact batch ${Math.floor(i / BATCH_SIZE) + 1}, total: ${contactsCreated}`);
    }

    console.log(`Created ${contactsCreated} contacts total`);

    // Queue contacts for embedding generation
    if (contactsCreated > 0) {
      await supabase
        .from('instincts_embedding_queue')
        .insert({ user_id: userId, status: 'pending' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalContactsParsed: contacts.length,
          uniqueCompanies: companiesMap.size,
          companiesCreated,
          companiesExisted: companiesMap.size - companiesCreated,
          contactsCreated,
          skippedDuplicates: skippedDuplicate,
          skippedNoEmail,
          errors: errors.length > 0 ? errors : undefined
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in import-contacts-pdf:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

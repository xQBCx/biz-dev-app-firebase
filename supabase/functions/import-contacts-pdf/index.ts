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
  confidence: number;
}

// Validation functions to filter garbage data
function isGarbageLine(line: string): boolean {
  const trimmed = line.trim();
  
  // Empty or too short
  if (trimmed.length < 3) return true;
  
  // Pure numbers (page numbers, IDs)
  if (/^\d+$/.test(trimmed)) return true;
  
  // PDF metadata patterns
  if (/^\/[A-Z]/.test(trimmed)) return true; // /Title, /Creator, etc.
  if (/Mac OS X/.test(trimmed)) return true;
  if (/PDF-\d+\.\d+/.test(trimmed)) return true;
  
  // Page markers
  if (/^page\s+\d+/i.test(trimmed)) return true;
  if (/^##\s*Page/i.test(trimmed)) return true;
  
  // Document/image references
  if (/parsed-documents:\/\//.test(trimmed)) return true;
  if (/^###\s*Images/.test(trimmed)) return true;
  
  // UUID-like strings (document IDs)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return true;
  
  // Lines that are mostly special characters or parentheses
  const specialCharRatio = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length / trimmed.length;
  if (specialCharRatio > 0.5) return true;
  
  // Lines with no alphabetic characters at all
  if (!/[a-zA-Z]/.test(trimmed)) return true;
  
  // Separator lines
  if (/^[\-=_\*]+$/.test(trimmed)) return true;
  
  // Header rows
  if (/First.*Name|Last.*Name|FirstName|LastName/i.test(trimmed) && 
      /Email|Phone|Company/i.test(trimmed)) return true;
  
  return false;
}

function calculateContactConfidence(contact: ContactRow): number {
  let score = 0;
  
  // Has valid-looking name (2+ chars, starts with letter)
  if (contact.firstName && contact.firstName.length >= 2 && /^[A-Za-z]/.test(contact.firstName)) {
    score += 25;
  }
  if (contact.lastName && contact.lastName.length >= 2 && /^[A-Za-z]/.test(contact.lastName)) {
    score += 25;
  }
  
  // Has valid email
  if (contact.email && /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(contact.email)) {
    score += 30;
  }
  
  // Has phone number
  if (contact.businessPhone && /\d{3}.*\d{3}.*\d{4}/.test(contact.businessPhone)) {
    score += 10;
  }
  
  // Has company name (reasonable length)
  if (contact.companyName && contact.companyName.length >= 3 && contact.companyName.length < 100) {
    score += 10;
  }
  
  return score;
}

function cleanText(text: string): string {
  return text
    .replace(/\./g, ' ')
    .replace(/</g, '-')
    .replace(/&/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseContactLine(line: string): ContactRow | null {
  const cleanedLine = line.trim();
  if (!cleanedLine || cleanedLine.length < 10) return null;
  
  // Extract email
  const emailMatch = cleanedLine.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].replace(/<$/, '').replace(/\.$/, '') : '';
  
  // Extract phone
  const phonePatterns = [
    /\((\d{3})\)[.\s]?(\d{3})[<\-.](\d{4})(\.?x\d+|x\d+)?/,
    /(\d{3})[.\-](\d{3})[.\-](\d{4})/,
    /\+?1?[.\-\s]?\((\d{3})\)[.\-\s]?(\d{3})[.\-\s]?(\d{4})/
  ];
  
  let phone = '';
  for (const pattern of phonePatterns) {
    const match = cleanedLine.match(pattern);
    if (match && match[1] && match[2] && match[3]) {
      phone = `(${match[1]}) ${match[2]}-${match[3]}${match[4] ? ` ${match[4].replace('.', '')}` : ''}`;
      break;
    }
  }
  
  // Split by multiple spaces, tabs, or pipes
  let parts = cleanedLine.split(/\s{2,}|\t+|\|/);
  if (parts.length < 3) {
    parts = cleanedLine.split(/\s+/);
  }
  parts = parts.map(p => cleanText(p)).filter(p => p.length > 0);
  
  if (parts.length < 2) return null;
  
  let firstName = parts[0] || '';
  let lastName = '';
  let companyName = '';
  let title = '';
  let state = '';
  let country = 'United States';
  
  // Get last name
  if (parts.length >= 2) {
    const secondPart = parts[1];
    if (secondPart && 
        secondPart.length < 30 && 
        !secondPart.includes(' ') &&
        !secondPart.includes('@') &&
        !/\d{3}/.test(secondPart) &&
        !secondPart.match(/Inc|LLC|Corp|Company|Ltd|Group/i)) {
      lastName = secondPart;
    } else {
      const nameMatch = firstName.match(/^(\w+)\s+(\w+)$/);
      if (nameMatch) {
        firstName = nameMatch[1];
        lastName = nameMatch[2];
      }
    }
  }
  
  // Find company and title
  for (let i = 2; i < parts.length; i++) {
    const part = parts[i];
    if (part.length > 5 && 
        !part.includes('@') && 
        !/^\(\d{3}\)/.test(part) &&
        !/^\d{3}[-.]/.test(part) &&
        !part.match(/^[A-Z]{2}$/) &&
        !part.match(/United States|Canada|France|Germany|UK|Australia/i)) {
      if (!companyName || (part.length > companyName.length && !part.match(/President|CEO|Director|Manager|VP|Executive|Engineer|Analyst/i))) {
        companyName = part;
      }
      if (part.match(/President|CEO|Director|Manager|VP|Vice|Executive|Chief|Officer|Head|Lead|Senior|Engineer|Analyst|Specialist|Consultant|Partner|Owner|Founder/i)) {
        title = part;
      }
    }
  }
  
  // Find state
  for (const part of parts) {
    if (/^[A-Z]{2}$/.test(part) && !part.match(/VP|HR|IT|UK|US/)) {
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
  
  if (!firstName) return null;
  
  if (!lastName && firstName.includes(' ')) {
    const nameParts = firstName.split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  }
  
  const contact: ContactRow = {
    firstName: firstName.substring(0, 100),
    lastName: (lastName || '').substring(0, 100),
    companyName: companyName.substring(0, 255) || '',
    businessPhone: phone,
    title: title.substring(0, 200) || '',
    email: email.substring(0, 255),
    state: state.substring(0, 100),
    country: country.substring(0, 100),
    confidence: 0
  };
  
  contact.confidence = calculateContactConfidence(contact);
  return contact;
}

function parseContactsFromText(text: string): ContactRow[] {
  const contacts: ContactRow[] = [];
  const lines = text.split('\n');
  
  console.log(`Processing ${lines.length} total lines`);
  
  for (const line of lines) {
    // Skip garbage lines
    if (isGarbageLine(line)) continue;
    
    const contact = parseContactLine(line);
    if (contact && contact.confidence >= 40) { // Only keep contacts with decent confidence
      contacts.push(contact);
    }
  }
  
  console.log(`Parsed ${contacts.length} valid contacts from text`);
  return contacts;
}

// AI-powered parsing
async function parseContactsWithAI(text: string, openaiKey: string): Promise<ContactRow[]> {
  console.log("Using AI to parse contacts...");
  
  // Pre-filter garbage lines
  const cleanedLines = text.split('\n').filter(line => !isGarbageLine(line));
  const cleanedText = cleanedLines.join('\n');
  
  console.log(`Filtered to ${cleanedLines.length} clean lines for AI processing`);
  
  const chunkSize = 100;
  const allContacts: ContactRow[] = [];
  
  for (let i = 0; i < cleanedLines.length; i += chunkSize) {
    const chunk = cleanedLines.slice(i, i + chunkSize).join('\n');
    
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
              content: `You are a data extraction expert. Extract ONLY real human contact information from the provided text.

CRITICAL: Do NOT extract:
- Page numbers or document IDs
- PDF metadata
- Random numbers or codes
- File paths or URLs
- Headers or column titles

Return a JSON array of contacts. Each contact should have:
- firstName: string (must be a real first name, not a number or code)
- lastName: string (must be a real last name)
- companyName: string
- businessPhone: string (format as (XXX) XXX-XXXX)
- title: string (job title)
- email: string
- state: string
- country: string (default to "United States" if US-based)
- confidence: number (0-100 based on data quality)

Only return valid JSON array, no other text. If no valid contacts found, return [].`
            },
            {
              role: 'user',
              content: `Extract real human contacts from this text:\n\n${chunk}`
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
      
      try {
        let jsonStr = content.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
        
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          // Filter by confidence
          const validContacts = parsed.filter((c: ContactRow) => 
            c.firstName && 
            c.firstName.length >= 2 && 
            /^[A-Za-z]/.test(c.firstName) &&
            (c.confidence ?? 50) >= 40
          );
          allContacts.push(...validContacts);
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

    const { parsedContent, userId, clientId, useAI = false, previewOnly = false } = await req.json();

    if (!parsedContent || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing parsedContent or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting import for user ${userId}, content length: ${parsedContent.length}, previewOnly: ${previewOnly}`);

    // Parse contacts
    let contacts: ContactRow[];
    
    if (useAI && openaiKey) {
      contacts = await parseContactsWithAI(parsedContent, openaiKey);
      console.log(`AI parsing returned ${contacts.length} contacts`);
      
      if (contacts.length < 5) {
        console.log("AI returned few results, trying regex parser...");
        const regexContacts = parseContactsFromText(parsedContent);
        if (regexContacts.length > contacts.length) {
          contacts = regexContacts;
        }
      }
    } else {
      contacts = parseContactsFromText(parsedContent);
    }

    // Filter out contacts without valid names or that look like garbage
    contacts = contacts.filter(c => {
      // Must have a real-looking first name
      if (!c.firstName || c.firstName.length < 2 || !/^[A-Za-z]/.test(c.firstName)) return false;
      // First name shouldn't be a number or ID
      if (/^\d+$/.test(c.firstName)) return false;
      // Confidence check
      if (c.confidence < 40) return false;
      return true;
    });

    console.log(`Final valid contact count: ${contacts.length}`);

    // If preview only, return the parsed contacts for user review
    if (previewOnly) {
      return new Response(
        JSON.stringify({
          success: true,
          preview: true,
          contacts: contacts.slice(0, 100), // Limit preview to 100
          totalCount: contacts.length,
          stats: {
            totalContactsParsed: contacts.length,
            withEmail: contacts.filter(c => c.email).length,
            withPhone: contacts.filter(c => c.businessPhone).length,
            withCompany: contacts.filter(c => c.companyName).length,
            avgConfidence: contacts.length > 0 
              ? Math.round(contacts.reduce((sum, c) => sum + c.confidence, 0) / contacts.length)
              : 0
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (contacts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No valid contacts could be parsed from the document. The file may contain unstructured data or the format is not recognized.",
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

    // Group contacts by company
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

    // Fetch existing companies
    const { data: existingCompanies } = await supabase
      .from('crm_companies')
      .select('id, name')
      .eq('user_id', userId);

    const existingCompanyMap = new Map<string, string>();
    for (const company of existingCompanies || []) {
      existingCompanyMap.set(company.name.toLowerCase().trim(), company.id);
    }

    // Fetch existing contacts by email
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

    // Create new companies
    const companyIdMap = new Map<string, string>();
    const newCompanies: any[] = [];

    for (const [normalizedName, contactsInCompany] of companiesMap) {
      if (existingCompanyMap.has(normalizedName)) {
        companyIdMap.set(normalizedName, existingCompanyMap.get(normalizedName)!);
      } else {
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
    }

    console.log(`Created ${companiesCreated} new companies`);

    // Create contacts - NO placeholder emails, only real data
    const contactsToInsert: any[] = [];
    let skippedDuplicate = 0;
    let skippedNoEmail = 0;

    for (const contact of contacts) {
      // Skip contacts without real email
      if (!contact.email) {
        skippedNoEmail++;
        continue;
      }
      
      // Skip if email already exists
      if (existingEmails.has(contact.email.toLowerCase())) {
        skippedDuplicate++;
        continue;
      }
      
      existingEmails.add(contact.email.toLowerCase());

      const normalizedCompany = contact.companyName?.toLowerCase().trim();
      const companyId = normalizedCompany ? companyIdMap.get(normalizedCompany) : null;

      contactsToInsert.push({
        user_id: userId,
        client_id: clientId || null,
        first_name: contact.firstName,
        last_name: contact.lastName || '',
        email: contact.email,
        phone: contact.businessPhone || null,
        title: contact.title || null,
        company_id: companyId,
        state: contact.state || null,
        country: contact.country || null,
        lead_status: 'new',
        lead_source: 'pdf_import',
        custom_fields: {
          imported_at: new Date().toISOString(),
          original_company_name: contact.companyName,
          import_confidence: contact.confidence
        }
      });
    }

    console.log(`Preparing to insert ${contactsToInsert.length} contacts (skipped ${skippedDuplicate} duplicates, ${skippedNoEmail} without email)`);

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
    }

    console.log(`Created ${contactsCreated} contacts total`);

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

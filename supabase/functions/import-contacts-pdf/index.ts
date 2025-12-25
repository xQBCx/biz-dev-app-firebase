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

function cleanPdfText(text: string): string {
  // PDF uses . for spaces and < for dashes
  return text
    .replace(/\./g, ' ')
    .replace(/</g, '-')
    .replace(/&/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseContactLine(line: string): ContactRow | null {
  // Skip header lines, empty lines, page markers
  if (!line.trim() || 
      line.includes('First&Name') || 
      line.includes('FirstName') ||
      line.includes('## Page') ||
      line.includes('### Images') ||
      line.includes('parsed-documents://') ||
      line.startsWith('#')) {
    return null;
  }

  // Extract email first (contains @)
  const emailMatch = line.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].replace(/<$/, '') : '';

  // Extract phone (format like (xxx).xxx<xxxx or (xxx).xxx-xxxx)
  const phoneMatch = line.match(/\((\d{3})\)[.\s]?(\d{3})[<-](\d{4})(\.x\d+|x\d+)?/);
  const phone = phoneMatch 
    ? `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}${phoneMatch[4] ? phoneMatch[4].replace('.', ' ') : ''}`
    : '';

  // Split by multiple spaces to get columns
  const parts = line.split(/\s{2,}/);
  
  if (parts.length < 3) return null;

  // First two parts are first and last name
  const firstName = cleanPdfText(parts[0] || '');
  const lastName = cleanPdfText(parts[1] || '');
  
  if (!firstName || !lastName) return null;

  // Third part is company name
  const companyName = cleanPdfText(parts[2] || '');

  // Find state and country from the end
  let state = '';
  let country = 'United States';
  
  const lastPart = parts[parts.length - 1]?.trim() || '';
  const secondLastPart = parts[parts.length - 2]?.trim() || '';

  // Check for country
  if (lastPart.includes('United') || lastPart.includes('States')) {
    country = 'United States';
    state = secondLastPart.length <= 20 ? cleanPdfText(secondLastPart) : '';
  } else if (lastPart === 'Canada') {
    country = 'Canada';
    state = cleanPdfText(secondLastPart);
  } else if (lastPart === 'France' || lastPart === 'Germany' || lastPart === 'UK' || lastPart === 'Australia' || lastPart === 'Uruguay' || lastPart.includes('Emirates')) {
    country = cleanPdfText(lastPart);
    state = cleanPdfText(secondLastPart);
  } else if (/^[A-Z]{2}$/.test(lastPart)) {
    // US state abbreviation
    state = lastPart;
    country = 'United States';
  }

  // Title is usually between phone and email, or after company
  let title = '';
  for (let i = 3; i < parts.length - 2; i++) {
    const part = parts[i];
    if (part && !part.match(/\(\d{3}\)/) && !part.includes('@') && part.length > 2) {
      // This might be the title
      const cleanedPart = cleanPdfText(part);
      if (cleanedPart.length > 2 && !cleanedPart.match(/^\d+$/)) {
        title = cleanedPart;
        break;
      }
    }
  }

  return {
    firstName,
    lastName,
    companyName,
    businessPhone: phone,
    title,
    email,
    state,
    country
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { parsedContent, userId, clientId } = await req.json();

    if (!parsedContent || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing parsedContent or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting import for user ${userId}`);

    // Parse all contact lines
    const lines = parsedContent.split('\n');
    const contacts: ContactRow[] = [];
    
    for (const line of lines) {
      const contact = parseContactLine(line);
      if (contact && contact.firstName && contact.lastName) {
        contacts.push(contact);
      }
    }

    console.log(`Parsed ${contacts.length} contacts from content`);

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
          address_state: firstContact.state || null,
          address_country: firstContact.country || null,
          source: 'pdf_import',
          metadata: { imported_at: new Date().toISOString(), employee_count: contactsInCompany.length }
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
      
      console.log(`Inserted company batch ${i / BATCH_SIZE + 1}, total: ${companiesCreated}`);
    }

    console.log(`Created ${companiesCreated} new companies`);

    // Now create contacts with company associations
    const contactsToInsert: any[] = [];
    let skippedDuplicate = 0;

    for (const contact of contacts) {
      // Skip if email already exists
      const emailToUse = contact.email || `${contact.firstName.toLowerCase().replace(/\s/g, '')}.${contact.lastName.toLowerCase().replace(/\s/g, '')}@imported.placeholder`;
      
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

    console.log(`Preparing to insert ${contactsToInsert.length} contacts (skipped ${skippedDuplicate} duplicates)`);

    // Insert contacts in batches
    let contactsCreated = 0;
    let errors: string[] = [];

    for (let i = 0; i < contactsToInsert.length; i += BATCH_SIZE) {
      const batch = contactsToInsert.slice(i, i + BATCH_SIZE);
      const { data: insertedContacts, error: contactError } = await supabase
        .from('crm_contacts')
        .insert(batch)
        .select('id');

      if (contactError) {
        console.error('Error inserting contacts batch:', contactError);
        errors.push(`Batch ${i / BATCH_SIZE + 1}: ${contactError.message}`);
        continue;
      }

      contactsCreated += insertedContacts?.length || 0;
      console.log(`Inserted contact batch ${i / BATCH_SIZE + 1}, total: ${contactsCreated}`);
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

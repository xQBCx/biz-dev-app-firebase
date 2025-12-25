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

function cleanText(text: string): string {
  // Clean up the weird PDF parsing artifacts
  return text
    .replace(/\./g, ' ')
    .replace(/</g, '-')
    .replace(/&/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseContactLine(line: string): ContactRow | null {
  // Skip header lines and empty lines
  if (!line.trim() || line.includes('First&Name') || line.includes('FirstName')) {
    return null;
  }
  
  // Split by multiple spaces (the PDF uses spacing for columns)
  const parts = line.split(/\s{2,}/);
  
  if (parts.length < 3) return null;
  
  // Try to extract email (contains @)
  let email = '';
  let emailIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].includes('@')) {
      email = parts[i].trim();
      emailIndex = i;
      break;
    }
  }
  
  // Try to extract phone (contains parentheses or dashes in specific pattern)
  let phone = '';
  let phoneIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (/\(\d{3}\)/.test(parts[i]) || /\d{3}[-<]\d{3}[-<]\d{4}/.test(parts[i])) {
      phone = parts[i].replace(/</g, '-').trim();
      phoneIndex = i;
      break;
    }
  }
  
  // Country is usually last (United States, Canada, etc.)
  const lastPart = parts[parts.length - 1]?.trim() || '';
  const secondLastPart = parts[parts.length - 2]?.trim() || '';
  
  let country = '';
  let state = '';
  
  if (lastPart.includes('United') || lastPart.includes('States') || lastPart.includes('Canada')) {
    country = cleanText(lastPart);
    state = secondLastPart.length <= 3 ? secondLastPart : '';
  } else if (lastPart.length <= 3 && /^[A-Z]{2,3}$/.test(lastPart)) {
    // It might be a state abbreviation
    state = lastPart;
    country = 'United States';
  }
  
  // First name is first, last name is second
  const firstName = cleanText(parts[0] || '');
  const lastName = cleanText(parts[1] || '');
  
  // Company name is third
  const companyName = cleanText(parts[2] || '');
  
  // Title is between phone and email typically
  let title = '';
  if (phoneIndex > 0 && phoneIndex + 1 < parts.length) {
    const titlePart = parts[phoneIndex + 1];
    if (titlePart && !titlePart.includes('@') && titlePart.length > 1) {
      title = cleanText(titlePart);
    }
  }
  
  if (!firstName || !lastName) return null;
  
  return {
    firstName,
    lastName,
    companyName,
    businessPhone: phone,
    title,
    email,
    state,
    country: country || 'United States'
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

    // Parse all contact lines
    const lines = parsedContent.split('\n');
    const contacts: ContactRow[] = [];
    
    for (const line of lines) {
      const contact = parseContactLine(line);
      if (contact) {
        contacts.push(contact);
      }
    }

    console.log(`Parsed ${contacts.length} contacts from PDF`);

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
        console.error('Error inserting companies:', companyError);
        continue;
      }

      for (const company of insertedCompanies || []) {
        companyIdMap.set(company.name.toLowerCase().trim(), company.id);
        companiesCreated++;
      }
    }

    console.log(`Created ${companiesCreated} new companies`);

    // Now create contacts with company associations
    const contactsToInsert: any[] = [];
    let skippedNoEmail = 0;

    for (const contact of contacts) {
      // Email is required - generate a placeholder if missing
      const email = contact.email || `${contact.firstName.toLowerCase()}.${contact.lastName.toLowerCase()}@placeholder.import`;
      
      const normalizedCompany = contact.companyName?.toLowerCase().trim();
      const companyId = normalizedCompany ? companyIdMap.get(normalizedCompany) : null;

      contactsToInsert.push({
        user_id: userId,
        client_id: clientId || null,
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: email,
        phone: contact.businessPhone || null,
        title: contact.title || null,
        company_id: companyId,
        state: contact.state || null,
        country: contact.country || null,
        lead_status: 'new',
        lead_source: 'pdf_import',
        notes: contact.email ? null : 'Email was not provided in import - needs update',
        custom_fields: {
          imported_at: new Date().toISOString(),
          original_company_name: contact.companyName,
          has_real_email: !!contact.email
        }
      });
    }

    // Insert contacts in batches
    let contactsCreated = 0;

    for (let i = 0; i < contactsToInsert.length; i += BATCH_SIZE) {
      const batch = contactsToInsert.slice(i, i + BATCH_SIZE);
      const { data: insertedContacts, error: contactError } = await supabase
        .from('crm_contacts')
        .insert(batch)
        .select('id');

      if (contactError) {
        console.error('Error inserting contacts:', contactError);
        continue;
      }

      contactsCreated += insertedContacts?.length || 0;
    }

    console.log(`Created ${contactsCreated} contacts`);

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
          contactsCreated
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

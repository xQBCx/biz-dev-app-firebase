# Feature: SmartLink Property Intake

## Intent
Enable property managers and real estate professionals to bulk import property data through CSV uploads. This delivers time-saving automation and reduces manual data entry errors, allowing users to quickly onboard multiple properties into the system for management and tracking.

## Happy Path

1. User navigates to SmartLink Property Intake page
2. User clicks "Upload CSV" button
3. System opens file picker dialog
4. User selects a valid property CSV file (with columns: address, city, state, zip, bedrooms, bathrooms, sqft, price, status)
5. System validates CSV structure and data types
6. System displays preview of parsed properties in a data table
7. User reviews the properties and clicks "Import Properties"
8. System creates database records for each property
9. System displays success message with count of imported properties
10. User sees imported properties in their property list

## Acceptance Criteria

### AC1: CSV File Upload and Validation
- User can select and upload CSV files only (reject other file types)
- System validates required columns are present: address, city, state, zip
- System validates data types (numeric for bedrooms, bathrooms, sqft, price)
- System displays clear error messages for invalid files or missing columns
- Maximum file size is 5MB
- Maximum 1000 properties per upload

### AC2: Data Preview Before Import
- System displays parsed CSV data in a sortable, filterable table
- User can see all columns and values before importing
- Invalid rows are highlighted with error descriptions
- User can remove invalid rows from preview
- Import button is disabled if any errors exist (or all errors are removed)

### AC3: Database Import and Persistence
- Each valid property creates a record in the `properties` table
- Property records are associated with the authenticated user's ID
- Duplicate addresses (same address + city + zip) are rejected with a warning
- Import operation is atomic (all or nothing if critical failure)
- Success message displays count: "Successfully imported X properties"
- Imported properties immediately appear in user's property list

### AC4: Import History and Tracking
- System logs each import with timestamp, filename, and record count
- User can view import history with success/failure status
- Failed imports show error summary
- User can download error report CSV for failed rows

## Edge Cases

### Network and File Issues
- **Large file upload timeout**: Show progress indicator, allow retry
- **Corrupted CSV file**: Display "Unable to parse file" error with format guide link
- **Network failure during import**: Rollback transaction, show retry option
- **Partial upload**: If connection drops, allow resume or restart

### Data Validation Errors
- **Missing required fields**: Highlight rows with missing data, show error count
- **Invalid data types**: Flag non-numeric values in numeric columns
- **Invalid state codes**: Reject state values not in valid US state list
- **Negative values**: Reject negative bedrooms, bathrooms, sqft, or price
- **Future dates**: Warn if dates are in the future (if date fields exist)

### Duplicate and Conflict Handling
- **Exact duplicate addresses**: Skip and report as warnings (not errors)
- **Case sensitivity**: Normalize addresses to prevent case-based duplicates
- **Whitespace differences**: Trim whitespace before duplicate checking

### Permission and Access Issues
- **Unauthenticated user**: Redirect to login page
- **User without import permission**: Show "Access Denied" message
- **Quota exceeded**: Block import if user has reached property limit, show upgrade prompt

### Concurrent Operations
- **Multiple simultaneous uploads**: Queue imports and process sequentially
- **Import while viewing list**: Real-time update property list when import completes

## Technical Notes

### Technology Stack
- **Frontend**: React with react-dropzone for file uploads
- **CSV Parsing**: PapaParse or csv-parse library
- **Validation**: Zod schema validation for data types
- **Database**: Supabase `properties` table with RLS policies
- **File Storage**: Temp storage in browser memory (no server-side file storage needed)

### Database Schema
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  sqft INTEGER,
  price DECIMAL(12,2),
  status TEXT CHECK (status IN ('available', 'pending', 'sold', 'rented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address, city, zip)
);

CREATE TABLE import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  successful_rows INTEGER NOT NULL,
  failed_rows INTEGER NOT NULL,
  status TEXT CHECK (status IN ('success', 'partial', 'failed')),
  error_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints
- `POST /api/properties/import` - Bulk insert properties
- `GET /api/properties/import-history` - Fetch import logs

### Security Considerations
- CSV files are parsed client-side to avoid server load
- File size limit enforced before upload
- RLS policies ensure users only see their own properties
- SQL injection prevention through parameterized queries
- Rate limiting on import endpoint (max 5 imports per minute)

### Performance Requirements
- CSV parsing completes within 2 seconds for 1000 rows
- Database import completes within 5 seconds for 1000 records
- UI remains responsive during upload/import
- Progress indicator updates every 100 records

### Browser/Device Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Desktop and tablet (mobile upload discouraged due to UX)

## Related Features

- [CRM Contact Management](./crm-contacts.md) - Properties may be linked to CRM contacts
- [Property Portfolio Dashboard](./property-dashboard.md) - Imported properties appear here

## Success Metrics

- 95% of valid CSV files import without errors
- Average import time for 100 properties < 3 seconds
- < 5% of imports require customer support intervention
- User satisfaction score > 4.2/5 for import experience

## Open Questions

- [ ] Should we support Excel (.xlsx) files in addition to CSV?
- [ ] Do we need property image uploads in the same flow or separate?
- [ ] Should duplicate handling allow "update existing" option vs. reject?
- [ ] Is there a need for scheduled/automated imports via email or API?

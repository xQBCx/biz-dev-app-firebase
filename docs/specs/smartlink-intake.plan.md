# Test Plan: SmartLink Property Intake

## Test Scope
This plan covers end-to-end testing of the SmartLink Property Intake feature, including CSV file upload, validation, data preview, and database import functionality.

**Features Under Test:**
- CSV file selection and upload
- Data validation (structure, types, required fields)
- Data preview table with error highlighting
- Bulk database import
- Import history tracking
- Error handling and user feedback

**Out of Scope:**
- Manual property entry (separate feature)
- Property editing after import
- Property deletion
- API-based imports

## Test Environment

**Base URL:** `http://localhost:5173` (local dev) or `PLAYWRIGHT_BASE_URL` (CI)

**Test Routes:**
- `/smartlink/intake` - Main upload page
- `/properties` - Property list view
- `/smartlink/history` - Import history page

**Prerequisites:**
- Supabase backend running with `properties` and `import_history` tables
- Test user account with `property_manager` or `admin` role
- RLS policies enabled for properties table
- Sample CSV files in `tests/e2e/fixtures/` directory

## Test Data Setup

### Required Test User
- **Email:** `test-property-manager@example.com`
- **Password:** `TestPass123!`
- **Role:** `property_manager`

### Sample CSV Files (in `tests/e2e/fixtures/`)

**1. `valid-properties.csv`** (Happy path)
```csv
address,city,state,zip,bedrooms,bathrooms,sqft,price,status
123 Main St,Springfield,IL,62701,3,2.0,1500,250000,available
456 Oak Ave,Chicago,IL,60601,4,3.5,2200,450000,pending
789 Elm Dr,Peoria,IL,61602,2,1.0,900,150000,available
```

**2. `invalid-structure.csv`** (Missing required columns)
```csv
address,city,bedrooms
123 Main St,Springfield,3
```

**3. `invalid-data-types.csv`** (Wrong data types)
```csv
address,city,state,zip,bedrooms,bathrooms,sqft,price,status
123 Main St,Springfield,IL,62701,three,two,large,expensive,maybe
```

**4. `duplicate-addresses.csv`** (Contains duplicate)
```csv
address,city,state,zip,bedrooms,bathrooms,sqft,price,status
123 Main St,Springfield,IL,62701,3,2.0,1500,250000,available
123 Main St,Springfield,IL,62701,3,2.0,1500,250000,available
```

**5. `large-file.csv`** (1000+ rows for performance testing)
- Generate programmatically with random property data

**6. `empty-file.csv`** (Empty or only headers)
```csv
address,city,state,zip,bedrooms,bathrooms,sqft,price,status
```

### Database Setup (Before Tests)
```sql
-- Clean test data
DELETE FROM properties WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-property-manager@example.com');
DELETE FROM import_history WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-property-manager@example.com');
```

## Test Cases

### TC1: Navigation to SmartLink Intake Page
**Intent:** Verify authenticated user can access the property intake page

**Steps:**
1. Sign in as test property manager
2. Navigate to `/smartlink/intake`
3. Verify page loads with upload interface

**Expected Results:**
- Page displays "SmartLink Property Intake" heading
- "Upload CSV" button is visible and enabled
- No error messages displayed

**Acceptance Criteria:** AC1

---

### TC2: Upload Valid CSV File (Happy Path)
**Intent:** Verify successful upload and import of valid property data

**Steps:**
1. Navigate to SmartLink intake page
2. Click "Upload CSV" button
3. Select `valid-properties.csv` file
4. Verify data preview displays all 3 properties
5. Click "Import Properties" button
6. Wait for success message

**Expected Results:**
- All 3 properties displayed in preview table
- No validation errors shown
- Success message: "Successfully imported 3 properties"
- Properties appear in database and property list

**Acceptance Criteria:** AC1, AC2, AC3

---

### TC3: Reject Invalid File Type
**Intent:** Verify system only accepts CSV files

**Steps:**
1. Navigate to intake page
2. Attempt to upload a `.txt` or `.pdf` file
3. Observe error message

**Expected Results:**
- File picker only allows `.csv` selection (or shows error after selection)
- Error message: "Invalid file type. Please upload a CSV file."
- Import button remains disabled

**Acceptance Criteria:** AC1

---

### TC4: Validate Required Columns
**Intent:** Verify CSV must contain required columns

**Steps:**
1. Upload `invalid-structure.csv` (missing state, zip columns)
2. Observe validation error

**Expected Results:**
- Error message: "Missing required columns: state, zip"
- No data preview shown
- Import button disabled

**Acceptance Criteria:** AC1

---

### TC5: Validate Data Types
**Intent:** Verify invalid data types are flagged

**Steps:**
1. Upload `invalid-data-types.csv`
2. Observe validation errors in preview

**Expected Results:**
- Rows with errors highlighted in red
- Error descriptions shown per row:
  - "bedrooms: must be a number"
  - "bathrooms: must be a number"
  - "sqft: must be a number"
  - "price: must be a number"
- Import button disabled while errors exist

**Acceptance Criteria:** AC1, AC2

---

### TC6: Handle Duplicate Addresses
**Intent:** Verify duplicate properties are detected and skipped

**Steps:**
1. Upload `duplicate-addresses.csv`
2. Review warnings in preview
3. Click "Import Properties"
4. Verify only 1 property imported

**Expected Results:**
- Warning message: "1 duplicate address found and will be skipped"
- Success message: "Successfully imported 1 property (1 duplicate skipped)"
- Only 1 property in database

**Acceptance Criteria:** AC3

---

### TC7: Empty CSV File Handling
**Intent:** Verify empty files are rejected gracefully

**Steps:**
1. Upload `empty-file.csv`
2. Observe error message

**Expected Results:**
- Error message: "CSV file is empty or contains no data rows"
- Import button disabled

**Acceptance Criteria:** AC1

---

### TC8: File Size Limit Enforcement
**Intent:** Verify files over 5MB are rejected

**Steps:**
1. Create a CSV file larger than 5MB
2. Attempt to upload
3. Observe error message

**Expected Results:**
- Error message: "File size exceeds 5MB limit"
- Upload rejected

**Acceptance Criteria:** AC1

---

### TC9: Maximum Row Limit (1000 Properties)
**Intent:** Verify imports are limited to 1000 rows

**Steps:**
1. Upload `large-file.csv` with 1001 rows
2. Observe warning or truncation

**Expected Results:**
- Warning: "File contains 1001 rows. Only first 1000 will be imported."
- Preview shows 1000 rows
- Import processes 1000 properties

**Acceptance Criteria:** AC1

---

### TC10: Data Preview Table Functionality
**Intent:** Verify preview table displays data correctly

**Steps:**
1. Upload valid CSV with 10 properties
2. Inspect preview table

**Expected Results:**
- All columns visible (address, city, state, zip, bedrooms, bathrooms, sqft, price, status)
- All 10 rows displayed
- Table is scrollable if needed
- Data matches CSV content

**Acceptance Criteria:** AC2

---

### TC11: Remove Invalid Rows from Preview
**Intent:** Verify user can remove rows with errors

**Steps:**
1. Upload CSV with 2 valid and 1 invalid row
2. Click "Remove" button on invalid row
3. Click "Import Properties"

**Expected Results:**
- Invalid row removed from preview
- Import button becomes enabled
- Only 2 valid properties imported

**Acceptance Criteria:** AC2

---

### TC12: Import History Tracking
**Intent:** Verify import is logged in history

**Steps:**
1. Upload and import valid CSV
2. Navigate to `/smartlink/history`
3. Verify import record exists

**Expected Results:**
- History table shows import record with:
  - Filename: `valid-properties.csv`
  - Date/time
  - Total rows: 3
  - Successful: 3
  - Failed: 0
  - Status: "success"

**Acceptance Criteria:** AC4

---

### TC13: Import with Partial Failures
**Intent:** Verify partial imports are tracked correctly

**Steps:**
1. Upload CSV with 2 valid and 1 invalid row
2. Remove invalid row
3. Import remaining 2
4. Check history

**Expected Results:**
- Import history shows:
  - Total rows: 3
  - Successful: 2
  - Failed: 1
  - Status: "partial"
  - Error summary includes invalid row details

**Acceptance Criteria:** AC4

---

### TC14: Unauthenticated Access Prevention
**Intent:** Verify unauthenticated users cannot access intake page

**Steps:**
1. Sign out
2. Navigate to `/smartlink/intake`

**Expected Results:**
- Redirected to `/auth` login page
- Toast message: "Please sign in to access this page"

**Acceptance Criteria:** AC1

---

### TC15: Performance Test (1000 Rows)
**Intent:** Verify large imports complete within performance requirements

**Steps:**
1. Upload `large-file.csv` with 1000 rows
2. Measure parsing time
3. Click import and measure total time

**Expected Results:**
- CSV parsing completes < 2 seconds
- Database import completes < 5 seconds
- UI remains responsive (no freezing)
- Success message displays final count

**Acceptance Criteria:** AC1, AC3

---

### TC16: Progress Indicator During Import
**Intent:** Verify user sees progress feedback during import

**Steps:**
1. Upload large CSV (500+ rows)
2. Click "Import Properties"
3. Observe progress indicator

**Expected Results:**
- Loading spinner or progress bar displays
- Import button shows "Importing..." text and is disabled
- Progress updates (if supported)
- Success message appears when complete

**Acceptance Criteria:** AC3

---

### TC17: Network Failure During Import
**Intent:** Verify graceful handling of network errors

**Steps:**
1. Upload valid CSV
2. Disable network (simulate offline)
3. Click "Import Properties"
4. Observe error handling

**Expected Results:**
- Error message: "Import failed. Please check your connection and retry."
- Retry button displayed
- No partial data saved (transaction rollback)

**Acceptance Criteria:** AC3

---

### TC18: Concurrent Upload Prevention
**Intent:** Verify multiple simultaneous uploads are queued

**Steps:**
1. Start uploading first CSV
2. Immediately attempt second upload
3. Observe behavior

**Expected Results:**
- Second upload queued or blocked
- Message: "Import in progress. Please wait..."
- Second upload allowed after first completes

**Acceptance Criteria:** AC3

---

### TC19: Property List Real-Time Update
**Intent:** Verify imported properties appear immediately in list

**Steps:**
1. Open property list in one tab
2. Import properties in another tab
3. Check property list updates

**Expected Results:**
- Imported properties appear in list without manual refresh
- Property count updates
- Newest properties shown first (if sorted by date)

**Acceptance Criteria:** AC3

---

### TC20: Download Error Report
**Intent:** Verify user can download CSV of failed rows

**Steps:**
1. Upload CSV with 5 rows (2 invalid)
2. Import (only 3 succeed)
3. Click "Download Error Report" link in history

**Expected Results:**
- CSV file downloads with filename `import-errors-<timestamp>.csv`
- Contains 2 rows (the failed ones)
- Includes error description column

**Acceptance Criteria:** AC4

---

## Success Criteria

**Critical Tests (Must Pass):**
- TC2: Upload Valid CSV (Happy Path)
- TC3: Reject Invalid File Type
- TC4: Validate Required Columns
- TC6: Handle Duplicate Addresses
- TC14: Unauthenticated Access Prevention

**High Priority (Should Pass):**
- TC5: Validate Data Types
- TC10: Data Preview Table
- TC12: Import History Tracking
- TC17: Network Failure Handling

**Nice-to-Have (Can Defer):**
- TC15: Performance Test
- TC18: Concurrent Upload Prevention
- TC20: Download Error Report

## Failure Reporting

For each failed test, capture:
1. **Screenshot** of error state
2. **Console logs** (browser dev tools)
3. **Network requests** (especially import API call)
4. **Database state** (query properties table)
5. **Steps to reproduce** (from test case)

Save to: `tests/e2e/reports/smartlink-intake-<timestamp>.md`

## Maintenance Notes

- Update sample CSVs if property schema changes
- Add new test cases for any new validation rules
- Re-run performance tests if database grows significantly
- Update RLS policies test if permissions model changes

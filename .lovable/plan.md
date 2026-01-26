
# Plan: Add "Owner" Role to Partner Team Invite Form

## Overview

A simple UI fix to add the "Owner" role option to the Partner Team Manager invite form. This will allow you to invite Peter as an Owner of Optimo IT so he can manage his own team members.

---

## The Change

**File:** `src/components/partner/PartnerTeamManager.tsx`

Update the role selection dropdown (lines 261-280) to include the "Owner" option at the top of the list.

### Current Code (lines 261-280):
```text
<SelectContent>
  <SelectItem value="admin">
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      Admin - Can manage team
    </div>
  </SelectItem>
  <SelectItem value="engineer">
    <div className="flex items-center gap-2">
      <Code className="h-4 w-4" />
      Engineer - Can use API
    </div>
  </SelectItem>
  <SelectItem value="viewer">
    <div className="flex items-center gap-2">
      <Eye className="h-4 w-4" />
      Viewer - Read-only access
    </div>
  </SelectItem>
</SelectContent>
```

### Updated Code:
```text
<SelectContent>
  <SelectItem value="owner">
    <div className="flex items-center gap-2">
      <Crown className="h-4 w-4" />
      Owner - Full access and ownership
    </div>
  </SelectItem>
  <SelectItem value="admin">
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      Admin - Can manage team
    </div>
  </SelectItem>
  <SelectItem value="engineer">
    <div className="flex items-center gap-2">
      <Code className="h-4 w-4" />
      Engineer - Can use API
    </div>
  </SelectItem>
  <SelectItem value="viewer">
    <div className="flex items-center gap-2">
      <Eye className="h-4 w-4" />
      Viewer - Read-only access
    </div>
  </SelectItem>
</SelectContent>
```

Also add `Crown` to the lucide-react import on line 34.

---

## Role Hierarchy

After this change, the available roles will be:

| Role | Description | Typical Use |
|------|-------------|-------------|
| Owner | Full ownership and control | Peter (partner principal) |
| Admin | Can manage team members | Senior partner staff |
| Engineer | Can use API, view docs/logs | Implementers like George |
| Viewer | Read-only access | Observers, auditors |

---

## After Implementation

1. Go to **Admin Panel** > **Partner API** tab
2. Find "Optimo IT" and click "Manage Team"
3. Click **Invite Member**
4. Enter Peter's email (`peter@optimoit.io`)
5. Select **Owner** from the role dropdown
6. Send the invitation

Once Peter accepts, he will have full access to manage his own team in the Partner Portal "My Team" tab.

# GroupBy Hierarchy API Documentation

## Overview

The GroupBy model now supports unlimited hierarchical structures for organizing emissions data. This allows you to create organizational structures like:

```
HQ → Subsidiary → Branch → Department → ...
```

Each group can have:
- One parent (or null for root groups)
- Multiple children
- Automatic depth tracking
- Circular reference prevention

---

## Core Concepts

### Hierarchy Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `name` | string | Group name (must be unique) |
| `parentId` | number \| null | Reference to parent group (null = root) |
| `level` | string | Organizational level: `hq`, `subsidiary`, `branch`, `department` |
| `depth` | number | Tree depth (0 = root, 1 = first level, etc.) |
| `status` | string | `active` or `inactive` |

### Key Rules

1. **Auto-Depth Calculation**: `depth` is automatically calculated based on parent
2. **Circular Prevention**: Cannot move a group to be its own descendant
3. **Cascade Delete**: Deleting a parent deletes all children
4. **Unique Names**: Group names must be unique across the tenant

---

## Authentication

All endpoints require authentication via JWT Bearer token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**Get Token**: Login via `POST /api/users/login`

---

## API Endpoints

### 1. Create Group

Create a new group in the hierarchy.

**Endpoint:** `POST /api/group-by`

**Request Body:**
```json
{
  "name": "New Subsidiary A",
  "parentId": 1,          // Optional: null or omit for root group
  "level": "subsidiary",   // hq | subsidiary | branch | department
  "status": "active"      // active | inactive
}
```

**Note:** Do NOT include `depth` - it's auto-calculated.

**Response:**
```json
{
  "id": 10,
  "name": "New Subsidiary A",
  "status": "active",
  "parentId": 1,
  "level": "subsidiary",
  "depth": 1
}
```

**Example:**
```bash
# Create root HQ
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HQ Malaysia",
    "level": "hq",
    "status": "active"
  }'

# Create subsidiary under HQ (id: 1)
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Subsidiary Penang",
    "parentId": 1,
    "level": "subsidiary",
    "status": "active"
  }'
```

---

### 2. Get Hierarchical Tree

Get the full hierarchical tree structure with nested children.

**Endpoint:** `GET /api/group-by/tree`

**Query Parameters:**
- `rootId` (optional): Get subtree starting from specific group

**Response:**
```json
[
  {
    "id": 1,
    "name": "HQ Malaysia",
    "level": "hq",
    "depth": 0,
    "parentId": null,
    "status": "active",
    "children": [
      {
        "id": 2,
        "name": "Subsidiary Penang",
        "level": "subsidiary",
        "depth": 1,
        "parentId": 1,
        "status": "active",
        "children": [
          {
            "id": 3,
            "name": "Branch Production",
            "level": "branch",
            "depth": 2,
            "parentId": 2,
            "status": "active"
          }
        ]
      }
    ]
  }
]
```

**Examples:**
```bash
# Get full tree
curl -X GET http://localhost:4000/api/group-by/tree \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get subtree from specific group
curl -X GET "http://localhost:4000/api/group-by/tree?rootId=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Use Cases:**
- Frontend tree components
- Organizational charts
- Navigation menus

---

### 3. Get Immediate Children

Get only the direct children of a group (not recursive).

**Endpoint:** `GET /api/group-by/:id/children`

**Response:**
```json
[
  {
    "id": 2,
    "name": "Subsidiary Penang",
    "level": "subsidiary",
    "depth": 1,
    "parentId": 1,
    "status": "active"
  },
  {
    "id": 3,
    "name": "Subsidiary Johor",
    "level": "subsidiary",
    "depth": 1,
    "parentId": 1,
    "status": "active"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:4000/api/group-by/1/children \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Use Cases:**
- Expand/collapse tree nodes
- Show only next level
- Lazy loading in UI

---

### 4. Get All Descendants

Get all descendant group IDs recursively (children, grandchildren, etc.).

**Endpoint:** `GET /api/group-by/:id/descendants`

**Response:**
```json
{
  "groupId": 1,
  "descendantIds": [2, 3, 4, 5, 6]
}
```

**Example:**
```bash
curl -X GET http://localhost:4000/api/group-by/1/descendants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Use Cases:**
- Access control validation
- Bulk operations on all descendants
- Emission data aggregation
- Calculate totals including sub-groups

---

### 5. Get Ancestors

Get all ancestor group IDs (parent chain up to root).

**Endpoint:** `GET /api/group-by/:id/ancestors`

**Response:**
```json
{
  "groupId": 5,
  "ancestorIds": [3, 2, 1]
}
```

Order: Immediate parent → ... → Root

**Example:**
```bash
curl -X GET http://localhost:4000/api/group-by/5/ancestors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Use Cases:**
- Breadcrumb navigation
- Permission inheritance checks
- Path to root display

---

### 6. Get Siblings

Get groups at the same level (same parent).

**Endpoint:** `GET /api/group-by/:id/siblings`

**Response:**
```json
[
  {
    "id": 3,
    "name": "Subsidiary Johor",
    "level": "subsidiary",
    "depth": 1,
    "parentId": 1,
    "status": "active"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:4000/api/group-by/2/siblings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Use Cases:**
- Show related groups
- Access control (prevent sibling access)
- Compare peer organizations

---

### 7. Move Group to New Parent

Move a group (and all its descendants) to a new parent.

**Endpoint:** `PATCH /api/group-by/:id/move`

**Request Body:**
```json
{
  "newParentId": 2  // Use null to move to root level
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group moved successfully to parent 2",
  "group": {
    "id": 4,
    "name": "Branch Production",
    "status": "active",
    "parentId": 2,
    "level": "branch",
    "depth": 2
  }
}
```

**Features:**
- ✅ Validates circular references (prevents moving to own descendant)
- ✅ Auto-updates depth for group and all descendants
- ✅ Returns updated group

**Examples:**
```bash
# Move group 4 to be under group 2
curl -X PATCH http://localhost:4000/api/group-by/4/move \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": 2}'

# Move group to root level
curl -X PATCH http://localhost:4000/api/group-by/4/move \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": null}'
```

**Error Cases:**
```json
// Circular reference
{
  "error": {
    "statusCode": 400,
    "message": "Cannot move group to its own descendant (circular reference)"
  }
}

// Self-parent
{
  "error": {
    "statusCode": 400,
    "message": "Group cannot be its own parent"
  }
}
```

---

### 8. Get Single Group

Get details of a specific group.

**Endpoint:** `GET /api/group-by/:id`

**Response:**
```json
{
  "id": 1,
  "name": "HQ Malaysia",
  "status": "active",
  "parentId": null,
  "level": "hq",
  "depth": 0
}
```

**Example:**
```bash
curl -X GET http://localhost:4000/api/group-by/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 9. List All Groups

Get all groups (flat list, not hierarchical).

**Endpoint:** `GET /api/group-by`

**Query Parameters:** Supports LoopBack filters

**Response:**
```json
[
  {
    "id": 1,
    "name": "HQ Malaysia",
    "status": "active",
    "parentId": null,
    "level": "hq",
    "depth": 0
  },
  {
    "id": 2,
    "name": "Subsidiary Penang",
    "status": "active",
    "parentId": 1,
    "level": "subsidiary",
    "depth": 1
  }
]
```

**Example:**
```bash
# Get all groups
curl -X GET http://localhost:4000/api/group-by \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter active groups only
curl -X GET "http://localhost:4000/api/group-by?filter[where][status]=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 10. Update Group

Update group properties.

**Endpoint:** `PATCH /api/group-by/:id`

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "inactive",
  "level": "branch"
}
```

**Note:** To change `parentId`, use the `/move` endpoint instead.

**Example:**
```bash
curl -X PATCH http://localhost:4000/api/group-by/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HQ Malaysia (Updated)",
    "status": "active"
  }'
```

---

### 11. Delete Group

Delete a group (and all its descendants due to CASCADE).

**Endpoint:** `DELETE /api/group-by/:id`

**Response:** 204 No Content

**Warning:** This will delete ALL children recursively!

**Example:**
```bash
curl -X DELETE http://localhost:4000/api/group-by/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 12. Optimized List (Paginated)

Get paginated list with search and sorting.

**Endpoint:** `GET /api/group-by/optimize`

**Query Parameters:**
- `pageIndex`: Page number (default: 0)
- `pageSize`: Items per page (default: 10)
- `q`: Search query (searches in name)
- `sorting`: Sort configuration

**Response:**
```json
{
  "rows": [
    {
      "id": 1,
      "name": "HQ Malaysia",
      "status": "active"
    }
  ],
  "rowCount": 1
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/group-by/optimize?pageIndex=0&pageSize=10&q=HQ" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changes to Existing Endpoints

### Modified Endpoints

#### `POST /api/group-by` (Create)

**BEFORE:**
```json
{
  "name": "Group Name",
  "status": "active",
  "depth": 0  // ❌ Required field
}
```

**AFTER:**
```json
{
  "name": "Group Name",
  "parentId": 1,     // ✨ NEW: Optional, null for root
  "level": "subsidiary", // ✨ NEW: Required
  "status": "active"
  // depth is AUTO-CALCULATED ✅
}
```

**Changes:**
- ✅ Added `parentId` field (optional)
- ✅ Added `level` field (required)
- ✅ `depth` is now auto-calculated, not required
- ✅ Validates parent exists
- ✅ Auto-sets depth based on parent

---

### No Endpoints Removed

All existing endpoints remain functional. We only **added** new hierarchy endpoints.

---

## Access Control

### Role-Based Permissions

| Role | Can Create | Can View | Can Edit | Can Delete | Can Move |
|------|-----------|----------|----------|-----------|----------|
| **Superadmin (GHG Gate)** | All groups | All groups | All groups | All groups | All groups |
| **Admin HQ** | Descendants only | Own + Descendants | Own + Descendants | Own + Descendants | Own + Descendants |
| **Admin Subsidiary** | Own descendants | Own + Descendants | Own + Descendants | Own + Descendants | Own descendants |
| **Member** | Assigned only | Assigned only | Assigned only | Assigned only | No |
| **Guest** | No | Assigned only (read) | No | No | No |

### Hierarchy-Aware Access

**Admin HQ Example:**
- Assigned to: HQ Malaysia (id: 1)
- Can access: All subsidiaries and branches under HQ Malaysia
- Cannot access: Other root HQs or their subsidiaries

**Admin Subsidiary Example:**
- Assigned to: Subsidiary Penang (id: 2)
- Can access: Only Subsidiary Penang and its branches
- Cannot access: Sibling subsidiaries (e.g., Subsidiary Johor)
- Cannot access: Parent HQ

---

## Common Use Cases

### 1. Build Organization Chart

```bash
# Step 1: Create HQ
POST /api/group-by
{ "name": "HQ Malaysia", "level": "hq", "status": "active" }
# Returns: { "id": 1, "depth": 0 }

# Step 2: Create Subsidiaries
POST /api/group-by
{ "name": "Subsidiary Penang", "parentId": 1, "level": "subsidiary", "status": "active" }
# Returns: { "id": 2, "depth": 1 }

POST /api/group-by
{ "name": "Subsidiary Johor", "parentId": 1, "level": "subsidiary", "status": "active" }
# Returns: { "id": 3, "depth": 1 }

# Step 3: Create Branch
POST /api/group-by
{ "name": "Branch Production", "parentId": 2, "level": "branch", "status": "active" }
# Returns: { "id": 4, "depth": 2 }

# Step 4: View Tree
GET /api/group-by/tree
```

---

### 2. Reorganize Structure

```bash
# Move "Branch Production" from Subsidiary Penang to Subsidiary Johor
PATCH /api/group-by/4/move
{ "newParentId": 3 }

# Verify
GET /api/group-by/4
# Returns: { "id": 4, "parentId": 3, "depth": 2 }
```

---

### 3. Check User Access

```bash
# Get all descendants of user's assigned group
GET /api/group-by/1/descendants
# Returns: { "groupId": 1, "descendantIds": [2, 3, 4] }

# Use these IDs to filter emissions
GET /api/emission-scope-1-stationary-combustion?filter[where][groupById][inq]=[1,2,3,4]
```

---

### 4. Display Breadcrumb

```bash
# User is viewing "Branch Production" (id: 4)
GET /api/group-by/4/ancestors
# Returns: { "ancestorIds": [2, 1] }

# Fetch ancestor details
GET /api/group-by?filter[where][id][inq]=[1,2]

# Display: HQ Malaysia > Subsidiary Penang > Branch Production
```

---

## Error Handling

### Common Errors

**400 Bad Request - Invalid Parent:**
```json
{
  "error": {
    "statusCode": 400,
    "message": "Parent group not found"
  }
}
```

**400 Bad Request - Circular Reference:**
```json
{
  "error": {
    "statusCode": 400,
    "message": "Cannot move group to its own descendant (circular reference)"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "statusCode": 401,
    "message": "Error verifying token : jwt malformed"
  }
}
```

**403 Forbidden - Access Denied:**
```json
{
  "error": {
    "statusCode": 403,
    "message": "Inaccessible Group - Subsidiary Admin can only access own subsidiary and its children"
  }
}
```

**403 Forbidden - Max Groups:**
```json
{
  "error": {
    "statusCode": 403,
    "message": "Sorry you have reached maximum number of groups. Please reach out to admin"
  }
}
```

**422 Validation Error:**
```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid",
    "details": [
      {
        "path": "",
        "code": "required",
        "message": "must have required property 'name'"
      }
    ]
  }
}
```

---

## Database Schema

### GroupBy Table

```sql
CREATE TABLE GroupBy (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(512) NOT NULL,

  -- Hierarchy fields
  parentId INT NULL,
  level VARCHAR(512) NOT NULL DEFAULT 'hq',
  depth INT NOT NULL DEFAULT 0,

  -- Audit fields
  createdAt DATETIME,
  updatedAt DATETIME,
  deletedAt DATETIME,
  createdId INT,
  updatedId INT,
  deletedId INT,

  -- Constraints
  FOREIGN KEY (parentId) REFERENCES GroupBy(id) ON DELETE CASCADE,
  INDEX idx_groupby_parent (parentId),
  INDEX idx_groupby_level (level),
  INDEX idx_groupby_depth (depth)
);
```

---

## Testing Guide

### Quick Test Sequence

```bash
# 1. Create root HQ
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test HQ", "level": "hq", "status": "active"}'
# Note the returned ID (e.g., 20)

# 2. Create subsidiary
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Sub", "parentId": 20, "level": "subsidiary", "status": "active"}'
# Note the returned ID (e.g., 21)

# 3. View tree
curl -X GET http://localhost:4000/api/group-by/tree?rootId=20 \
  -H "Authorization: Bearer $TOKEN"

# 4. Get children
curl -X GET http://localhost:4000/api/group-by/20/children \
  -H "Authorization: Bearer $TOKEN"

# 5. Move subsidiary to root
curl -X PATCH http://localhost:4000/api/group-by/21/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": null}'

# 6. Cleanup
curl -X DELETE http://localhost:4000/api/group-by/20 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Migration Guide

### For Existing Data

All existing groups are automatically set as root-level HQs:
- `parentId`: NULL
- `level`: 'hq'
- `depth`: 0

To organize into hierarchy:

1. Identify your root HQ groups
2. Use `PATCH /move` to assign parents
3. Update `level` field via `PATCH /:id`

**Example:**
```bash
# Make group 2 a subsidiary of group 1
curl -X PATCH http://localhost:4000/api/group-by/2/move \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"newParentId": 1}'

curl -X PATCH http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"level": "subsidiary"}'
```

---

## Support

For issues or questions:
- Check error responses for detailed messages
- Verify JWT token is valid
- Ensure user has appropriate role permissions
- Check group exists before operations

---

## Changelog

### v1.0.0 (Current)
- ✨ Added unlimited hierarchical structure support
- ✨ Added 6 new hierarchy endpoints
- ✨ Auto-depth calculation
- ✨ Circular reference prevention
- ✨ Cascade delete support
- ✅ Modified POST /group-by to support hierarchy
- ✅ All existing endpoints remain compatible

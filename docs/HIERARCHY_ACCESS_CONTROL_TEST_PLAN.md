# Hierarchy Access Control Test Plan

## Overview

This document provides a comprehensive test plan for validating the hierarchical access control implementation. Execute these tests on your local environment where the application and MySQL are running.

---

## Prerequisites

1. **Application Running**: `npm start` (localhost:4000)
2. **Database Seeded**: Ensure migration and seed scripts have been run
3. **Test Users Available**:
   - GHG Gate Superadmin: `ghg_admin@ghgcope.com` / `12345678`
   - HQ Admin: `hq_admin@ghgcope.com` / `12345678`
   - Subsidiary Admin: `sub_admin@ghgcope.com` / `12345678`
   - Guest: `guest@ghgcope.com` / `12345678`

---

## Test Data Setup

Before running tests, set up a hierarchy structure:

```bash
# Login as admin to get token
TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"12345678"}' \
  | jq -r '.accessToken')

# Create test hierarchy:
# Root HQ (ID: 1 - should already exist)
# └── Subsidiary A (ID: 2)
#     ├── Branch A1 (ID: 3)
#     └── Branch A2 (ID: 4)
# └── Subsidiary B (ID: 5)
#     └── Branch B1 (ID: 6)

# Create Subsidiary A under HQ 1
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Subsidiary A",
    "status": "active",
    "level": "subsidiary",
    "parentId": 1
  }'

# Create Branch A1 under Subsidiary A (ID: 2)
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Branch A1",
    "status": "active",
    "level": "branch",
    "parentId": 2
  }'

# Create Branch A2 under Subsidiary A
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Branch A2",
    "status": "active",
    "level": "branch",
    "parentId": 2
  }'

# Create Subsidiary B under HQ 1
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Subsidiary B",
    "status": "active",
    "level": "subsidiary",
    "parentId": 1
  }'

# Create Branch B1 under Subsidiary B (ID: 5)
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Branch B1",
    "status": "active",
    "level": "branch",
    "parentId": 5
  }'
```

### Assign Users to Groups

```bash
# Assign HQ Admin to HQ (group 1)
curl -X POST http://localhost:4000/api/user-group-by-maps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": <HQ_ADMIN_USER_ID>,
    "groupById": 1
  }'

# Assign Subsidiary Admin to Subsidiary A (group 2)
curl -X POST http://localhost:4000/api/user-group-by-maps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": <SUB_ADMIN_USER_ID>,
    "groupById": 2
  }'

# Assign Guest to HQ (group 1)
curl -X POST http://localhost:4000/api/user-group-by-maps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": <GUEST_USER_ID>,
    "groupById": 1
  }'
```

---

## Test Suite 1: Admin GHG Gate (Superadmin)

**Expected Behavior**: Global access across all tenants, can manage emission factors, edit all groups.

### Test 1.1: Login

```bash
GHG_TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ghg_admin@ghgcope.com",
    "password": "12345678"
  }' | jq -r '.accessToken')

echo "Token: $GHG_TOKEN"
```

**Expected**: Success, token returned

---

### Test 1.2: View All Groups

```bash
curl -X GET http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $GHG_TOKEN"
```

**Expected**: ✅ Success - Returns all groups (HQ, subsidiaries, branches)

---

### Test 1.3: View Tree Structure

```bash
curl -X GET http://localhost:4000/api/group-by/tree \
  -H "Authorization: Bearer $GHG_TOKEN"
```

**Expected**: ✅ Success - Returns full hierarchical tree

---

### Test 1.4: Edit Any Group (e.g., Subsidiary A)

```bash
curl -X PATCH http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $GHG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Subsidiary A - Updated by Superadmin"}'
```

**Expected**: ✅ Success - Group updated

---

### Test 1.5: Manage Emission Factors

```bash
# Get emission factors
curl -X GET http://localhost:4000/api/emission-factors \
  -H "Authorization: Bearer $GHG_TOKEN"
```

**Expected**: ✅ Success - Returns emission factors

```bash
# Create new emission factor (if allowed)
curl -X POST http://localhost:4000/api/emission-factors \
  -H "Authorization: Bearer $GHG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "stationary_combustion": [],
    "mobile_combustion": {"litre": [], "distance": []},
    "scope2": {"electric": {"peninsular": 0, "sabah": 0, "sarawak": 0, "unit": "kWh"}, "steam": {"CO2": 0, "CH4": 0, "N2O": 0}, "cooling": {"CO2": 0, "CH4": 0, "N2O": 0}, "heat": {"CO2": 0, "CH4": 0, "N2O": 0}},
    "GWP": [],
    "waste_generated": [],
    "waste_generated_supplier_specific_method": []
  }'
```

**Expected**: ✅ Success - Emission factor created (or appropriate error if already exists)

---

### Test 1.6: Move Groups (Reorganize Hierarchy)

```bash
# Move Branch A1 (ID: 3) to Subsidiary B (ID: 5)
curl -X PATCH http://localhost:4000/api/group-by/3/move \
  -H "Authorization: Bearer $GHG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": 5}'
```

**Expected**: ✅ Success - Branch moved to different subsidiary

---

## Test Suite 2: Admin HQ

**Expected Behavior**: Can view/edit own HQ and all descendants (subsidiaries, branches), can create/delete subsidiary users.

### Test 2.1: Login

```bash
HQ_TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hq_admin@ghgcope.com",
    "password": "12345678"
  }' | jq -r '.accessToken')

echo "Token: $HQ_TOKEN"
```

**Expected**: Success, token returned

---

### Test 2.2: View All Groups

```bash
curl -X GET http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ✅ Success - Returns HQ (group 1) and all descendants (Subsidiaries A, B and all branches)

---

### Test 2.3: View Tree Structure

```bash
curl -X GET http://localhost:4000/api/group-by/tree \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ✅ Success - Returns tree starting from HQ 1 with all descendants

---

### Test 2.4: View Specific Subsidiary (Subsidiary A - ID: 2)

```bash
curl -X GET http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ✅ Success - Returns Subsidiary A details

---

### Test 2.5: Edit Own HQ (Group 1)

```bash
curl -X PATCH http://localhost:4000/api/group-by/1 \
  -H "Authorization: Bearer $HQ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "HQ - Updated by HQ Admin"}'
```

**Expected**: ✅ Success - HQ updated

---

### Test 2.6: Edit Descendant (Subsidiary A - ID: 2)

```bash
curl -X PATCH http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $HQ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Subsidiary A - Updated by HQ Admin"}'
```

**Expected**: ✅ Success - Subsidiary updated

---

### Test 2.7: Edit Deep Descendant (Branch A1 - ID: 3)

```bash
curl -X PATCH http://localhost:4000/api/group-by/3 \
  -H "Authorization: Bearer $HQ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Branch A1 - Updated by HQ Admin"}'
```

**Expected**: ✅ Success - Branch updated

---

### Test 2.8: View Descendants

```bash
curl -X GET http://localhost:4000/api/group-by/1/descendants \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ✅ Success - Returns all descendant IDs [2, 3, 4, 5, 6]

---

### Test 2.9: Move Subsidiary Groups

```bash
# Move Subsidiary B to be under Subsidiary A
curl -X PATCH http://localhost:4000/api/group-by/5/move \
  -H "Authorization: Bearer $HQ_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": 2}'
```

**Expected**: ✅ Success - Subsidiary B moved

---

### Test 2.10: Access Emission Factors (Should Fail)

```bash
curl -X GET http://localhost:4000/api/emission-factors \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ❌ 403 Forbidden - HQ Admin cannot manage emission factors (only GHG Gate can)

---

### Test 2.11: Try to Access Another HQ (If Multiple HQs Exist)

If you have multiple root HQs, HQ Admin should NOT be able to access other HQs:

```bash
# Try to view another HQ (e.g., ID: 10)
curl -X GET http://localhost:4000/api/group-by/10 \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ❌ 403 Forbidden - Cannot access other HQs

---

## Test Suite 3: Admin Subsidiary

**Expected Behavior**: Can only view/edit own subsidiary and its descendants, CANNOT see sibling subsidiaries.

### Test 3.1: Login

```bash
SUB_TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sub_admin@ghgcope.com",
    "password": "12345678"
  }' | jq -r '.accessToken')

echo "Token: $SUB_TOKEN"
```

**Expected**: Success, token returned

---

### Test 3.2: View All Groups

```bash
curl -X GET http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ✅ Success - Returns only Subsidiary A (group 2) and its descendants (Branch A1, A2), NOT Subsidiary B or HQ

---

### Test 3.3: View Tree Structure

```bash
curl -X GET http://localhost:4000/api/group-by/tree?rootId=2 \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ✅ Success - Returns tree starting from Subsidiary A with branches A1, A2

---

### Test 3.4: View Own Subsidiary (Subsidiary A - ID: 2)

```bash
curl -X GET http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ✅ Success - Returns Subsidiary A details

---

### Test 3.5: Edit Own Subsidiary (ID: 2)

```bash
curl -X PATCH http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $SUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Subsidiary A - Updated by Sub Admin"}'
```

**Expected**: ✅ Success - Subsidiary updated

---

### Test 3.6: Edit Descendant Branch (Branch A1 - ID: 3)

```bash
curl -X PATCH http://localhost:4000/api/group-by/3 \
  -H "Authorization: Bearer $SUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Branch A1 - Updated by Sub Admin"}'
```

**Expected**: ✅ Success - Branch updated

---

### Test 3.7: Try to View Parent HQ (ID: 1) - Should Fail

```bash
curl -X GET http://localhost:4000/api/group-by/1 \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ❌ 403 Forbidden - Subsidiary Admin cannot access parent HQ

---

### Test 3.8: Try to View Sibling Subsidiary (Subsidiary B - ID: 5) - Should Fail

```bash
curl -X GET http://localhost:4000/api/group-by/5 \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ❌ 403 Forbidden - Subsidiary Admin cannot access sibling subsidiaries

---

### Test 3.9: Try to Edit Sibling Branch (Branch B1 - ID: 6) - Should Fail

```bash
curl -X PATCH http://localhost:4000/api/group-by/6 \
  -H "Authorization: Bearer $SUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Branch B1 - Attempt by Sub Admin"}'
```

**Expected**: ❌ 403 Forbidden - Cannot edit sibling's branch

---

### Test 3.10: View Descendants (Own Subsidiary)

```bash
curl -X GET http://localhost:4000/api/group-by/2/descendants \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ✅ Success - Returns descendant IDs [3, 4] (Branch A1, A2)

---

### Test 3.11: View Ancestors (Should Fail for Parent HQ)

```bash
curl -X GET http://localhost:4000/api/group-by/2/ancestors \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: This might succeed (returns [1]) BUT accessing group 1 should fail

---

### Test 3.12: Try to Move Own Subsidiary to Different Parent - Should Fail

```bash
curl -X PATCH http://localhost:4000/api/group-by/2/move \
  -H "Authorization: Bearer $SUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": null}'
```

**Expected**: Likely ❌ 403 Forbidden - Cannot change own parent (would affect hierarchy above)

---

## Test Suite 4: Guest User

**Expected Behavior**: Read-only access to entire tenant tree, NO write operations allowed.

### Test 4.1: Login

```bash
GUEST_TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@ghgcope.com",
    "password": "12345678"
  }' | jq -r '.accessToken')

echo "Token: $GUEST_TOKEN"
```

**Expected**: Success, token returned

---

### Test 4.2: View All Groups (Read-Only)

```bash
curl -X GET http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ✅ Success - Returns all groups in the tenant (HQ, subsidiaries, branches)

---

### Test 4.3: View Tree Structure (Read-Only)

```bash
curl -X GET http://localhost:4000/api/group-by/tree \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ✅ Success - Returns full hierarchical tree

---

### Test 4.4: View Specific Group (Read-Only)

```bash
curl -X GET http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ✅ Success - Returns Subsidiary A details

---

### Test 4.5: Try to Edit Group - Should Fail

```bash
curl -X PATCH http://localhost:4000/api/group-by/2 \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Subsidiary A - Attempt by Guest"}'
```

**Expected**: ❌ 403 Forbidden - "Guest users have read-only access"

---

### Test 4.6: Try to Create Group - Should Fail

```bash
curl -X POST http://localhost:4000/api/group-by \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Subsidiary",
    "status": "active",
    "level": "subsidiary",
    "parentId": 1
  }'
```

**Expected**: ❌ 403 Forbidden - "Guest users have read-only access"

---

### Test 4.7: Try to Delete Group - Should Fail

```bash
curl -X DELETE http://localhost:4000/api/group-by/3 \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ❌ 403 Forbidden - "Guest users have read-only access"

---

### Test 4.8: Try to Move Group - Should Fail

```bash
curl -X PATCH http://localhost:4000/api/group-by/3/move \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newParentId": 5}'
```

**Expected**: ❌ 403 Forbidden - "Guest users have read-only access"

---

### Test 4.9: View Descendants (Read-Only)

```bash
curl -X GET http://localhost:4000/api/group-by/1/descendants \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ✅ Success - Returns all descendant IDs

---

### Test 4.10: View Ancestors (Read-Only)

```bash
curl -X GET http://localhost:4000/api/group-by/3/ancestors \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ✅ Success - Returns ancestor IDs

---

## Test Suite 5: Emission Data Access Control

**Note**: This tests emission data filtering by hierarchy (if implemented).

### Test 5.1: HQ Admin - View All Emission Data

```bash
# Try to get Scope 1 emissions for Subsidiary A
curl -X GET "http://localhost:4000/api/emission-scope-1-stationary-combustions?filter=%7B%22where%22%3A%7B%22groupById%22%3A2%7D%7D" \
  -H "Authorization: Bearer $HQ_TOKEN"
```

**Expected**: ✅ Success - HQ Admin can view subsidiary emissions

---

### Test 5.2: Subsidiary Admin - View Own Emission Data

```bash
# Try to get Scope 1 emissions for own subsidiary
curl -X GET "http://localhost:4000/api/emission-scope-1-stationary-combustions?filter=%7B%22where%22%3A%7B%22groupById%22%3A2%7D%7D" \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ✅ Success - Subsidiary Admin can view own emissions

---

### Test 5.3: Subsidiary Admin - Try to View Sibling Emission Data

```bash
# Try to get Scope 1 emissions for Subsidiary B (sibling)
curl -X GET "http://localhost:4000/api/emission-scope-1-stationary-combustions?filter=%7B%22where%22%3A%7B%22groupById%22%3A5%7D%7D" \
  -H "Authorization: Bearer $SUB_TOKEN"
```

**Expected**: ❌ 403 Forbidden - Subsidiary Admin cannot view sibling emissions

---

### Test 5.4: Guest - View Emission Data (Read-Only)

```bash
# Try to get Scope 1 emissions for HQ
curl -X GET "http://localhost:4000/api/emission-scope-1-stationary-combustions?filter=%7B%22where%22%3A%7B%22groupById%22%3A1%7D%7D" \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

**Expected**: ✅ Success - Guest can view emission data (read-only)

---

## Expected Results Summary

| Role | View All Groups | Edit Own Group | Edit Descendants | Edit Siblings | Edit Parent | Manage Emission Factors | Read-Only |
|------|----------------|---------------|------------------|---------------|-------------|------------------------|-----------|
| **Admin GHG Gate** | ✅ All | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Admin HQ** | ✅ HQ + Descendants | ✅ Yes | ✅ Yes | ❌ No | ❌ N/A | ❌ No | ❌ No |
| **Admin Subsidiary** | ✅ Own + Descendants | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Guest** | ✅ All in Tenant | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes |

---

## Common Issues and Troubleshooting

### Issue 1: All Tests Return 401 Unauthorized
**Cause**: Token expired or invalid
**Solution**: Re-login to get a fresh token

### Issue 2: All Tests Return 403 Forbidden
**Cause**: User not assigned to groups or incorrect role
**Solution**: Check UserGroupByMap table and ensure user has correct UserAccessGroup

### Issue 3: Hierarchy Access Not Working as Expected
**Cause**: Access control logic not applied or user assignments incorrect
**Solution**:
1. Check `UserGroupByMapRepository.validateGroupByAccess()` is being called
2. Verify user's GroupBy assignments in database
3. Ensure user has correct role priority

### Issue 4: Can't Find Test Users
**Cause**: Seed data not run
**Solution**:
```bash
npm run seed
```

---

## Database Verification Queries

Check user roles:
```sql
SELECT u.id, u.username, u.email, uag.name as role, uag.priority
FROM cgss_demo.User u
JOIN cgss_demo.UserAccessGroupMap uagm ON u.id = uagm.userId
JOIN cgss_demo.UserAccessGroup uag ON uagm.userAccessGroupId = uag.id
WHERE u.email IN ('ghg_admin@ghgcope.com', 'hq_admin@ghgcope.com', 'sub_admin@ghgcope.com', 'guest@ghgcope.com');
```

Check user group assignments:
```sql
SELECT u.username, u.email, gb.id as groupId, gb.name as groupName, gb.level, gb.depth
FROM cgss_demo.User u
JOIN cgss_demo.UserGroupByMap ugbm ON u.id = ugbm.userId
JOIN cgss_demo.GroupBy gb ON ugbm.groupById = gb.id
WHERE u.email IN ('hq_admin@ghgcope.com', 'sub_admin@ghgcope.com', 'guest@ghgcope.com');
```

Check hierarchy structure:
```sql
SELECT id, name, level, depth, parentId
FROM cgss_demo.GroupBy
ORDER BY depth, parentId, id;
```

---

## Test Execution Checklist

- [ ] Test Suite 1: Admin GHG Gate (all 6 tests)
- [ ] Test Suite 2: Admin HQ (all 11 tests)
- [ ] Test Suite 3: Admin Subsidiary (all 12 tests)
- [ ] Test Suite 4: Guest User (all 10 tests)
- [ ] Test Suite 5: Emission Data Access (all 4 tests)

**Total Tests**: 43

---

## Notes

- Replace `<HQ_ADMIN_USER_ID>`, `<SUB_ADMIN_USER_ID>`, `<GUEST_USER_ID>` with actual user IDs from your database
- Adjust group IDs if your structure is different
- Some tests may need adjustment based on your specific data
- Document any failures with error messages for debugging

---

**Last Updated**: 2025-11-10

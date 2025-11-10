export namespace UserAccessLevel {
  export enum name {
    none = '$none', // !! do not edit this
    root = 'root', // !! do not edit this

    // User define roles (Hierarchy-aware)
    adminGHGGate = 'admin-ghg-gate', // Superadmin - Global access across all tenants
    adminSystem = 'admin-system',
    adminHQ = 'admin-hq', // HQ Admin - Full control over HQ and descendants
    adminCompany = 'admin-company',
    adminSubsidiary = 'admin-subsidiary', // Subsidiary Admin - Own subsidiary only
    member = 'member',
    guest = 'guest',

    // For internal use
    owner_0 = '$owner0',
    rank_0 = '$rank0',
    group_0 = '$group0',
    group_1 = '$group1',
    device = '$device',
    external = '$external',
    anonymous = '$anonymous',
  }

  export enum priority {
    root = 1, // mandatory

    // user define roles (lower number = higher privilege)
    adminGHGGate = 2, // Superadmin
    adminSystem = 3,
    adminHQ = 4, // HQ Admin
    adminCompany = 5,
    adminSubsidiary = 6, // Subsidiary Admin
    member = 7,
    guest = 8,

    // For internal use
    rank_0 = 9,
    owner_0 = 10,

    group_0 = 11,
    group_1 = 12,

    anonymous = 13,
    device = 14,
    external = 15,
    none = 16,
  }
}

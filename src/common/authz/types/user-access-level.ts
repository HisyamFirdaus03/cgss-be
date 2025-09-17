export namespace UserAccessLevel {
  export enum name {
    none = '$none', // !! do not edit this
    root = 'root', // !! do not edit this

    // User define roles
    adminSystem = 'admin-system',
    adminCompany = 'admin-company',
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

    // user define roles
    adminSystem = 2,
    adminCompany = 3,
    member = 4,
    guest = 5,

    // For internal use
    rank_0 = 6,
    owner_0 = 7,

    group_0 = 8,
    group_1 = 9,

    anonymous = 12,
    device = 13,
    external = 14,
    none = 15,
  }
}

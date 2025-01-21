export const permissions = [
  { code: 'log_permission', description: 'Permission to create and view logs', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
  { code: 'view_reports', description: 'Permission to view reports', canRead: true },
  { code: 'edit_profile', description: 'Permission to edit profile', canUpdate: true },
  { code: 'manage_users', description: 'Permission to manage users', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
  { code: 'create_orders', description: 'Permission to create orders', canCreate: true },
  { code: 'process_payments', description: 'Permission to process payments', canCreate: true, canRead: true, canUpdate: true },
  { code: 'manage_inventory', description: 'Permission to manage inventory', canCreate: true, canRead: true, canUpdate: true, canDelete: true },
  { code: 'view_dashboard', description: 'Permission to view dashboard', canRead: true },
  { code: 'access_settings', description: 'Permission to access settings', canRead: true, canUpdate: true },
  { code: 'generate_reports', description: 'Permission to generate reports', canCreate: true, canRead: true }
];
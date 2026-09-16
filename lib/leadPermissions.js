const ADMIN_ROLES = ["super_admin", "admin"];
const MANAGER_ROLES = ["lead_manager", "moderator"];

export function getLinkedEmployee(user, employees = []) {
  if (!user) return null;
  const email = user.email?.toLowerCase();
  return (
    employees.find(
      (e) =>
        (email && e.email?.toLowerCase() === email) ||
        String(e._id) === String(user.employeeRef) ||
        String(e._id) === String(user.employeeId) ||
        String(e.id) === String(user.employeeId)
    ) || null
  );
}

export function canAddLeads(user, linkedEmployee) {
  if (!user) return false;
  if (ADMIN_ROLES.includes(user.role) || MANAGER_ROLES.includes(user.role)) return true;
  return user.role === "employee" && !!(linkedEmployee?.canManageLeads || user.canManageLeads);
}

export function canDeleteLeads(user) {
  return !!user && ADMIN_ROLES.includes(user.role);
}

export function isOwnLead(lead, user, linkedEmployee) {
  if (!lead || !user) return false;
  const userId = String(user._id || user.id);
  const empId = linkedEmployee ? String(linkedEmployee._id || linkedEmployee.id) : null;
  const createdBy = lead.createdBy?._id || lead.createdBy;
  const assignedTo = lead.assignedTo?._id || lead.assignedTo;
  return String(createdBy) === userId || (empId && String(assignedTo) === empId);
}

export function canEditLead(lead, user, linkedEmployee) {
  if (!user) return false;
  if (ADMIN_ROLES.includes(user.role)) return true;
  if (!canAddLeads(user, linkedEmployee)) return false;
  return isOwnLead(lead, user, linkedEmployee);
}

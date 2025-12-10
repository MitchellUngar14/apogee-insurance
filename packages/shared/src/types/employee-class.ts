// Employee Class type for group insurance

export interface EmployeeClass {
  id: number;
  groupId: number;
  className: string;
  description?: string | null;
  createdAt: string;
}

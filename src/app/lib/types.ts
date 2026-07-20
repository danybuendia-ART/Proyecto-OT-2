export interface TaskEvidence {
  id?: string;
  fileName: string;
  url?: string;
  type?: string;
  size?: number;
  uploadedAt?: Date;
  uploadedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  unit: string;
  quantity: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  assignedTo?: string;
  evidences?: TaskEvidence[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';

  createdAt: Date;
  completedAt?: Date;

  tasks: Task[];

  employee?: string;

  priority: boolean;

  modificationDate?: string;
  approvedDate?: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  status: Project['status'];
  employee: string;
  priority: Boolean
}

export type MaterialPriority = 'urgente' | 'alta' | 'normal' | 'baja';

export interface Material {
  id: string;
  projectId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  status: 'en espera' | 'en camino' | 'entregado';
  priority: MaterialPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface OvertimeRecord {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  hours: number;
  projectId?: string;
  notes?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: 'vigente' | 'por vencer' | 'vencido';
  category: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  address?: string;
  startDate: Date;
  birthDate?: Date;
  emergencyContact?: string;
  emergencyPhone?: string;
  status: 'activo' | 'inactivo';
  certifications: Certification[];
  overtimeRecords: OvertimeRecord[];
}

export const DEMO_WORKERS = [

];

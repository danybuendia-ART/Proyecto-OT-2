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
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  createdAt: Date;
  completedAt?: Date;
  tasks: Task[];
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
"Jorge Alejandro Salas Ruiz",
"Jonathan de Jesús Rodríguez Hernandez",
"Luis Antonio Gaytan Cruz",
"Alan Gerardo Torres Barba",
"Darien Axel Luevano Silva"
];

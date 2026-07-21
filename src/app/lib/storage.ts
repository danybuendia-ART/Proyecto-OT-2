import { CreateProjectDto, Project, Task } from './types';
import { apiRequest, decryptData } from '../apiClient';
import { getCurrentUser } from '../lib/auth';

const STORAGE_KEY = 'projects';
const DATA_VERSION = 'v3'; // bump this to reset stale demo data

// Auto-migrate stale data on module load
if (localStorage.getItem('data_version') !== DATA_VERSION) {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem('data_version', DATA_VERSION);
}

const INITIAL_PROJECTS: Project[] = [

];

const parseEvidenceItem = (e: any) => ({
  ...e,
  uploadedAt: e.uploadedAt ? new Date(e.uploadedAt) : undefined,
});

const parseProject = (p: any): Project => ({
  id: String(p.id),
  name: p.name ?? p.nombre ?? '',
  description: p.description ?? p.descripcion ?? '',
  status: (p.status ?? p.estatus ?? 'active') as Project['status'],
  createdAt: new Date(p.createdAt ?? p.fecha_inicio ?? Date.now()),
  completedAt: p.completedAt
    ? new Date(p.completedAt)
    : p.fecha_finalizado
      ? new Date(p.fecha_finalizado)
      : undefined,
  tasks: Array.isArray(p.tasks)
    ? p.tasks.map((t: any) => ({
      ...t,
      id: String(t.id),
      title: t.title ?? t.name ?? '',
      description: t.description ?? t.descripcion ?? '',
      unit: t.unit ?? '',
      quantity: Number(t.quantity ?? 0),
      completed: Boolean(t.completed),
      createdAt: new Date(t.createdAt),
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      assignedTo: t.assignedTo ?? t.asignadoA ?? undefined,
      evidences: Array.isArray(t.evidences) ? t.evidences.map(parseEvidenceItem) : [],
    }))
    : [],
  employee: p.employee,
  priority: Boolean(p.priority),
  modificationDate: p.modificationDate,
  approvedDate: p.approvedDate
});

const normalizeProjectsResponse = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (response?.data) return response.data;
  if (response?.proyectos) return response.proyectos;
  return [];
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response: any = await apiRequest('proyectos', null, 'GET');
    const projects = normalizeProjectsResponse(response);
    console.log("datos obtenidos: ", projects.map(parseProject))
    return projects.map(parseProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return getProjects();
  }
};

export const fetchProject = async (id: string): Promise<Project | undefined> => {
  const projects = await fetchProjects();
  return projects.find(p => p.id === id);
};

export const getProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored).map(parseProject);
    } catch {
      return INITIAL_PROJECTS;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  return INITIAL_PROJECTS;
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const getProject = (id: string): Project | undefined => {
  return getProjects().find(p => p.id === id);
};

export const addProject = async (project: CreateProjectDto) => {
  const currentUser = getCurrentUser();
  const informacion: object = {
    action: "create",
    nombre: project.name,
    descripcion: project.description,
    estatus: project.status,
    fk_usuario: currentUser?.id,
    employee: project.employee,
    priority: project.priority,
  }

  const response: any = await apiRequest("proyectos", informacion, "POST");

  if (response) {
    const decryptedResponse = decryptData(response);

    return decryptedResponse.message;
  } else {
    return null;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  const status = updates.status;

  await apiRequest("proyectos", { id, updates, action: "modifyStatus" }, "POST")
};

export const changePriority = async (id: string, priority: boolean | string) => {
  const response = await apiRequest("proyectos", { action: "changePriority", id, status: priority })
  const result = decryptData(response);
  if (result.message) {
    return result.message;
  }
}

export const deleteProject = async (id: string) => {
  //const projects = getProjects().filter(p => p.id !== id);
  await apiRequest("proyectos", { action: "disabledProyect", id }, "POST");
  //saveProjects(projects);
};

export const addTask = (projectId: string, task: Omit<Task, 'id' | 'createdAt'>): Task | null => {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const newTask: Task = {
    ...task,
    id: `${projectId}-${Date.now()}`,
    createdAt: new Date(),
  };

  project.tasks.push(newTask);
  saveProjects(projects);
  return newTask;
};

export const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {

  await apiRequest("tasks", { projectId, taskId, updates, action: "changeStatus" }, "POST");

  const projects = getProjects();
  saveProjects(projects);
};

export const deleteTask = async (projectId: string, taskId: string) => {
  try {
    await apiRequest("tasks", { action: "Delete", taskId }, "POST");
  } catch (e) {
    console.error("error en la solicitud")
  }
};

// Reset demo data (for development)
export const resetDemoData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
};

// Materials/Purchases management
import { Material } from './types';

const MATERIALS_STORAGE_KEY = 'materials';
const MATERIALS_DATA_VERSION = 'v2';

// Auto-migrate stale data on module load
if (localStorage.getItem('materials_data_version') !== MATERIALS_DATA_VERSION) {
  localStorage.removeItem(MATERIALS_STORAGE_KEY);
  localStorage.setItem('materials_data_version', MATERIALS_DATA_VERSION);
}

const INITIAL_MATERIALS: Material[] = [
];

const parseMaterial = (m: any): Material => ({
  ...m,
  createdAt: new Date(m.createdAt),
  updatedAt: new Date(m.updatedAt),
});

export const getMaterials = (): Material[] => {
  const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored).map(parseMaterial);
    } catch {
      return INITIAL_MATERIALS;
    }
  }
  localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS));
  return INITIAL_MATERIALS;
};

const saveMaterials = (materials: Material[]) => {
  localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materials));
};

export const getMaterialsByProject = (projectId: string): Material[] => {
  return getMaterials().filter(m => m.projectId === projectId);
};

export const addMaterial = (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material => {
  const materials = getMaterials();
  const newMaterial: Material = {
    ...material,
    id: `m${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  materials.push(newMaterial);
  saveMaterials(materials);
  return newMaterial;
};

export const updateMaterial = (id: string, updates: Partial<Material>) => {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index !== -1) {
    materials[index] = {
      ...materials[index],
      ...updates,
      updatedAt: new Date(),
    };
    saveMaterials(materials);
  }
};

export const deleteMaterial = (id: string) => {
  const materials = getMaterials().filter(m => m.id !== id);
  saveMaterials(materials);
};

// Empleados y Capital Humano
//este sistema sera complementado con checador a futuro, para que los empleados puedan registrar su asistencia y horas trabajadas.
// Employees / Human Capital
import { Employee } from './types';
import { toast } from 'sonner';

const EMPLOYEES_STORAGE_KEY = 'employees';
const EMPLOYEES_DATA_VERSION = 'v1';

if (localStorage.getItem('employees_data_version') !== EMPLOYEES_DATA_VERSION) {
  localStorage.removeItem(EMPLOYEES_STORAGE_KEY);
  localStorage.setItem('employees_data_version', EMPLOYEES_DATA_VERSION);
}

const fri = (iso: string) => new Date(iso);
const thu = (iso: string) => new Date(iso);

const INITIAL_EMPLOYEES: Employee[] = [
];

const parseEmployee = (e: any): Employee => ({
  ...e,
  id: String(e.id ?? e.employeeId ?? e.employee_id ?? e.employeeNumber ?? ''),
  startDate: new Date(e.startDate),
  birthDate: e.birthDate ? new Date(e.birthDate) : undefined,
  certifications: Array.isArray(e.certifications)
    ? e.certifications.map((c: any) => ({
      ...c,
      issuedDate: new Date(c.issuedDate),
      expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined,
    }))
    : [],
  overtimeRecords: Array.isArray(e.overtimeRecords)
    ? e.overtimeRecords.map((o: any) => ({
      ...o,
      weekStart: new Date(o.weekStart),
      weekEnd: new Date(o.weekEnd),
    }))
    : [],
});

const normalizeEmployeesResponse = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (response?.data) return response.data;
  if (response?.empleados) return response.empleados;
  return [];
};

const getStoredEmployees = (): Employee[] => {
  const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored).map(parseEmployee);
    } catch {
      const fallbackEmployees = INITIAL_EMPLOYEES.map(parseEmployee);
      saveEmployees(fallbackEmployees);
      return fallbackEmployees;
    }
  }

  const initialEmployees = INITIAL_EMPLOYEES.map(parseEmployee);
  saveEmployees(initialEmployees);
  return initialEmployees;
};

const isImage = (fileName: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response: any = await apiRequest('employees', null, 'GET');
    const employees = normalizeEmployeesResponse(decryptData(response));
    const parsedEmployees = employees.map(parseEmployee);

    // Save to localStorage for offline access
    if (parsedEmployees.length > 0) {
      saveEmployees(parsedEmployees);
    }

    return parsedEmployees;
  } catch (error) {
    console.error('Error fetching employees from API:', error);
    // Return empty array on API failure instead of falling back to localStorage
    // This ensures fresh data is always fetched from the API
    return [];
  }
};

const saveEmployees = async (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
};

export const getEmployee = async (id: string): Promise<Employee | undefined> => {
  const employees = await getEmployees();
  const targetId = String(id);

  return employees.find((e) => {
    const employeeId = String(e.id ?? '');
    const employeeNumber = String(e.employeeNumber ?? '');
    return employeeId === targetId || employeeNumber === targetId;
  });
};

export const addEmployee = async (
  data: Omit<Employee, 'id' | 'certifications' | 'overtimeRecords'>
): Promise<Employee | null> => {
  const payload = {
    ...data,
    action: 'addEmployee',
  };

  try {
    const response: any = await apiRequest('employees', payload, 'POST');
    const responseData = response?.data ?? response?.empleado ?? response;

    if (responseData && typeof responseData === 'object' && responseData.id) {
      const newEmployee = parseEmployee({
        ...responseData,
        certifications: responseData.certifications ?? [],
        overtimeRecords: responseData.overtimeRecords ?? [],
      });
      const employees = getStoredEmployees();
      employees.push(newEmployee);
      saveEmployees(employees);
      return newEmployee;
    }
  } catch (error) {
    console.error('Error creating employee:', error);
  }

  const fallbackEmployees = getStoredEmployees();
  const fallbackEmployee: Employee = {
    ...data,
    id: `e${Date.now()}`,
    certifications: [],
    overtimeRecords: [],
  };
  fallbackEmployees.push(fallbackEmployee);
  saveEmployees(fallbackEmployees);
  return fallbackEmployee;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>) => {
  const employees = getStoredEmployees();
  const idx = employees.findIndex(e => e.id === id);

  if (idx !== -1) {
    employees[idx] = { ...employees[idx], ...updates };
    const info: any = { ...employees[idx], ...updates, action: "updateUserInfo" };
    const response = await apiRequest('employees', info, 'POST')
    if (response) {
      saveEmployees(employees);
    }
  }
};

export const deleteEmployee = (id: string) => {
  saveEmployees(getStoredEmployees().filter(e => e.id !== id));
};

export const addOvertimeRecord = (employeeId: string, record: Omit<Employee['overtimeRecords'][0], 'id'>) => {
  const employees = getStoredEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return;
  emp.overtimeRecords.push({ ...record, id: `ot${Date.now()}` });
  saveEmployees(employees);
};

export const addCertification = (employeeId: string, cert: Omit<Employee['certifications'][0], 'id'>) => {
  const employees = getStoredEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return;
  emp.certifications.push({ ...cert, id: `cert${Date.now()}` });
  saveEmployees(employees);
};

export const deleteCertification = (employeeId: string, certId: string) => {
  const employees = getStoredEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return;
  emp.certifications = emp.certifications.filter(c => c.id !== certId);
  saveEmployees(employees);
};
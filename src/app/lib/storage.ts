import { Project, Task } from './types';
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
  // --- Proyectos completados (para gráfica por fechas) ---
  {
    id: 'c1',
    name: 'Rediseño Corporativo',
    description: 'Rediseño de imagen y branding corporativo',
    status: 'completed',
    createdAt: new Date('2025-11-10'),
    completedAt: new Date('2026-01-15'),
    tasks: [
      {
        id: 'c1-1',
        title: 'Auditoría de marca',
        description: 'Análisis de identidad actual',
        unit: 'informes',
        quantity: 3,
        completed: true,
        createdAt: new Date('2025-11-11'),
        completedAt: new Date('2025-12-01'),
        assignedTo: 'Ana Rodríguez',
      },
      {
        id: 'c1-2',
        title: 'Diseño de logotipo',
        description: 'Nuevas propuestas de logotipo',
        unit: 'propuestas',
        quantity: 5,
        completed: true,
        createdAt: new Date('2025-11-20'),
        completedAt: new Date('2025-12-20'),
        assignedTo: 'María López',
      },
      {
        id: 'c1-3',
        title: 'Manual de identidad',
        description: 'Guía de uso de la nueva marca',
        unit: 'páginas',
        quantity: 60,
        completed: true,
        createdAt: new Date('2025-12-01'),
        completedAt: new Date('2026-01-10'),
        assignedTo: 'María López',
      },
      {
        id: 'c1-4',
        title: 'Aplicación en materiales',
        description: 'Tarjetas, papelería, etc.',
        unit: 'piezas',
        quantity: 12,
        completed: true,
        createdAt: new Date('2025-12-15'),
        completedAt: new Date('2026-01-14'),
        assignedTo: 'Carlos García',
      },
    ],
  },
  // --- Proyectos activos ---
  {
    id: '1',
    name: 'Desarrollo Web',
    description: 'Proyecto de desarrollo de aplicación web',
    status: 'active',
    createdAt: new Date('2026-05-01'),
    tasks: [
      {
        id: '1-1',
        title: 'Diseño de interfaz',
        description: 'Crear mockups y diseño UI/UX',
        unit: 'horas',
        quantity: 40,
        completed: true,
        createdAt: new Date('2026-05-02'),
        completedAt: new Date('2026-05-10'),
        dueDate: new Date('2026-06-03'),
        assignedTo: 'María López',
      },
      {
        id: '1-2',
        title: 'Desarrollo frontend',
        description: 'Implementar componentes React',
        unit: 'horas',
        quantity: 80,
        completed: false,
        createdAt: new Date('2026-05-05'),
        dueDate: new Date('2026-06-12'),
        assignedTo: 'Carlos García',
      },
      {
        id: '1-3',
        title: 'Integración API',
        description: 'Conectar con servicios backend',
        unit: 'endpoints',
        quantity: 12,
        completed: false,
        createdAt: new Date('2026-05-10'),
        dueDate: new Date('2026-06-24'),
        assignedTo: 'Juan Martínez',
      },
    ],
  },
  // --- Proyecto en pausa ---
  {
    id: '3',
    name: 'Marketing Digital 2026',
    description: 'Campaña de marketing digital Q2',
    status: 'on-hold',
    createdAt: new Date('2026-03-20'),
    tasks: [
      {
        id: '3-1',
        title: 'Contenido redes sociales',
        description: 'Crear posts para Instagram y Facebook',
        unit: 'posts',
        quantity: 30,
        completed: true,
        createdAt: new Date('2026-03-21'),
        completedAt: new Date('2026-04-10'),
        dueDate: new Date('2026-06-08'),
        assignedTo: 'María López',
      },
      {
        id: '3-2',
        title: 'Anuncios pagados',
        description: 'Configurar campañas Google Ads',
        unit: 'campañas',
        quantity: 5,
        completed: false,
        createdAt: new Date('2026-04-01'),
        dueDate: new Date('2026-06-20'),
        assignedTo: 'Ana Rodríguez',
      },
    ],
  },
];

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
      }))
    : [],
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

export const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
  const user :any = getCurrentUser();
  const informacion: object = {
    action: "create",
    nombre: project.name,
    descripcion: project.description,
    estatus: project.status,
    fk_usuario: user[0]?.id
  }

  const response: any = await apiRequest("proyectos",informacion, "POST");

  if(response){
    const decryptedResponse = decryptData(response);
    console.log(decryptedResponse);

    return decryptedResponse.message;
  }else{
    console.log("Error al crear el proyecto");
    return null;
  }
  /*const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date(),
    tasks: [],
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;*/
};

export const updateProject = (id: string, updates: Partial<Project>) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    const current = projects[index];
    const updated = { ...current, ...updates };
    // Auto-set completedAt when marking as completed
    if (updates.status === 'completed' && current.status !== 'completed') {
      updated.completedAt = new Date();
    }
    // Clear completedAt if moved back from completed
    if (updates.status && updates.status !== 'completed') {
      updated.completedAt = undefined;
    }
    projects[index] = updated;
    saveProjects(projects);
  }
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
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

export const updateTask = (projectId: string, taskId: string, updates: Partial<Task>) => {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  const taskIndex = project.tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const current = project.tasks[taskIndex];
    const updated = { ...current, ...updates };
    // Auto-set completedAt when marking as done
    if (updates.completed === true && !current.completed) {
      updated.completedAt = new Date();
    }
    if (updates.completed === false) {
      updated.completedAt = undefined;
    }
    project.tasks[taskIndex] = updated;
    saveProjects(projects);
  }
};

export const deleteTask = (projectId: string, taskId: string) => {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  project.tasks = project.tasks.filter(t => t.id !== taskId);
  saveProjects(projects);
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
  {
    id: 'm1',
    projectId: '1',
    name: 'Licencias de software',
    description: 'Licencias para herramientas de desarrollo',
    quantity: 5,
    unit: 'licencias',
    status: 'entregado',
    priority: 'alta',
    createdAt: new Date('2026-05-03'),
    updatedAt: new Date('2026-05-10'),
  },
  {
    id: 'm2',
    projectId: '1',
    name: 'Servidor cloud',
    description: 'Instancia EC2 para ambiente de pruebas',
    quantity: 1,
    unit: 'unidad',
    status: 'en camino',
    priority: 'urgente',
    createdAt: new Date('2026-05-15'),
    updatedAt: new Date('2026-05-20'),
  },
  {
    id: 'm3',
    projectId: '2',
    name: 'Cemento',
    description: 'Cemento Portland tipo I',
    quantity: 500,
    unit: 'sacos',
    status: 'entregado',
    priority: 'normal',
    createdAt: new Date('2026-04-16'),
    updatedAt: new Date('2026-04-25'),
  },
  {
    id: 'm4',
    projectId: '2',
    name: 'Varillas de acero',
    description: 'Varillas corrugadas #4',
    quantity: 200,
    unit: 'piezas',
    status: 'en camino',
    priority: 'urgente',
    createdAt: new Date('2026-05-01'),
    updatedAt: new Date('2026-05-28'),
  },
  {
    id: 'm5',
    projectId: '2',
    name: 'Cable eléctrico',
    description: 'Cable calibre 12 AWG',
    quantity: 1000,
    unit: 'metros',
    status: 'en espera',
    priority: 'alta',
    createdAt: new Date('2026-05-20'),
    updatedAt: new Date('2026-05-20'),
  },
  {
    id: 'm6',
    projectId: '3',
    name: 'Servicio de fotografía',
    description: 'Sesión fotográfica para contenido',
    quantity: 3,
    unit: 'sesiones',
    status: 'en espera',
    priority: 'baja',
    createdAt: new Date('2026-04-05'),
    updatedAt: new Date('2026-04-05'),
  },
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

const EMPLOYEES_STORAGE_KEY = 'employees';
const EMPLOYEES_DATA_VERSION = 'v1';

if (localStorage.getItem('employees_data_version') !== EMPLOYEES_DATA_VERSION) {
  localStorage.removeItem(EMPLOYEES_STORAGE_KEY);
  localStorage.setItem('employees_data_version', EMPLOYEES_DATA_VERSION);
}

const fri = (iso: string) => new Date(iso);
const thu = (iso: string) => new Date(iso);

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    employeeNumber: 'EMP-001',
    name: 'Carlos García',
    position: 'Jefe de Obra',
    department: 'Construcción',
    email: 'carlos.garcia@empresa.com',
    phone: '555-100-2001',
    address: 'Av. Reforma 120, Col. Centro, CDMX',
    startDate: new Date('2020-03-15'),
    birthDate: new Date('1985-07-22'),
    emergencyContact: 'Laura García',
    emergencyPhone: '555-100-9001',
    status: 'activo',
    certifications: [
      { id: 'c1-1', name: 'Seguridad en Obra', issuedBy: 'IMSS', issuedDate: new Date('2023-01-10'), expiryDate: new Date('2026-01-10'), status: 'vigente', category: 'Seguridad' },
      { id: 'c1-2', name: 'Operador de Maquinaria Pesada', issuedBy: 'SCT', issuedDate: new Date('2022-06-15'), expiryDate: new Date('2025-06-15'), status: 'vencido', category: 'Operación' },
      { id: 'c1-3', name: 'Primeros Auxilios', issuedBy: 'Cruz Roja', issuedDate: new Date('2024-03-01'), expiryDate: new Date('2026-03-01'), status: 'vigente', category: 'Seguridad' },
    ],
    overtimeRecords: [
      { id: 'ot1-1', weekStart: fri('2026-06-20'), weekEnd: thu('2026-06-26'), hours: 6, projectId: '2', notes: 'Colada de losa urgente' },
      { id: 'ot1-2', weekStart: fri('2026-06-27'), weekEnd: thu('2026-07-03'), hours: 4, projectId: '2' },
    ],
  },
  {
    id: 'e2',
    employeeNumber: 'EMP-002',
    name: 'María López',
    position: 'Diseñadora UX',
    department: 'Diseño',
    email: 'maria.lopez@empresa.com',
    phone: '555-100-2002',
    address: 'Calle Insurgentes 45, Col. Roma, CDMX',
    startDate: new Date('2021-08-01'),
    birthDate: new Date('1990-02-14'),
    emergencyContact: 'Roberto López',
    emergencyPhone: '555-100-9002',
    status: 'activo',
    certifications: [
      { id: 'c2-1', name: 'Adobe Certified Professional', issuedBy: 'Adobe', issuedDate: new Date('2023-09-01'), expiryDate: new Date('2026-09-01'), status: 'vigente', category: 'Diseño' },
      { id: 'c2-2', name: 'Google UX Design', issuedBy: 'Google', issuedDate: new Date('2022-11-20'), status: 'vigente', category: 'UX' },
    ],
    overtimeRecords: [
      { id: 'ot2-1', weekStart: fri('2026-06-27'), weekEnd: thu('2026-07-03'), hours: 3, projectId: '1', notes: 'Entrega de mockups' },
    ],
  },
  {
    id: 'e3',
    employeeNumber: 'EMP-003',
    name: 'Juan Martínez',
    position: 'Desarrollador Senior',
    department: 'Tecnología',
    email: 'juan.martinez@empresa.com',
    phone: '555-100-2003',
    address: 'Blvd. Adolfo Ruiz Cortines 890, CDMX',
    startDate: new Date('2019-11-01'),
    birthDate: new Date('1988-05-30'),
    emergencyContact: 'Patricia Martínez',
    emergencyPhone: '555-100-9003',
    status: 'activo',
    certifications: [
      { id: 'c3-1', name: 'AWS Solutions Architect', issuedBy: 'Amazon', issuedDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-15'), status: 'vigente', category: 'Cloud' },
      { id: 'c3-2', name: 'Scrum Master', issuedBy: 'Scrum Alliance', issuedDate: new Date('2022-04-10'), expiryDate: new Date('2025-04-10'), status: 'por vencer', category: 'Metodología' },
      { id: 'c3-3', name: 'Docker & Kubernetes', issuedBy: 'CNCF', issuedDate: new Date('2023-07-20'), status: 'vigente', category: 'Cloud' },
    ],
    overtimeRecords: [
      { id: 'ot3-1', weekStart: fri('2026-06-20'), weekEnd: thu('2026-06-26'), hours: 8, projectId: '1', notes: 'Deploy de emergencia' },
      { id: 'ot3-2', weekStart: fri('2026-06-27'), weekEnd: thu('2026-07-03'), hours: 5, projectId: '1' },
    ],
  },
  {
    id: 'e4',
    employeeNumber: 'EMP-004',
    name: 'Ana Rodríguez',
    position: 'Project Manager',
    department: 'Administración',
    email: 'ana.rodriguez@empresa.com',
    phone: '555-100-2004',
    address: 'Paseo de la Reforma 222, Col. Cuauhtémoc, CDMX',
    startDate: new Date('2018-06-01'),
    birthDate: new Date('1983-11-08'),
    emergencyContact: 'Miguel Rodríguez',
    emergencyPhone: '555-100-9004',
    status: 'activo',
    certifications: [
      { id: 'c4-1', name: 'PMP - Project Management', issuedBy: 'PMI', issuedDate: new Date('2021-03-15'), expiryDate: new Date('2027-03-15'), status: 'vigente', category: 'Gestión' },
      { id: 'c4-2', name: 'ITIL Foundation', issuedBy: 'Axelos', issuedDate: new Date('2020-09-01'), status: 'vigente', category: 'Gestión' },
      { id: 'c4-3', name: 'Lean Six Sigma Green Belt', issuedBy: 'ASQ', issuedDate: new Date('2023-02-28'), expiryDate: new Date('2026-02-28'), status: 'vigente', category: 'Calidad' },
    ],
    overtimeRecords: [],
  },
  {
    id: 'e5',
    employeeNumber: 'EMP-005',
    name: 'Pedro Sánchez',
    position: 'Técnico Electricista',
    department: 'Construcción',
    email: 'pedro.sanchez@empresa.com',
    phone: '555-100-2005',
    address: 'Calle Tepeyac 77, Col. Lindavista, CDMX',
    startDate: new Date('2022-01-10'),
    birthDate: new Date('1992-09-17'),
    emergencyContact: 'Carmen Sánchez',
    emergencyPhone: '555-100-9005',
    status: 'activo',
    certifications: [
      { id: 'c5-1', name: 'Instalaciones Eléctricas NOM', issuedBy: 'CONOCER', issuedDate: new Date('2023-05-12'), expiryDate: new Date('2026-05-12'), status: 'vigente', category: 'Técnico' },
      { id: 'c5-2', name: 'Trabajo en Alturas', issuedBy: 'IMSS', issuedDate: new Date('2024-02-01'), expiryDate: new Date('2025-02-01'), status: 'vencido', category: 'Seguridad' },
    ],
    overtimeRecords: [
      { id: 'ot5-1', weekStart: fri('2026-06-27'), weekEnd: thu('2026-07-03'), hours: 10, projectId: '2', notes: 'Instalación eléctrica planta baja' },
    ],
  },
];

const parseEmployee = (e: any): Employee => ({
  ...e,
  startDate: new Date(e.startDate),
  birthDate: e.birthDate ? new Date(e.birthDate) : undefined,
  certifications: e.certifications.map((c: any) => ({
    ...c,
    issuedDate: new Date(c.issuedDate),
    expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined,
  })),
  overtimeRecords: e.overtimeRecords.map((o: any) => ({
    ...o,
    weekStart: new Date(o.weekStart),
    weekEnd: new Date(o.weekEnd),
  })),
});

export const getEmployees = (): Employee[] => {
  const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored).map(parseEmployee);
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
  return INITIAL_EMPLOYEES;
};

const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
};

export const getEmployee = (id: string): Employee | undefined =>
  getEmployees().find(e => e.id === id);

export const addEmployee = (data: Omit<Employee, 'id' | 'certifications' | 'overtimeRecords'>): Employee => {
  const employees = getEmployees();
  const newEmp: Employee = {
    ...data,
    id: `e${Date.now()}`,
    certifications: [],
    overtimeRecords: [],
  };
  employees.push(newEmp);
  saveEmployees(employees);
  return newEmp;
};

export const updateEmployee = (id: string, updates: Partial<Employee>) => {
  const employees = getEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx !== -1) {
    employees[idx] = { ...employees[idx], ...updates };
    saveEmployees(employees);
  }
};

export const deleteEmployee = (id: string) => {
  saveEmployees(getEmployees().filter(e => e.id !== id));
};

export const addOvertimeRecord = (employeeId: string, record: Omit<Employee['overtimeRecords'][0], 'id'>) => {
  const employees = getEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return;
  emp.overtimeRecords.push({ ...record, id: `ot${Date.now()}` });
  saveEmployees(employees);
};

export const addCertification = (employeeId: string, cert: Omit<Employee['certifications'][0], 'id'>) => {
  const employees = getEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return;
  emp.certifications.push({ ...cert, id: `cert${Date.now()}` });
  saveEmployees(employees);
};

export const deleteCertification = (employeeId: string, certId: string) => {
  const employees = getEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return;
  emp.certifications = emp.certifications.filter(c => c.id !== certId);
  saveEmployees(employees);
};

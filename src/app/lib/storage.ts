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
    id: "c1",
    name: "Instalacion de espejos y cristales",
    description:
      "Instalación de espejos y cristales en el edificio principal",
    status: "completed",
    createdAt: new Date("2026-07-04"),
    completedAt: new Date("2026-07-06"),
    tasks: [
      {
        id: "c1-1",
        title: "Planeacion de instalación",
        description:
          "Toma de medidas y planificación de la instalación",
        unit: "horas",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-07-05"),
        completedAt: new Date("2026-07-06"),
        assignedTo: "Alan Gerardo Torres Barba",
      },
      {
        id: "c1-2",
        title: "Corte y preparación de cristales",
        description:
          "Corte de cristales a medida y preparación para instalación",
        unit: "horas",
        quantity: 5,
        completed: true,
        createdAt: new Date("2025-07-05"),
        completedAt: new Date("2026-07-06"),
        assignedTo: "Luis Antonio Gaytan Cruz",
      },
      {
        id: "c1-3",
        title: "pegar y fijar cristales",
        description:
          "Aplicación de adhesivos y fijación de cristales en su lugar",
        unit: "metros",
        quantity: 60,
        completed: true,
        createdAt: new Date("2026-07-05"),
        completedAt: new Date("2026-07-06"),
        assignedTo: "Luis Antonio Gaytan Cruz",
      },
      {
        id: "c1-4",
        title: "Señalar advertencias",
        description: "Poner señalamientos de precaucion.",
        unit: "hr",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-07-05"),
        completedAt: new Date("2026-07-05"),
        assignedTo: "Jorge Alejandro Salas Ruiz",
      },
    ],
  },
  {
    id: "c2",
    name: "Instalacion electrica",
    description: "Instalar lamparas en pasillos principales",
    status: "completed",
    createdAt: new Date("2026-06-23"),
    completedAt: new Date("2026-06-02"),
    tasks: [
      {
        id: "c2-1",
        title: "Planear instalacion",
        description: "Levantamiento de necesidades",
        unit: "hrs",
        quantity: 2,
        completed: true,
        createdAt: new Date("2026-06-23"),
        completedAt: new Date("2026-06-23"),
        assignedTo: "Jonathan de Jesús Rodríguez Hernandez",
      },
      {
        id: "c2-2",
        title: "paso de linea",
        description: "Pasar cable de corriente en el pasillo",
        unit: "horas",
        quantity: 4,
        completed: true,
        createdAt: new Date("2026-06-23"),
        completedAt: new Date("2026-06-23"),
        assignedTo: "Darien Axel Luevano Silva",
      },
      {
        id: "c2-3",
        title: "Armado de contactos",
        description:
          "Armar contactos de lamparas en el pasillo",
        unit: "pza",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-06-24"),
        completedAt: new Date("2026-06-24"),
        assignedTo: "Jorge Alejandro Salas Ruiz",
      },
      {
        id: "c2-4",
        title: "Toma de corriente",
        description: "toma de corriente electrica 110 V",
        unit: "servicio",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-06-24"),
        completedAt: new Date("2026-06-24"),
        assignedTo: "Alan Gerardo Torres Barba",
      },
    ],
  },
  {
    id: "c3",
    name: "Bacheo",
    description: "Reparacion de ruta",
    status: "completed",
    createdAt: new Date("2026-05-15"),
    completedAt: new Date("2026-06-01"),
    tasks: [
      {
        id: "c3-1",
        title: "Evaluacion y Planificacion",
        description: "Planear rutas y pedir material",
        unit: "horas",
        quantity: 2.5,
        completed: true,
        createdAt: new Date("2026-05-15"),
        completedAt: new Date("2026-05-15"),
        assignedTo: "Luis Antonio Gaytan Cruz",
      },
      {
        id: "c3-2",
        title: "Preparacion del Area",
        description:
          "Limpia la zona afectada de escombros y materiales",
        unit: "area",
        quantity: 4,
        completed: true,
        createdAt: new Date("2026-05-17"),
        completedAt: new Date("2026-05-18"),
        assignedTo: "Jonathan de Jesús Rodríguez Hernandez",
      },
      {
        id: "c3-3",
        title: "Relleno de bache",
        description:
          "Aplicar una capa de imprimacion en el area para mejorar adherencia",
        unit: "area",
        quantity: 4,
        completed: true,
        createdAt: new Date("2026-05-17"),
        completedAt: new Date("2026-05-18"),
        assignedTo: "Darien Axel Luevano Silva",
      },
      {
        id: "c3-4",
        title: "Compactacion",
        description:
          "Utiliza compactadoras o herramientas mauales para compactar la adherencia",
        unit: "horas",
        quantity: 4,
        completed: true,
        createdAt: new Date("2026-05-18"),
        completedAt: new Date("2026-05-15"),
        assignedTo: "Jorge Alejandro Salas Ruiz",
      },
    ],
  },
  {
    id: "c4",
    name: "Servicio de auto",
    description:
      "Cambio de Aceite y filtros camioneta nissan Frontier V6 Pro-4X 2025",
    status: "completed",
    createdAt: new Date("2026-04-01"),
    completedAt: new Date("2026-04-08"),
    tasks: [
      {
        id: "c4-1",
        title: "Cambio de aceite",
        description:
          "Cambio de aceite, filtros de aceite y aire, revision de refrigerante, neumáticos y sistemas eléctricos",
        unit: "servicio",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-04-01"),
        completedAt: new Date("2026-04-01"),
        assignedTo: "Darien Axel Luevano Silva",
      },
      {
        id: "c4-2",
        title: "Reparacion de averias menores",
        description:
          "Problemas eléctricos, mecánicos, del motor o transmisión, y reemplazo de piezas defectuosas ",
        unit: "servicio",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-04-01"),
        completedAt: new Date("2026-04-01"),
        assignedTo: "Jonathan de Jesús Rodríguez Hernandez",
      },
      {
        id: "c4-3",
        title: "Reparacion de problemas graves",
        description:
          "Sustitución de motor o transmisión, reparación de partes mecánicas, eléctricas o de carrocería",
        unit: "servicio",
        quantity: 1,
        completed: true,
        createdAt: new Date("2026-04-02"),
        completedAt: new Date("2026-04-06"),
        assignedTo: "Alan Gerardo Torres Barba",
      },
    ],
  },
  {
    id: "c5",
    name: "Paneles solares",
    description: "Instalación",
    status: "completed",
    createdAt: new Date("2026-04-20"),
    completedAt: new Date("2026-04-25"),
    tasks: [
      {
        id: "c5-1",
        title: "Evaluacion del sitio",
        description:
          "se analiza la orientación del techo, inclinación, sombras y espacio disponible",
        unit: "horas",
        quantity: 3,
        completed: true,
        createdAt: new Date("2026-04-20"),
        completedAt: new Date("2026-04-20"),
        assignedTo: "Jorge Alejandro Salas Ruiz",
      },
      {
        id: "c5-2",
        title: "Seleccion de tecnologia",
        description:
          "Se eligen los paneles solares (monocristalinos, policristalinos o bifaciales) según eficiencia y presupuesto.",
        unit: "componentes",
        quantity: 30,
        completed: true,
        createdAt: new Date("2026-04-20"),
        completedAt: new Date("2026-04-21"),
        assignedTo: "Luis Antonio Gaytan Cruz",
      },
      {
        id: "c5-3",
        title: "Instalación física",
        description:
          "Se realiza el anclaje de la estructura al techo, asegurando impermeabilidad. ",
        unit: "horas",
        quantity: 15,
        completed: true,
        createdAt: new Date("2026-04-21"),
        completedAt: new Date("2026-04-22"),
        assignedTo: "Darien Axel Luevano Silva",
      },
      {
        id: "c5-4",
        title: "Conexion y puesta en marcha",
        description:
          "Se instala un medidor bidireccional y se habilita el Net Billing. ",
        unit: "servicio",
        quantity: 30,
        completed: true,
        createdAt: new Date("2026-04-22"),
        completedAt: new Date("2026-04-23"),
        assignedTo: "Alan Gerardo Torres Barba",
      },
    ],
  },
  // --- Proyectos activos ---
  {
    id: "1",
    name: "Mantenimiento de maquinados",
    description: "Soldadura de maquinaria",
    status: "active",
    createdAt: new Date("2026-07-01"),
    tasks: [
      {
        id: "1-1",
        title: "Preparacion",
        description:
          "Limpiar las superficies metálicas y aplicar fundente para eliminar la oxidación y promover el flujo de soldadura.",
        unit: "maquinas",
        quantity: 5,
        completed: true,
        createdAt: new Date("2026-07-01"),
        completedAt: new Date("2026-07-01"),
        dueDate: new Date("2026-07-01"),
        assignedTo: "Luis Antonio Gaytan Cruz",
      },
      {
        id: "1-2",
        title: "Instalacion",
        description:
          "Colocar los componentes en la posición correcta y asegurar que las marcas estén orientadas hacia afuera.",
        unit: "horas",
        quantity: 2,
        completed: false,
        createdAt: new Date("2026-07-02"),
        dueDate: new Date("2026-07-02"),
        assignedTo: "Jorge Alejandro Salas Ruiz",
      },
      {
        id: "1-3",
        title: "Instalacion",
        description:
          "Seguir el diagrama de instalación y colocar los componentes grandes antes de los más pequeños. ",
        unit: "horas",
        quantity: 2,
        completed: false,
        createdAt: new Date("2026-07-03"),
        dueDate: new Date("2026-07-03"),
        assignedTo: "Jonathan de Jesús Rodríguez Hernandez",
      },
    ],
  },
  {
    id: "2",
    name: "Alarmas de humo",
    description: "Instalacion",
    status: "active",
    createdAt: new Date("2026-07-03"),
    tasks: [
      {
        id: "2-1",
        title: "Pedir material",
        description: "Investigar y hacer requisicion",
        unit: "pzas",
        quantity: 12,
        completed: true,
        createdAt: new Date("2026-07-03"),
        completedAt: new Date("2026-07-03"),
        dueDate: new Date("2026-07-03"),
        assignedTo: "Darien Axel Luevano Silva",
      },
      {
        id: "2-2",
        title: "Instalacion",
        description: "Instalar alarmas en oficinas",
        unit: "horas",
        quantity: 5,
        completed: false,
        createdAt: new Date("2026-07-05"),
        dueDate: new Date("2026-07-05"),
        assignedTo: "Jorge Alejandro Salas Ruiz",
      },
    ],
  },
  // --- Proyecto en pausa ---
  {
    id: "3",
    name: "Puertas",
    description: "Instalacion de puertas en oficinas",
    status: "on-hold",
    createdAt: new Date("2026-07-03"),
    tasks: [
      {
        id: "3-1",
        title: "Requerimiento compras",
        description: "Encargar materiales a compras",
        unit: "horas",
        quantity: 3,
        completed: true,
        createdAt: new Date("2026-07-03"),
        completedAt: new Date("2026-07-03"),
        dueDate: new Date("2026-07-03"),
        assignedTo: "Luis Antonio Gaytan Cruz",
      },
      {
        id: "3-2",
        title: "Instalar puertas",
        description: "Instalar puertas en el edificio B",
        unit: "pzas",
        quantity: 5,
        completed: false,
        createdAt: new Date("2026-07-05"),
        dueDate: new Date("2026-07-17"),
        assignedTo: "Alan Gerardo Torres Barba",
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
    id: "e1",
    employeeNumber: "EMP-001",
    name: "Jorge Alejandro Salas Ruiz",
    position: "Jefe de Obra",
    department: "Construcción",
    email: "carlos.garcia@empresa.com",
    phone: "555-100-2001",
    address: "Av. Reforma 120, Col. Centro, CDMX",
    startDate: new Date("2020-03-15"),
    birthDate: new Date("1985-07-22"),
    emergencyContact: "Laura García",
    emergencyPhone: "555-100-9001",
    status: "activo",
    certifications: [
      {
        id: "c1-1",
        name: "Seguridad en Obra",
        issuedBy: "IMSS",
        issuedDate: new Date("2023-01-10"),
        expiryDate: new Date("2026-01-10"),
        status: "vigente",
        category: "Seguridad",
      },
      {
        id: "c1-2",
        name: "Operador de Maquinaria Pesada",
        issuedBy: "SCT",
        issuedDate: new Date("2022-06-15"),
        expiryDate: new Date("2025-06-15"),
        status: "vencido",
        category: "Operación",
      },
      {
        id: "c1-3",
        name: "Primeros Auxilios",
        issuedBy: "Cruz Roja",
        issuedDate: new Date("2024-03-01"),
        expiryDate: new Date("2026-03-01"),
        status: "vigente",
        category: "Seguridad",
      },
    ],
    overtimeRecords: [
      {
        id: "ot1-1",
        weekStart: fri("2026-06-20"),
        weekEnd: thu("2026-06-26"),
        hours: 6,
        projectId: "2",
        notes: "Colada de losa urgente",
      },
      {
        id: "ot1-2",
        weekStart: fri("2026-06-27"),
        weekEnd: thu("2026-07-03"),
        hours: 4,
        projectId: "2",
      },
    ],
  },
  {
    id: "e2",
    employeeNumber: "EMP-002",
    name: "Luis Antonio Gaytan Cruz",
    position: "",
    department: "",
    email: "maria.lopez@empresa.com",
    phone: "555-100-2002",
    address: "Calle Insurgentes 45, Col. Roma, CDMX",
    startDate: new Date("2021-08-01"),
    birthDate: new Date("1990-02-14"),
    emergencyContact: "Roberto López",
    emergencyPhone: "555-100-9002",
    status: "activo",
    certifications: [
      {
        id: "c2-1",
        name: "Adobe Certified Professional",
        issuedBy: "Adobe",
        issuedDate: new Date("2023-09-01"),
        expiryDate: new Date("2026-09-01"),
        status: "vigente",
        category: "Diseño",
      },
      {
        id: "c2-2",
        name: "Google UX Design",
        issuedBy: "Google",
        issuedDate: new Date("2022-11-20"),
        status: "vigente",
        category: "UX",
      },
    ],
    overtimeRecords: [
      {
        id: "ot2-1",
        weekStart: fri("2026-06-27"),
        weekEnd: thu("2026-07-03"),
        hours: 3,
        projectId: "1",
        notes: "Entrega de mockups",
      },
    ],
  },
  {
    id: "e3",
    employeeNumber: "EMP-003",
    name: "Jonathan de Jesús Rodríguez Hernandez",
    position: "",
    department: "",
    email: "juan.martinez@empresa.com",
    phone: "555-100-2003",
    address: "Blvd. Adolfo Ruiz Cortines 890, CDMX",
    startDate: new Date("2019-11-01"),
    birthDate: new Date("1988-05-30"),
    emergencyContact: "Patricia Martínez",
    emergencyPhone: "555-100-9003",
    status: "activo",
    certifications: [
      {
        id: "c3-1",
        name: "AWS Solutions Architect",
        issuedBy: "Amazon",
        issuedDate: new Date("2024-01-15"),
        expiryDate: new Date("2027-01-15"),
        status: "vigente",
        category: "Cloud",
      },
      {
        id: "c3-2",
        name: "Scrum Master",
        issuedBy: "Scrum Alliance",
        issuedDate: new Date("2022-04-10"),
        expiryDate: new Date("2025-04-10"),
        status: "por vencer",
        category: "Metodología",
      },
      {
        id: "c3-3",
        name: "Docker & Kubernetes",
        issuedBy: "CNCF",
        issuedDate: new Date("2023-07-20"),
        status: "vigente",
        category: "Cloud",
      },
    ],
    overtimeRecords: [
      {
        id: "ot3-1",
        weekStart: fri("2026-06-20"),
        weekEnd: thu("2026-06-26"),
        hours: 8,
        projectId: "1",
        notes: "Deploy de emergencia",
      },
      {
        id: "ot3-2",
        weekStart: fri("2026-06-27"),
        weekEnd: thu("2026-07-03"),
        hours: 5,
        projectId: "1",
      },
    ],
  },
  {
    id: "e4",
    employeeNumber: "EMP-004",
    name: "Alan Gerardo Torres Barba",
    position: "",
    department: "",
    email: "ana.rodriguez@empresa.com",
    phone: "555-100-2004",
    address: "Paseo de la Reforma 222, Col. Cuauhtémoc, CDMX",
    startDate: new Date("2018-06-01"),
    birthDate: new Date("1983-11-08"),
    emergencyContact: "Miguel Rodríguez",
    emergencyPhone: "555-100-9004",
    status: "activo",
    certifications: [
      {
        id: "c4-1",
        name: "PMP - Project Management",
        issuedBy: "PMI",
        issuedDate: new Date("2021-03-15"),
        expiryDate: new Date("2027-03-15"),
        status: "vigente",
        category: "Gestión",
      },
      {
        id: "c4-2",
        name: "ITIL Foundation",
        issuedBy: "Axelos",
        issuedDate: new Date("2020-09-01"),
        status: "vigente",
        category: "Gestión",
      },
      {
        id: "c4-3",
        name: "Lean Six Sigma Green Belt",
        issuedBy: "ASQ",
        issuedDate: new Date("2023-02-28"),
        expiryDate: new Date("2026-02-28"),
        status: "vigente",
        category: "Calidad",
      },
    ],
    overtimeRecords: [],
  },
  {
    id: "e5",
    employeeNumber: "EMP-005",
    name: "Darien Axel Luevano Silva",
    position: "Técnico Electricista",
    department: "Construcción",
    email: "pedro.sanchez@empresa.com",
    phone: "555-100-2005",
    address: "Calle Tepeyac 77, Col. Lindavista, CDMX",
    startDate: new Date("2022-01-10"),
    birthDate: new Date("1992-09-17"),
    emergencyContact: "Carmen Sánchez",
    emergencyPhone: "555-100-9005",
    status: "activo",
    certifications: [
      {
        id: "c5-1",
        name: "Instalaciones Eléctricas NOM",
        issuedBy: "CONOCER",
        issuedDate: new Date("2023-05-12"),
        expiryDate: new Date("2026-05-12"),
        status: "vigente",
        category: "Técnico",
      },
      {
        id: "c5-2",
        name: "Trabajo en Alturas",
        issuedBy: "IMSS",
        issuedDate: new Date("2024-02-01"),
        expiryDate: new Date("2025-02-01"),
        status: "vencido",
        category: "Seguridad",
      },
    ],
    overtimeRecords: [
      {
        id: "ot5-1",
        weekStart: fri("2026-06-27"),
        weekEnd: thu("2026-07-03"),
        hours: 10,
        projectId: "2",
        notes: "Instalación eléctrica planta baja",
      },
    ],
  },
];

const parseEmployee = (e: any): Employee => ({
  ...e,
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
      return INITIAL_EMPLOYEES;
    }
  }
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
  return INITIAL_EMPLOYEES;
};

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response: any = await apiRequest('employees', null, 'GET');
    const employees = normalizeEmployeesResponse(response);
    return employees.map(parseEmployee);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return getStoredEmployees();
  }
};

const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
};

export const getEmployee = (id: string): Employee | undefined =>
  getStoredEmployees().find(e => e.id === id);

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

export const updateEmployee = (id: string, updates: Partial<Employee>) => {
  const employees = getStoredEmployees();
  const idx = employees.findIndex(e => e.id === id);
  if (idx !== -1) {
    employees[idx] = { ...employees[idx], ...updates };
    saveEmployees(employees);
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
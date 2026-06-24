import { Project, Task } from './types';

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
  {
    id: 'c2',
    name: 'Sistema ERP',
    description: 'Implementación de sistema de gestión empresarial',
    status: 'completed',
    createdAt: new Date('2025-11-01'),
    completedAt: new Date('2026-02-10'),
    tasks: [
      {
        id: 'c2-1',
        title: 'Análisis de requerimientos',
        description: 'Levantamiento de necesidades',
        unit: 'módulos',
        quantity: 8,
        completed: true,
        createdAt: new Date('2025-11-02'),
        completedAt: new Date('2025-11-30'),
        assignedTo: 'Juan Martínez',
      },
      {
        id: 'c2-2',
        title: 'Configuración de servidores',
        description: 'Infraestructura cloud',
        unit: 'servidores',
        quantity: 4,
        completed: true,
        createdAt: new Date('2025-12-01'),
        completedAt: new Date('2025-12-20'),
        assignedTo: 'Pedro Sánchez',
      },
      {
        id: 'c2-3',
        title: 'Migración de datos',
        description: 'Traslado de datos históricos',
        unit: 'registros',
        quantity: 50000,
        completed: true,
        createdAt: new Date('2025-12-21'),
        completedAt: new Date('2026-01-20'),
        assignedTo: 'Carlos García',
      },
      {
        id: 'c2-4',
        title: 'Capacitación de usuarios',
        description: 'Formación al personal',
        unit: 'horas',
        quantity: 40,
        completed: true,
        createdAt: new Date('2026-01-21'),
        completedAt: new Date('2026-02-08'),
        assignedTo: 'Ana Rodríguez',
      },
    ],
  },
  {
    id: 'c3',
    name: 'App Móvil v2',
    description: 'Segunda versión de la aplicación móvil',
    status: 'completed',
    createdAt: new Date('2025-12-01'),
    completedAt: new Date('2026-03-05'),
    tasks: [
      {
        id: 'c3-1',
        title: 'Diseño UX/UI',
        description: 'Wireframes y prototipos',
        unit: 'pantallas',
        quantity: 25,
        completed: true,
        createdAt: new Date('2025-12-02'),
        completedAt: new Date('2026-01-05'),
        assignedTo: 'María López',
      },
      {
        id: 'c3-2',
        title: 'Desarrollo iOS',
        description: 'Implementación nativa iOS',
        unit: 'sprints',
        quantity: 6,
        completed: true,
        createdAt: new Date('2026-01-06'),
        completedAt: new Date('2026-02-10'),
        assignedTo: 'Juan Martínez',
      },
      {
        id: 'c3-3',
        title: 'Desarrollo Android',
        description: 'Implementación nativa Android',
        unit: 'sprints',
        quantity: 6,
        completed: true,
        createdAt: new Date('2026-01-06'),
        completedAt: new Date('2026-02-15'),
        assignedTo: 'Pedro Sánchez',
      },
      {
        id: 'c3-4',
        title: 'QA y pruebas',
        description: 'Testing funcional y de rendimiento',
        unit: 'casos',
        quantity: 120,
        completed: true,
        createdAt: new Date('2026-02-16'),
        completedAt: new Date('2026-03-03'),
        assignedTo: 'Carlos García',
      },
    ],
  },
  {
    id: 'c4',
    name: 'Auditoría de Seguridad',
    description: 'Evaluación integral de ciberseguridad',
    status: 'completed',
    createdAt: new Date('2026-02-01'),
    completedAt: new Date('2026-03-28'),
    tasks: [
      {
        id: 'c4-1',
        title: 'Escaneo de vulnerabilidades',
        description: 'Análisis automatizado de sistemas',
        unit: 'sistemas',
        quantity: 15,
        completed: true,
        createdAt: new Date('2026-02-02'),
        completedAt: new Date('2026-02-20'),
        assignedTo: 'Pedro Sánchez',
      },
      {
        id: 'c4-2',
        title: 'Pruebas de penetración',
        description: 'Ethical hacking controlado',
        unit: 'pruebas',
        quantity: 30,
        completed: true,
        createdAt: new Date('2026-02-21'),
        completedAt: new Date('2026-03-10'),
        assignedTo: 'Juan Martínez',
      },
      {
        id: 'c4-3',
        title: 'Informe ejecutivo',
        description: 'Documento de hallazgos y recomendaciones',
        unit: 'páginas',
        quantity: 45,
        completed: true,
        createdAt: new Date('2026-03-11'),
        completedAt: new Date('2026-03-25'),
        assignedTo: 'Ana Rodríguez',
      },
    ],
  },
  {
    id: 'c5',
    name: 'Portal de Clientes',
    description: 'Desarrollo de portal web para clientes externos',
    status: 'completed',
    createdAt: new Date('2026-02-15'),
    completedAt: new Date('2026-04-20'),
    tasks: [
      {
        id: 'c5-1',
        title: 'Arquitectura backend',
        description: 'Diseño de APIs REST',
        unit: 'endpoints',
        quantity: 35,
        completed: true,
        createdAt: new Date('2026-02-16'),
        completedAt: new Date('2026-03-15'),
        assignedTo: 'Carlos García',
      },
      {
        id: 'c5-2',
        title: 'Frontend React',
        description: 'Desarrollo de interfaz',
        unit: 'componentes',
        quantity: 40,
        completed: true,
        createdAt: new Date('2026-03-01'),
        completedAt: new Date('2026-04-05'),
        assignedTo: 'María López',
      },
      {
        id: 'c5-3',
        title: 'Integración de pagos',
        description: 'Pasarela de pagos',
        unit: 'métodos',
        quantity: 4,
        completed: true,
        createdAt: new Date('2026-03-20'),
        completedAt: new Date('2026-04-10'),
        assignedTo: 'Pedro Sánchez',
      },
      {
        id: 'c5-4',
        title: 'Pruebas de aceptación',
        description: 'UAT con clientes reales',
        unit: 'sesiones',
        quantity: 8,
        completed: true,
        createdAt: new Date('2026-04-11'),
        completedAt: new Date('2026-04-18'),
        assignedTo: 'Ana Rodríguez',
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
  {
    id: '2',
    name: 'Construcción Edificio A',
    description: 'Construcción de edificio residencial',
    status: 'active',
    createdAt: new Date('2026-04-15'),
    tasks: [
      {
        id: '2-1',
        title: 'Cimentación',
        description: 'Excavación y cimentación',
        unit: 'm³',
        quantity: 150,
        completed: true,
        createdAt: new Date('2026-04-16'),
        completedAt: new Date('2026-05-01'),
        dueDate: new Date('2026-06-05'),
        assignedTo: 'Pedro Sánchez',
      },
      {
        id: '2-2',
        title: 'Estructura',
        description: 'Construcción de estructura de concreto',
        unit: 'm²',
        quantity: 450,
        completed: false,
        createdAt: new Date('2026-04-25'),
        dueDate: new Date('2026-06-16'),
        assignedTo: 'Carlos García',
      },
      {
        id: '2-3',
        title: 'Instalaciones eléctricas',
        description: 'Cableado y conexiones',
        unit: 'puntos',
        quantity: 85,
        completed: false,
        createdAt: new Date('2026-05-15'),
        dueDate: new Date('2026-06-27'),
        assignedTo: 'Ana Rodríguez',
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
  ...p,
  createdAt: new Date(p.createdAt),
  completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
  tasks: p.tasks.map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
  })),
});

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

export const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>): Project => {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date(),
    tasks: [],
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
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

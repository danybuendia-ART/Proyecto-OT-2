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

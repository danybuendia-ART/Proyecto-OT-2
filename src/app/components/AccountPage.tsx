import { useMemo, useState, useEffect } from 'react';
import { fetchProjects, getProjects, resetDemoData } from '../lib/storage';
import { getCurrentUser } from '../lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import {
  User,
  CheckCircle2,
  FolderOpen,
  Clock,
  PauseCircle,
  TrendingUp,
  Users,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

const WORKER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316',
];

export function AccountPage() {
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchProjects();
      setProjects(data);
    };
    load();
  }, []);

  const handleResetData = () => {
    resetDemoData();
    setProjects(getProjects());
    toast.success('Datos de demostración restaurados');
  };

  // --- Stats summary ---
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const active = projects.filter(p => p.status === 'active').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;
    const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
    const completedTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0);
    return { total, completed, active, onHold, totalTasks, completedTasks };
  }, [projects]);

  // --- Chart 1: Proyectos completados por mes ---
  const projectsByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    projects
      .filter(p => p.status === 'completed' && p.completedAt)
      .forEach(p => {
        const d = p.completedAt!;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        map[key] = (map[key] || 0) + 1;
      });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        return { mes: `${MONTH_LABELS[month]} ${year}`, proyectos: count, key };
      });
  }, [projects]);

  // --- Chart 2: Rendimiento por trabajador (tareas completadas) ---
  const workerStats = useMemo(() => {
    const map: Record<string, { tasks: number; quantity: number; projects: Set<string> }> = {};

    projects.forEach(project => {
      project.tasks
        .filter(t => t.completed && t.assignedTo)
        .forEach(task => {
          const w = task.assignedTo!;
          if (!map[w]) map[w] = { tasks: 0, quantity: 0, projects: new Set() };
          map[w].tasks += 1;
          map[w].quantity += task.quantity;
          map[w].projects.add(project.name);
        });
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        trabajador: name,
        tareas: data.tasks,
        cantidad: Math.round(data.quantity),
        proyectos: data.projects.size,
        proyectosNombres: [...data.projects].join(', '),
      }))
      .sort((a, b) => b.tareas - a.tareas);
  }, [projects]);

  // --- Chart 3: Desglose tareas por trabajador por proyecto ---
  const workerProjectBreakdown = useMemo(() => {
    // Build a dataset where each row = one worker, columns = projects
    const projectNames = [...new Set(
      projects
        .filter(p => p.tasks.some(t => t.completed && t.assignedTo))
        .map(p => p.name)
    )];

    const workerNames = [...new Set(
      projects.flatMap(p =>
        p.tasks.filter(t => t.completed && t.assignedTo).map(t => t.assignedTo!)
      )
    )];

    return workerNames.map(worker => {
      const row: Record<string, string | number> = { trabajador: worker };
      projectNames.forEach(proj => {
        const project = projects.find(p => p.name === proj);
        const count = project?.tasks.filter(t => t.completed && t.assignedTo === worker).length || 0;
        row[proj] = count;
      });
      return row;
    });
  }, [projects]);

  const allProjectNames = useMemo(() =>
    [...new Set(
      projects
        .filter(p => p.tasks.some(t => t.completed && t.assignedTo))
        .map(p => p.name)
    )],
    [projects]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Mi Cuenta</h2>
          <p className="text-gray-500 mt-1">Analíticas y rendimiento del equipo</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Restaurar datos demo
        </Button>
      </div>

      {/* User profile */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xl font-semibold">{user?.nombre}</p>
              <p className="text-gray-500">{user?.correo}</p>
              <Badge variant="secondary" className="mt-1">Administrador</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total proyectos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-500">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-500">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <PauseCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onHold}</p>
                <p className="text-sm text-gray-500">En pausa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            <TrendingUp className="w-4 h-4 mr-2" />
            Proyectos por fecha
          </TabsTrigger>
          <TabsTrigger value="workers">
            <Users className="w-4 h-4 mr-2" />
            Rendimiento trabajadores
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Completed projects by month */}
        <TabsContent value="projects" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Proyectos Finalizados por Mes</CardTitle>
              <CardDescription>
                Cantidad de proyectos completados en cada mes del período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsByMonth.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No hay proyectos completados aún</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={projectsByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 13 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} proyecto${value !== 1 ? 's' : ''}`, 'Finalizados']}
                    />
                    <Bar dataKey="proyectos" radius={[6, 6, 0, 0]} fill="#3b82f6">
                      {projectsByMonth.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.proyectos >= 2 ? '#1d4ed8' : '#3b82f6'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Completed projects list */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de proyectos completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects
                  .filter(p => p.status === 'completed' && p.completedAt)
                  .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
                  .map(project => {
                    const completedTasks = project.tasks.filter(t => t.completed).length;
                    return (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-gray-500">{project.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-700">
                            {project.completedAt!.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">{completedTasks} tareas</p>
                        </div>
                      </div>
                    );
                  })}
                {projects.filter(p => p.status === 'completed').length === 0 && (
                  <p className="text-center text-gray-400 py-6">No hay proyectos completados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Worker performance */}
        <TabsContent value="workers" className="space-y-6 mt-6">
          {/* Bar chart: tasks per worker */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas Completadas por Trabajador</CardTitle>
              <CardDescription>
                Total de tareas finalizadas por cada integrante del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workerStats.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No hay datos de trabajadores aún</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={workerStats}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 110, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 13 }} />
                    <YAxis type="category" dataKey="trabajador" tick={{ fontSize: 13 }} width={105} />
                    <Tooltip
                      formatter={(value: number) => [`${value} tarea${value !== 1 ? 's' : ''}`, 'Completadas']}
                    />
                    <Bar dataKey="tareas" radius={[0, 6, 6, 0]}>
                      {workerStats.map((entry, index) => (
                        <Cell key={entry.trabajador} fill={WORKER_COLORS[index % WORKER_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Stacked bar: tasks per worker per project */}
          {allProjectNames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Desglose por Proyecto</CardTitle>
                <CardDescription>
                  Tareas completadas por trabajador en cada proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    data={workerProjectBreakdown}
                    margin={{ top: 10, right: 20, left: 110, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="trabajador" tick={{ fontSize: 12 }} width={105} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {allProjectNames.map((projName, i) => (
                      <Bar
                        key={projName}
                        dataKey={projName}
                        stackId="a"
                        fill={WORKER_COLORS[i % WORKER_COLORS.length]}
                        radius={i === allProjectNames.length - 1 ? [0, 4, 4, 0] : undefined}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Worker summary table */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen por Trabajador</CardTitle>
            </CardHeader>
            <CardContent>
              {workerStats.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                  No hay datos — asigna trabajadores al crear tareas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 pr-4 text-gray-500 font-medium">Trabajador</th>
                        <th className="text-center py-3 px-4 text-gray-500 font-medium">Tareas completadas</th>
                        <th className="text-center py-3 px-4 text-gray-500 font-medium">Proyectos</th>
                        <th className="text-left py-3 pl-4 text-gray-500 font-medium">Proyectos involucrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workerStats.map((w, index) => (
                        <tr key={w.trabajador} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                style={{ backgroundColor: WORKER_COLORS[index % WORKER_COLORS.length] }}
                              >
                                {w.trabajador.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="font-medium">{w.trabajador}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary">{w.tareas}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-gray-700">{w.proyectos}</span>
                          </td>
                          <td className="py-3 pl-4 text-gray-500 text-xs">{w.proyectosNombres}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchProjects } from '../lib/storage';
import { Project } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  PauseCircle,
  FolderOpen,
  TrendingUp,
  ListChecks,
  ArrowRight,
  CalendarRange,
  X,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:    { label: 'Activo',     color: '#3b82f6', bg: 'bg-blue-100',  text: 'text-blue-700',  icon: Clock        },
  completed: { label: 'Completado', color: '#10b981', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  'on-hold': { label: 'En Pausa',   color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700', icon: PauseCircle  },
} satisfies Record<Project['status'], { label: string; color: string; bg: string; text: string; icon: React.ElementType }>;

const PROJECT_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#ef4444',
];

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

// Quick preset helpers
const PRESETS = [
  {
    label: 'Últ. mes',
    get: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
  },
  {
    label: 'Últ. 3 meses',
    get: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
  },
  {
    label: 'Últ. 6 meses',
    get: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
  },
  {
    label: 'Este año',
    get: () => {
      const year = new Date().getFullYear();
      return { start: `${year}-01-01`, end: toDateStr(new Date()) };
    },
  },
  {
    label: 'Todo',
    get: () => ({ start: '', end: '' }),
  },
];

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold mb-1 text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill || p.color }}>
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function RadialProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const data = [{ value, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <RadialBarChart
          width={80} height={80}
          innerRadius={28} outerRadius={38}
          data={data}
          startAngle={90} endAngle={-270}
          barSize={10}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
        </RadialBarChart>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
          {value}%
        </span>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardOverviewPage() {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchProjects();
      setAllProjects(data);
    };
    load();
  }, []);

  // ── Date filter state ────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [activePreset, setActivePreset] = useState('Todo');

  const applyPreset = (preset: typeof PRESETS[number]) => {
    const { start, end } = preset.get();
    setStartDate(start);
    setEndDate(end);
    setActivePreset(preset.label);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setActivePreset('Todo');
  };

  const isFiltered = startDate !== '' || endDate !== '';

  // ── Filtered projects ────────────────────────────────────────────────────
  // A project is included if its createdAt falls within the selected range.
  // When no filter is active, all projects are included.
  const projects = useMemo(() => {
    if (!startDate && !endDate) return allProjects;
    const start = startDate ? new Date(startDate).getTime()            : -Infinity;
    const end   = endDate   ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
    return allProjects.filter(p => {
      const t = p.createdAt.getTime();
      return t >= start && t <= end;
    });
  }, [allProjects, startDate, endDate]);

  // ── Derived metrics ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = projects.length;
    const active     = projects.filter(p => p.status === 'active').length;
    const completed  = projects.filter(p => p.status === 'completed').length;
    const onHold     = projects.filter(p => p.status === 'on-hold').length;
    const totalTasks = projects.reduce((s, p) => s + p.tasks.length, 0);
    const doneTasks  = projects.reduce((s, p) => s + p.tasks.filter(t => t.completed).length, 0);
    const overallPct = pct(doneTasks, totalTasks);
    return { total, active, completed, onHold, totalTasks, doneTasks, overallPct };
  }, [projects]);

  const projectProgressData = useMemo(() =>
    projects
      .filter(p => p.tasks.length > 0)
      .map((p, i) => ({
        name:     p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
        fullName: p.name,
        progress: pct(p.tasks.filter(t => t.completed).length, p.tasks.length),
        done:     p.tasks.filter(t => t.completed).length,
        total:    p.tasks.length,
        color:    PROJECT_PALETTE[i % PROJECT_PALETTE.length],
        status:   p.status,
      }))
      .sort((a, b) => b.progress - a.progress),
  [projects]);

  const statusPieData = useMemo(() => [
    { name: 'Activos',     value: stats.active,    color: STATUS_CONFIG.active.color    },
    { name: 'Completados', value: stats.completed,  color: STATUS_CONFIG.completed.color },
    { name: 'En Pausa',    value: stats.onHold,     color: STATUS_CONFIG['on-hold'].color },
  ].filter(d => d.value > 0), [stats]);

  const taskStackData = useMemo(() =>
    projects
      .filter(p => p.tasks.length > 0)
      .map(p => ({
        name:        p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name,
        fullName:    p.name,
        Completadas: p.tasks.filter(t => t.completed).length,
        Pendientes:  p.tasks.filter(t => !t.completed).length,
      })),
  [projects]);

  const activeProjects = useMemo(() =>
    projects
      .filter(p => p.status === 'active' && p.tasks.length > 0)
      .map((p, i) => ({
        ...p,
        progress: pct(p.tasks.filter(t => t.completed).length, p.tasks.length),
        color: PROJECT_PALETTE[i % PROJECT_PALETTE.length],
      })),
  [projects]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Avance Porcentual</h2>
          <p className="text-gray-500 mt-1">
            {isFiltered
              ? `Proyectos creados entre ${startDate || '…'} y ${endDate || '…'} · ${projects.length} de ${allProjects.length} proyectos`
              : 'Vista general del progreso de todos los proyectos'}
          </p>
        </div>
      </div>

      {/* ── Date range filter ── */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
            {/* Icon */}
            <div className="hidden sm:flex w-9 h-9 bg-blue-100 rounded-lg items-center justify-center flex-shrink-0 mb-0.5">
              <CalendarRange className="w-4.5 h-4.5 text-blue-600" />
            </div>

            {/* Inputs */}
            <div className="flex items-end gap-3 flex-wrap flex-1">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Desde</Label>
                <Input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={e => { setStartDate(e.target.value); setActivePreset(''); }}
                  className="h-9 w-40 bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Hasta</Label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={e => { setEndDate(e.target.value); setActivePreset(''); }}
                  className="h-9 w-40 bg-white"
                />
              </div>

              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={clearFilter} className="h-9 gap-1.5 text-gray-500 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activePreset === preset.label
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active range display */}
          {isFiltered && (
            <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-2 text-xs text-blue-700">
              <CalendarRange className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Mostrando <strong>{projects.length}</strong> proyecto{projects.length !== 1 ? 's' : ''} creados
                {startDate && <> desde <strong>{new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></>}
                {endDate   && <> hasta <strong>{new Date(endDate   + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></>}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {projects.length === 0 && (
        <Card className="py-16">
          <CardContent className="text-center">
            <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Sin proyectos en este período</p>
            <p className="text-sm text-gray-400 mt-1">Ajusta el rango de fechas para ver resultados</p>
            <Button variant="outline" size="sm" onClick={clearFilter} className="mt-4">
              Ver todos los proyectos
            </Button>
          </CardContent>
        </Card>
      )}

      {projects.length > 0 && (
        <>
          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Proyectos',
                value: stats.total,
                sub: `${stats.active} activos`,
                icon: FolderOpen,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
              },
              {
                label: 'Proyectos Completados',
                value: stats.completed,
                sub: `${pct(stats.completed, stats.total)}% del total`,
                icon: CheckCircle2,
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
              },
              {
                label: 'Tareas Finalizadas',
                value: stats.doneTasks,
                sub: `de ${stats.totalTasks} totales`,
                icon: ListChecks,
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600',
              },
              {
                label: 'Progreso Global',
                value: `${stats.overallPct}%`,
                sub: 'tareas completadas',
                icon: TrendingUp,
                iconBg: 'bg-amber-100',
                iconColor: 'text-amber-600',
              },
            ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
              <Card key={label}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                    <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Row 1: progress bars + pie ── */}
          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Progreso por Proyecto</CardTitle>
                <CardDescription>Porcentaje de tareas completadas en cada proyecto</CardDescription>
              </CardHeader>
              <CardContent>
                {projectProgressData.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">No hay proyectos con tareas</p>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(220, projectProgressData.length * 44)}>
                    <BarChart
                      data={projectProgressData}
                      layout="vertical"
                      margin={{ top: 0, right: 50, left: 8, bottom: 0 }}
                      barSize={16}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-sm">
                              <p className="font-semibold text-gray-700">{d.fullName}</p>
                              <p style={{ color: d.color }}>Progreso: <b>{d.progress}%</b></p>
                              <p className="text-gray-500">{d.done} de {d.total} tareas</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="progress" radius={[0, 6, 6, 0]} label={{ position: 'right', formatter: (v: number) => `${v}%`, fontSize: 11 }}>
                        {projectProgressData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Estado de Proyectos</CardTitle>
                <CardDescription>Distribución por estado actual</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {statusPieData.length === 0 ? (
                  <p className="text-gray-400 py-10 text-sm">Sin datos</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number, name: string) => [`${v} proyecto${v !== 1 ? 's' : ''}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      {statusPieData.map(({ name, value, color }) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm text-gray-600">{name}</span>
                          </div>
                          <span className="text-sm font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Row 2: stacked tasks + radials ── */}
          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Tareas por Proyecto</CardTitle>
                <CardDescription>Comparativo de tareas completadas y pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                {taskStackData.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">Sin datos</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={taskStackData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} height={55} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<BarTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '4px' }} />
                      <Bar dataKey="Completadas" stackId="a" fill="#10b981" />
                      <Bar dataKey="Pendientes"  stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Proyectos Activos</CardTitle>
                <CardDescription>Progreso individual de cada proyecto en curso</CardDescription>
              </CardHeader>
              <CardContent>
                {activeProjects.length === 0 ? (
                  <p className="text-center text-gray-400 py-10 text-sm">No hay proyectos activos con tareas en este período</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-5 py-2">
                    {activeProjects.map(p => (
                      <RadialProgress key={p.id} value={p.progress} color={p.color} label={p.name.length > 16 ? p.name.slice(0, 14) + '…' : p.name} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Row 3: project table ── */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Proyectos</CardTitle>
              <CardDescription>
                {isFiltered
                  ? `${projects.length} proyecto${projects.length !== 1 ? 's' : ''} en el período seleccionado`
                  : 'Métricas individuales por proyecto'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {['Proyecto', 'Estado', 'Creado', 'Tareas', 'Progreso', ''].map(h => (
                        <th key={h} className={`py-3 text-gray-500 font-medium ${h === '' ? 'w-10' : 'text-left pr-4'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, i) => {
                      const done  = project.tasks.filter(t => t.completed).length;
                      const total = project.tasks.length;
                      const prog  = pct(done, total);
                      const cfg   = STATUS_CONFIG[project.status];
                      const Icon  = cfg.icon;
                      const color = PROJECT_PALETTE[i % PROJECT_PALETTE.length];

                      return (
                        <tr key={project.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                              <span className="font-medium text-gray-900">{project.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 ml-4 mt-0.5 truncate max-w-xs">{project.description}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                            {project.createdAt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-gray-700">{done}</span>
                            <span className="text-gray-400"> / {total}</span>
                          </td>
                          <td className="py-3 pr-4 min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{ width: `${prog}%`, backgroundColor: color }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 w-8 text-right">{prog}%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => navigate(`/project/${project.id}`)}>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

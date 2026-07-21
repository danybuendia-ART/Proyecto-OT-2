import { useState, useEffect } from 'react';
import { useParams, useNavigate, Form } from 'react-router';
import { fetchProject, getProject, addTask, updateTask, deleteTask, updateProject, getEmployees, isImage } from '../lib/storage';
import { deleteEvidence } from '../lib/evidence';
import { apiRequest } from '../apiClient';
import { Employee } from '../lib/types';
import { Project, Task, DEMO_WORKERS } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  PauseCircle,
  ListTodo,
  User,
  CalendarDays,
  Paperclip,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { p } from 'node_modules/react-router/dist/development/index-react-server-client-CACgcj2J.mjs';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    unit: '',
    quantity: 0,
    completed: false,
    assignedTo: '',
    dueDate: undefined as Date | undefined,
  });

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;

      const proj = await fetchProject(projectId);
      if (proj) {
        setProject(proj);
        return;
      }

      const fallback = getProject(projectId);
      if (fallback) {
        setProject(fallback);
        return;
      }

      navigate('/');
    };
    load();
    // load employees
    (async () => {
      try {
        const emps = await getEmployees();
        setEmployees(emps);
      } catch (e) {
        console.error('Error loading employees', e);
      }
    })();
  }, [projectId, navigate]);

  const loadProject = async () => {
    if (!projectId) return;
    const proj = await fetchProject(projectId);
    if (proj) {
      setProject(proj);
    } else {
      const fallback = getProject(projectId);
      if (fallback) {
        setProject(fallback);
      } else {
        navigate('/');
      }
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectId) {

      if (newTask.quantity == 0) {
        return toast.warning("la cantidad no puede ser 0");
      }
      if (newTask.assignedTo == "") {
        return toast.warning("Se requiere asignar un trabajador");
      }
      addTask(projectId, newTask);
      setIsDialogOpen(false);
      setNewTask({ title: '', description: '', unit: '', quantity: 0, completed: false, assignedTo: '', dueDate: undefined });
      // Enviar al endpoint remoto 'tasks'
      (async () => {
        try {

          const payload = { action: "create", projectId, ...newTask };
          await apiRequest('tasks', payload, 'POST');
          toast.success('Tarea creada');
          loadProject();
        } catch (err) {
          console.error('Error enviando tarea al servidor', err);
          toast.error('Error al enviar la tarea al servidor');
        }
      })();
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (projectId) {
      await updateTask(projectId, taskId, { completed });
      loadProject();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?') && projectId) {
      await deleteTask(projectId, taskId);
      loadProject();
      toast.success('Tarea eliminada');
    }
  };

  const handleUpdateProjectStatus = async (status: Project['status']) => {
    if (projectId) {
      await updateProject(projectId, { status });
      loadProject();
      toast.success('Estado actualizado');
    }
  };

  if (!project) {
    return null;
  }

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'on-hold':
        return <PauseCircle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'on-hold':
        return 'En Pausa';
    }
  };

  const toggleEvidence = (taskId: string) => {
    setExpandedEvidence(prev => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Proyectos
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold">{project.name}</h2>
            <p className="text-gray-500 mt-2">{project.description}</p>
          </div>

          <Select
            value={project.status}
            onValueChange={(value: Project['status']) => handleUpdateProjectStatus(value)}
          >
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                {getStatusIcon(project.status)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activo
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completado
                </div>
              </SelectItem>
              <SelectItem value="on-hold">
                <div className="flex items-center gap-2">
                  <PauseCircle className="w-4 h-4" />
                  En Pausa
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso General</span>
            <span className="font-medium">{completedTasks} de {totalTasks} tareas completadas</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Tareas</h3>
          <p className="text-gray-500 mt-1">Gestiona las tareas del proyecto</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
              <DialogDescription>
                Agrega una nueva tarea al proyecto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    placeholder="ej: horas, kg, m²"
                    value={newTask.unit}
                    onChange={(e) => setNewTask({ ...newTask, unit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTask.quantity}
                    onChange={(e) => setNewTask({ ...newTask, quantity: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha límite (para calendario)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate ? newTask.dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined })
                  } required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Asignar a (trabajador)</Label>
                <Select
                  value={newTask.assignedTo}
                  onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Seleccionar trabajador" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length > 0 ? (
                      employees.map((w) => (
                        <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                      ))
                    ) : (
                      // Fallback to demo workers if API/local list is empty
                      DEMO_WORKERS.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Tarea</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {project.tasks.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay tareas en este proyecto</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primera tarea para comenzar</p>
          </CardContent>
        </Card>
      ) : (

        <div className="space-y-3">
          {project.tasks.map((task) => {
            const evidenceCount = task.evidences?.length ?? 0;
            const isOpen = expandedEvidence.has(task.id);
            return <Card key={task.id} className={task.completed ? 'bg-gray-50' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      handleToggleTask(task.id, checked as boolean)
                    }
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <Badge variant="outline" className="font-normal">
                        Cantidad: {task.quantity} {task.unit}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline" className="font-normal">
                          <CalendarDays className="w-3 h-3 mr-1" />
                          {task.dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </Badge>
                      )}
                      {task.assignedTo && (
                        <Badge variant="secondary" className="font-normal">
                          <User className="w-3 h-3 mr-1" />
                          {task.assignedTo}
                        </Badge>
                      )}
                      {task.completed && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completada
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Creada: {task.createdAt.toLocaleDateString()}
                    </p>
                    {/*Evidencias agregadas */}
                    <button
                      onClick={() => toggleEvidence(task.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors rounded-md px-2 py-1
                        ${isOpen
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />

                      {evidenceCount > 0
                        ? `${evidenceCount} evidencia${evidenceCount > 1 ? 's' : ''}`
                        : 'Sin evidencias'}

                      {isOpen
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                      }
                    </button>
                    {isOpen && (
                      <div className='mt-3 space-y-2'>
                        {task.evidences?.map(evidence => (
                          < div
                            key={evidence.id}
                            className='relative border rounded-lg overflow-hidden bg-white p-3'>
                            <div>
                              <div className='flex items-start justify-between'>
                                <p className='font-medium text-sm'>
                                  {evidence.fileName}
                                </p>
                                <Button 
                                variant = "ghost"
                                size= "icon"
                                onClick={()=> deleteEvidence(String(evidence.id))}
                                >
                                  <Trash2 className='w-4 h-4 text-red-500'/>
                                </Button>
                              </div>
                              <div className='text-xs text-gray-500 space-y-1'>
                                {evidence.uploadedBy && (
                                  <p>Subido por: {evidence.uploadedBy}</p>
                                )}

                                {evidence.startDate && (
                                  <p>Fecha: {" "}{new Date(evidence.startDate).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>

                            <div className='flex gap-2'>
                              {evidence.url && (
                                <a
                                  href={evidence.url}
                                  target='_blank'
                                  rel='noopener noreferrer'

                                ></a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          }
          )}
        </div>
      )}
    </div>
  );
}

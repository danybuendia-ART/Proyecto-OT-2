import { useState, useEffect } from 'react';
import { useParams, useNavigate, Form } from 'react-router';
import { fetchProject, getProject, addTask, updateTask, deleteTask, updateProject, getEmployees, isImage, updateTaskDetails } from '../lib/storage';
import { deleteEvidence, formatFileSize, MAX_FILE_SIZE } from '../lib/evidence';
import { apiRequest, apiUploadFile } from '../apiClient';
import { Employee } from '../lib/types';
import { Project, Task, DEMO_WORKERS, TaskEvidence } from '../lib/types';
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
  ChevronDown,
  X,
  Delete,
  Upload,
  FileText,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser } from '../lib/auth';

const infoUser = getCurrentUser();
const userName = infoUser?.nombre;

const filesEvidences_URL = import.meta.env.VITE_API_URL;

const EVIDENCE_BASE_URL = import.meta.env.VITE_API_PROXY_TARGET + '/evidences/';

const normalizeEvidenceFileUrl = (fileName: string) => {
  const encodedFileName = fileName.split('/').map(encodeURIComponent).join('/');
  return `${EVIDENCE_BASE_URL.replace(/\/+$|^\s+/, '')}/${encodedFileName}`;
};

const resolveEvidenceUrl = (item: { url?: string; fileName: string }) => {
  if (!item.url) {
    return normalizeEvidenceFileUrl(item.fileName);
  }

  try {
    const baseUrl = filesEvidences_URL || EVIDENCE_BASE_URL;
    return new URL(item.url, baseUrl).href;
  } catch {
    return normalizeEvidenceFileUrl(item.fileName);
  }
};

const isImageEvidence = (item: { type?: string; fileName: string }) =>
  item.type?.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(item.fileName);

const prepareUploadFile = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;

  const shouldCompress = file.size > 2 * 1024 * 1024 || ['image/heic', 'image/heif', 'image/avif'].includes(file.type);
  if (!shouldCompress) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('No se pudo comprimir la imagen'));
      }, 'image/jpeg', 0.85);
    });

    bitmap.close();

    return new File(
      [blob],
      file.name.replace(/\.(heic|heif|avif|png|webp|jpe?g)$/i, '.jpg'),
      { type: 'image/jpeg', lastModified: Date.now() }
    );
  } catch {
    return file;
  }
};


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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskComment, setEditingTaskComment] = useState('');
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  let totalCompletedQuantity = 0;
  if (project) {
    totalCompletedQuantity = project.tasks.reduce((sum, task) => {
      if (task.completed) {
        return sum + task.quantity;
      }
      return sum;
    }, 0);
  }

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

          const payload = { action: "create", projectId, ...newTask, unit: project?.projectUnit };
          console.log("payload: ", payload)
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
      await deleteTask(taskId);
      loadProject();
      toast.success('Tarea eliminada');
    }
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setEditingTaskComment('');
    setIsEditTaskDialogOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !editingTask) return;

    try {
      const response = await updateTaskDetails(projectId, editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        quantity: editingTask.quantity,
        unit: editingTask.unit,
        completed: editingTask.completed,
        assignedTo: editingTask.assignedTo,
        dueDate: editingTask.dueDate,
        comment: editingTaskComment,
      });

      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
      setEditingTaskComment('');
      await loadProject();
      toast.success(response ?? 'Tarea actualizada');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar la tarea');
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

  const handleUploadEvidence = async (
    taskId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);

    let uploadedAny = false;

    try {
      for (let file of Array.from(files)) {
        const normalized = await prepareUploadFile(file);

        if (normalized.size > MAX_FILE_SIZE) {
          toast.error(`"${normalized.name}" supera el limite de ${formatFileSize(MAX_FILE_SIZE)}`);
          continue;
        }

        await apiUploadFile("files", normalized, {
          taskId, action: "evidences",
          uploadedBy: userName
        })

        uploadedAny = true;

        toast.success(`"${normalized.name}" subido correctamente`);

        if (uploadedAny) {
          await loadProject();
        }
      }
    } catch (err: any) {
      const message = err?.message ?? "Error al subir el archivo";
      toast.error(message)
    } finally {
      setUploading(false);
    }
  };
  const toggleEvidence = (taskId: string) => {
    setExpandedEvidence(prev => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  const createEvidenceId = (item: TaskEvidence) =>
    item.id ?? `${item.fileName}-${item.uploadedAt?.getTime() ?? Date.now()}-${Math.random().toString(16).slice(2)}`;

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
            <p className="text-gray-500 mt-2">Realizado :  {totalCompletedQuantity} {project.projectUnit} De: {project.projectQuantity} {project.projectUnit}</p>
            <p className="text-gray-500 mt-2">Faltante: {Math.max(0, Number(project.projectQuantity) - totalCompletedQuantity)} {project.projectUnit}</p>
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
                    value={project.projectUnit}
                    disabled
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
                <select
                  id="assignedTo"
                  required
                  className="w-full border rounded-md p-2"
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      assignedTo: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar trabajador</option>

                  {employees.length > 0
                    ? employees.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))
                    : DEMO_WORKERS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                </select>

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

            //const imageEvidences = task.evidences?.filter(e => isImageEvidence(e));
            //const documentEvidences = task.evidences?.filter(e => !isImageEvidence(e));

            const images: any = task.evidences?.filter((item: TaskEvidence) => isImageEvidence(item));
            const docs: any = task.evidences?.filter((item: TaskEvidence) => !isImageEvidence(item));

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
                      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditTask(task)}
                          >
                            <Edit className="w-4 h-full text-blue-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar tarea</DialogTitle>
                            <DialogDescription>
                              Modifica los datos de la tarea y agrega un comentario opcional.
                            </DialogDescription>
                          </DialogHeader>

                          {editingTask && (
                            <form onSubmit={handleUpdateTask} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-task-title">Título</Label>
                                <Input
                                  id="edit-task-title"
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-task-description">Descripción</Label>
                                <Textarea
                                  id="edit-task-description"
                                  value={editingTask.description}
                                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-task-dueDate">Fecha límite (para calendario)</Label>
                                <Input
                                  id="edit-task-dueDate"
                                  type="date"
                                  value={editingTask.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : ''}
                                  onChange={(e) =>
                                    setEditingTask({
                                      ...editingTask,
                                      dueDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined,
                                    })
                                  }
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-task-quantity">Cantidad</Label>
                                  <Input
                                    id="edit-task-quantity"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editingTask.quantity}
                                    onChange={(e) => setEditingTask({ ...editingTask, quantity: Number(e.target.value) })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-task-unit">Unidad</Label>
                                  <Input
                                    id="edit-task-unit"
                                    value={editingTask.unit}
                                    onChange={(e) => setEditingTask({ ...editingTask, unit: e.target.value })}
                                    disabled
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-task-assignedTo">Asignar a</Label>
                                <select
                                  id="edit-task-assignedTo"
                                  className="w-full border rounded-md p-2"
                                  value={editingTask.assignedTo ?? ''}
                                  onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                                >
                                  <option value="">Seleccionar trabajador</option>
                                  {employees.length > 0
                                    ? employees.map((worker) => (
                                      <option key={worker.id} value={worker.name}>
                                        {worker.name}
                                      </option>
                                    ))
                                    : DEMO_WORKERS.map((worker) => (
                                      <option key={worker} value={worker}>
                                        {worker}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-task-comment">Comentario</Label>
                                <Textarea
                                  id="edit-task-comment"
                                  value={editingTaskComment}
                                  onChange={(e) => setEditingTaskComment(e.target.value)}
                                  placeholder="Agrega un comentario (opcional)"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="edit-task-completed"
                                  checked={editingTask.completed}
                                  onCheckedChange={(checked) =>
                                    setEditingTask({ ...editingTask, completed: checked === true })
                                  }
                                />
                                <Label htmlFor="edit-task-completed">Marcar como completada</Label>
                              </div>

                              <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button type="submit">Guardar cambios</Button>
                              </div>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      comentario o justificacion:
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <Textarea readOnly value={task.comment || 'N/A'} />
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

                      fecha de creación: {task.createdAt.toLocaleDateString()}
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
                      <div className="mt-3 space-y-3">

                        {/* Agregar evidencia */}
                        <div className="border rounded-lg p-3 bg-gray-50">
                          <Label htmlFor={`evidence-${task.id}`}>
                            Adjuntar evidencia
                          </Label>

                          <Input
                            id={`evidence-${task.id}`}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            onChange={(e) => handleUploadEvidence(task.id, e)}
                            multiple
                          />
                        </div>

                        {/* Evidencias existentes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {/* Image gallery */}
                          {images.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fotos y Documentos</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {images.map((item: TaskEvidence, index: number) => {
                                  const url = resolveEvidenceUrl(item);
                                  return (
                                    <div key={createEvidenceId(item)} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border">
                                      <img
                                        src={url}
                                        alt={item.fileName}
                                        className="w-full h-full object-cover"
                                      />
                                      {/* Overlay */}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                                        <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                          <p className="text-white text-xs truncate">{item.fileName}</p>
                                          <p className="text-white/70 text-xs">{item.size ? formatFileSize(item.size) : ''}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          const confirmed = window.confirm(
                                            "¿Estás seguro de eliminar esta evidencia?"
                                          );

                                          if (!confirmed) return;

                                          await deleteEvidence(item.id ?? item.fileName);
                                          await loadProject();
                                        }}
                                        className="absolute top-2 right-2 z-20 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-opacity hover:bg-red-600"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                      ``
                                      {/* Full-size view */}
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 z-0 pointer-events-auto"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Document list */}
                          {docs.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentos</h4>
                              <div className="space-y-2">
                                {docs.map((item: TaskEvidence, index: number) => (
                                  <div key={createEvidenceId(item)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{item.fileName}</p>
                                      <p className="text-xs text-gray-400">
                                        {[
                                          item.size ? formatFileSize(item.size) : null,
                                          item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString('es-ES') : null,
                                          item.uploadedBy || null,
                                        ].filter(Boolean).join(' · ') || '—'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={resolveEvidenceUrl(item)}
                                        download={item.fileName}
                                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                        title="Descargar"
                                      >
                                        <Upload className="w-3.5 h-3.5 text-gray-500 rotate-180" />
                                      </a>
                                      <button
                                        onClick={async () => {
                                          const confirmed = window.confirm(
                                            "¿Estás seguro de eliminar esta evidencia?"
                                          );

                                          if (!confirmed) return;

                                          await deleteEvidence(item.id ?? item.fileName);
                                          await loadProject();

                                        }
                                        }
                                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>


                          )}
                        </div>
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

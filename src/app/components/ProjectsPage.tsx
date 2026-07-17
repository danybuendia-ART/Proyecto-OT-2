import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { fetchProjects, getProjects, addProject, deleteProject, getEmployees } from '../lib/storage';
import { Project, Employee } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, FolderOpen, Trash2, CheckCircle2, Clock, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active' as Project['status'],
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    (async () => {
      try {
        const emps = await getEmployees();
        setEmployees(emps);
      } catch (e) {
        console.error('Error loading employees', e);
      }
    })();
  }, []);

  const loadProjects = async () => {
    const data = await fetchProjects();

    setProjects(data);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProject(newProject);
    setIsDialogOpen(false);
    setNewProject({ name: '', description: '', status: 'active' });
    await loadProjects();
    toast.success('Proyecto creado exitosamente');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      deleteProject(id);
      console.log("id del proyecto eliminado: ", id)
      loadProjects();
      toast.success('Proyecto eliminado');
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'on-hold':
        return <PauseCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-400';
      case 'completed':
        return 'bg-green-500';
      case 'on-hold':
        return 'bg-yellow-500';
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

  const getCardClass = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-50";
      case "completed":
        return "bg-green-50";
      case "on-hold":
        return "bg-yellow-50";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Mis Proyectos</h2>
          <p className="text-gray-500 mt-1">Gestiona tus proyectos y tareas</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Ingresa los detalles del proyecto
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proyecto</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value: Project["status"]) =>
                    setNewProject({ ...newProject, status: value })
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="on-hold">En Pausa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Proyecto</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tienes proyectos aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea tu primer proyecto para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="rounded-md border">
            <table className="w-full min-w-900px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Descripción</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Progreso</th>
                  <th className="p-3 text-left">Fecha Creación</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => {
                  const completedTasks = project.tasks.filter(
                    (t) => t.completed
                  ).length;

                  const totalTasks = project.tasks.length;

                  const progress =
                    totalTasks > 0
                      ? (completedTasks / totalTasks) * 100
                      : 0;

                  return (
                    <tr
                      key={project.id}
                      className={"border-b hover:bg-gray-200 cursor-pointer"}
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <td className="p-3 font-medium">
                        {project.name}
                      </td>

                      <td className="p-3">
                        {project.description}
                      </td>

                      <td className="p-3">
                        <Badge
                          className={`flex w-fit items-center gap-1 ${getStatusColor(project.status)}`}
                        >
                          {getStatusIcon(project.status)}
                          {getStatusLabel(project.status)}
                        </Badge>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-28 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            {completedTasks}/{totalTasks}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        {project.createdAt.toLocaleDateString()}
                      </td>

                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

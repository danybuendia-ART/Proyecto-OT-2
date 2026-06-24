import { useState, useEffect } from 'react';
import { getMaterials, getProjects, addMaterial, updateMaterial, deleteMaterial } from '../lib/storage';
import { Material, MaterialPriority, Project } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, ShoppingCart, Edit2, Trash2, Package, Clock, Truck, CheckCircle2, Flame, AlertTriangle, Minus } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_CONFIG: Record<MaterialPriority, { label: string; icon: React.ReactNode; colorClass: string; badgeClass: string }> = {
  urgente: {
    label: 'Urgente',
    icon: <Flame className="w-3 h-3" />,
    colorClass: 'text-red-600',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
  },
  alta: {
    label: 'Alta',
    icon: <AlertTriangle className="w-3 h-3" />,
    colorClass: 'text-orange-600',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  normal: {
    label: 'Normal',
    icon: <Clock className="w-3 h-3" />,
    colorClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  baja: {
    label: 'Baja',
    icon: <Minus className="w-3 h-3" />,
    colorClass: 'text-gray-500',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export function PurchasesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [newMaterial, setNewMaterial] = useState({
    projectId: '',
    name: '',
    description: '',
    quantity: 1,
    unit: '',
    status: 'en espera' as Material['status'],
    priority: 'normal' as MaterialPriority,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMaterials(getMaterials());
    setProjects(getProjects());
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.projectId) {
      toast.error('Selecciona un proyecto');
      return;
    }
    addMaterial(newMaterial);
    setIsDialogOpen(false);
    setNewMaterial({
      projectId: '',
      name: '',
      description: '',
      quantity: 1,
      unit: '',
      status: 'en espera',
      priority: 'normal',
    });
    loadData();
    toast.success('Material agregado exitosamente');
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    updateMaterial(editingMaterial.id, {
      name: editingMaterial.name,
      description: editingMaterial.description,
      quantity: editingMaterial.quantity,
      unit: editingMaterial.unit,
      status: editingMaterial.status,
      priority: editingMaterial.priority,
    });

    setIsEditDialogOpen(false);
    setEditingMaterial(null);
    loadData();
    toast.success('Material actualizado exitosamente');
  };

  const handleDeleteMaterial = (material: Material) => {
    if (material.status === 'en camino' || material.status === 'entregado') {
      toast.error('No puedes eliminar materiales en camino o entregados');
      return;
    }

    if (confirm('¿Estás seguro de eliminar este material?')) {
      deleteMaterial(material.id);
      loadData();
      toast.success('Material eliminado');
    }
  };

  const getStatusIcon = (status: Material['status']) => {
    switch (status) {
      case 'en espera': return <Clock className="w-4 h-4" />;
      case 'en camino': return <Truck className="w-4 h-4" />;
      case 'entregado': return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusClass = (status: Material['status']) => {
    switch (status) {
      case 'en espera': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'en camino': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'entregado': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const canEdit = (material: Material) =>
    material.status !== 'en camino' && material.status !== 'entregado';

  const filteredMaterials = selectedProject === 'all'
    ? materials
    : materials.filter(m => m.projectId === selectedProject);

  // Sort: urgente first, then alta, normal, baja
  const priorityOrder: MaterialPriority[] = ['urgente', 'alta', 'normal', 'baja'];
  const sortedMaterials = [...filteredMaterials].sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  );

  const getProjectName = (projectId: string) =>
    projects.find(p => p.id === projectId)?.name || 'Desconocido';

  const materialsByStatus = {
    'en espera': filteredMaterials.filter(m => m.status === 'en espera').length,
    'en camino': filteredMaterials.filter(m => m.status === 'en camino').length,
    'entregado': filteredMaterials.filter(m => m.status === 'entregado').length,
  };

  const urgentCount = filteredMaterials.filter(m => m.priority === 'urgente' && m.status !== 'entregado').length;
  const AltaCount = filteredMaterials.filter(m => m.priority === 'alta' && m.status !== 'entregado').length;
  const normalCount = filteredMaterials.filter(m => m.priority === 'normal' && m.status !== 'entregado').length;
  const bajaCount = filteredMaterials.filter(m => m.priority === 'baja' && m.status !== 'entregado').length;

  const PrioritySelect = ({ value, onChange }: { value: MaterialPriority; onChange: (v: MaterialPriority) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as MaterialPriority)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="urgente">🔴 Urgente — Se necesita de inmediato</SelectItem>
        <SelectItem value="alta">🟠 Alta — Se necesita pronto</SelectItem>
        <SelectItem value="normal">🔵 Normal — Plazo estándar</SelectItem>
        <SelectItem value="baja">⚪ Baja — Sin prisa</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Compras y Materiales</h2>
          <p className="text-gray-500 mt-1">Gestiona los materiales requeridos para cada proyecto</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Material</DialogTitle>
              <DialogDescription>
                Registra un nuevo material requerido para un proyecto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <Label htmlFor="project">Proyecto</Label>
                <Select
                  value={newMaterial.projectId}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, projectId: value })}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Nombre del Material</Label>
                <Input
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    placeholder="ej. piezas, m³, kg"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Prioridad de tiempo</Label>
                <PrioritySelect
                  value={newMaterial.priority}
                  onChange={(v) => setNewMaterial({ ...newMaterial, priority: v })}
                />
              </div>
              <div>
                <Label htmlFor="status">Estado de entrega</Label>
                <Select
                  value={newMaterial.status}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, status: value as Material['status'] })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en espera">En espera</SelectItem>
                    <SelectItem value="en camino">En camino</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Agregar Material</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Espera</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{materialsByStatus['en espera']}</div>
            <p className="text-xs text-gray-500 mt-1">Pendientes de gestión</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Camino</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{materialsByStatus['en camino']}</div>
            <p className="text-xs text-gray-500 mt-1">En tránsito</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{materialsByStatus['entregado']}</div>
            <p className="text-xs text-gray-500 mt-1">Completados</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={urgentCount > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <Flame className={`h-4 w-4 ${urgentCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${urgentCount > 0 ? 'text-red-600' : ''}`}>{urgentCount}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren atención inmediata</p>
          </CardContent>
        </Card>
        <Card className={AltaCount > 0 ? 'border-orange-200 bg-orange-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${AltaCount > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${AltaCount > 0 ? 'text-orange-600' : ''}`}>{AltaCount}</div>
            <p className="text-xs text-gray-500 mt-1">tiempo de espera 1 - 2 dias</p>
          </CardContent>
        </Card>
        <Card className={normalCount > 0 ? 'border-blue-200 bg-blue-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal</CardTitle>
            <Clock className={`h-4 w-4 ${normalCount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${normalCount > 0 ? 'text-blue-600' : ''}`}>{normalCount}</div>
            <p className="text-xs text-gray-500 mt-1">tiempo de espera 3 - 5 dias</p>
          </CardContent>
        </Card>
        <Card className={bajaCount > 0 ? 'border-green-200 bg-green-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baja</CardTitle>
            <Minus className={`h-4 w-4 ${bajaCount > 0 ? 'text-gray-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${bajaCount > 0 ? 'text-gray-600' : ''}`}>{bajaCount}</div>
            <p className="text-xs text-gray-500 mt-1">tiempo de espera 6 - 10 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="filter-project">Filtrar por proyecto:</Label>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger id="filter-project" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materials list */}
      <div className="space-y-3">
        {sortedMaterials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No hay materiales registrados</p>
            </CardContent>
          </Card>
        ) : (
          sortedMaterials.map((material) => {
            const prio = PRIORITY_CONFIG[material.priority ?? 'normal'];
            return (
              <Card key={material.id} className={material.priority === 'urgente' && material.status !== 'entregado' ? 'border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Package className="w-5 h-5 text-gray-400 shrink-0" />
                        <h3 className="font-semibold">{material.name}</h3>
                        {/* Priority badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${prio.badgeClass}`}>
                          {prio.icon}
                          {prio.label}
                        </span>
                        {/* Delivery status badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${getStatusClass(material.status)}`}>
                          {getStatusIcon(material.status)}
                          {material.status}
                        </span>
                      </div>
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                        <span>
                          <strong>Cantidad:</strong> {material.quantity} {material.unit}
                        </span>
                        <span>
                          <strong>Proyecto:</strong> {getProjectName(material.projectId)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Actualizado: {material.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMaterial(material)}
                        disabled={!canEdit(material)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMaterial(material)}
                        disabled={!canEdit(material)}
                        className={!canEdit(material) ? '' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
            <DialogDescription>
              Actualiza la información del material
            </DialogDescription>
          </DialogHeader>
          {editingMaterial && (
            <form onSubmit={handleUpdateMaterial} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre del Material</Label>
                <Input
                  id="edit-name"
                  value={editingMaterial.name}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editingMaterial.description}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Cantidad</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="1"
                    value={editingMaterial.quantity}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unidad</Label>
                  <Input
                    id="edit-unit"
                    value={editingMaterial.unit}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, unit: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Prioridad de tiempo</Label>
                <PrioritySelect
                  value={editingMaterial.priority ?? 'normal'}
                  onChange={(v) => setEditingMaterial({ ...editingMaterial, priority: v })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Estado de entrega</Label>
                <Select
                  value={editingMaterial.status}
                  onValueChange={(value) => setEditingMaterial({ ...editingMaterial, status: value as Material['status'] })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en espera">En espera</SelectItem>
                    <SelectItem value="en camino">En camino</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Material</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

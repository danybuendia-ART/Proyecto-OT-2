import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getEmployee, updateEmployee, addCertification, deleteCertification } from '../lib/storage';
import { Employee, Certification } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Shield, Clock,
  Plus, Trash2, CheckCircle2, AlertCircle, XCircle, Award, Edit2, Save, CreditCard,
  Building2, HeartPulse,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Badge ──────────────────────────────────────────────────────────────────
function EmployeeBadge({ employee }: { employee: Employee }) {
  const initials = employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-64 mx-auto select-none">
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[10px] font-medium tracking-widest uppercase">Empresa</p>
            <p className="text-white font-bold text-sm leading-tight">Gestión de Proyectos</p>
          </div>
          <Building2 className="w-5 h-5 text-white/70" />
        </div>
        <div className="px-5 pt-4 pb-5 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow flex items-center justify-center -mt-2">
            <span className="text-2xl font-bold text-blue-700">{initials}</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-base leading-tight">{employee.name}</p>
            <p className="text-blue-600 text-sm font-medium mt-0.5">{employee.position}</p>
            <p className="text-gray-400 text-xs mt-0.5">{employee.department}</p>
          </div>
          <div className="w-full border-t border-dashed border-gray-200" />
          <div className="w-full space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium w-20">Número:</span>
              <span className="font-mono font-semibold text-gray-800">{employee.employeeNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium w-20">Teléfono:</span>
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium w-20">Ingreso:</span>
              <span>{employee.startDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' })}</span>
            </div>
          </div>
          <div className="w-full bg-blue-50 rounded-lg px-3 py-2 flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider">Estado</span>
              <span className={`text-xs font-semibold ${employee.status === 'activo' ? 'text-green-600' : 'text-red-500'}`}>
                {employee.status === 'activo' ? '● Activo' : '● Inactivo'}
              </span>
            </div>
            <div className="flex gap-px">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="w-px bg-blue-300 opacity-70" style={{ height: i % 3 === 0 ? 18 : 12 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Certification card ──────────────────────────────────────────────────────
const CERT_STATUS_CONFIG = {
  vigente: { icon: <CheckCircle2 className="w-4 h-4" />, className: 'bg-green-50 border-green-200 text-green-700', badge: 'bg-green-100 text-green-700' },
  'por vencer': { icon: <AlertCircle className="w-4 h-4" />, className: 'bg-yellow-50 border-yellow-200 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  vencido: { icon: <XCircle className="w-4 h-4" />, className: 'bg-red-50 border-red-200 text-red-700', badge: 'bg-red-100 text-red-700' },
};

function CertCard({ cert, onDelete }: { cert: Certification; onDelete: () => void }) {
  const cfg = CERT_STATUS_CONFIG[cert.status];
  return (
    <div className={`relative rounded-xl border p-4 ${cfg.className} group`}>
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-current hover:scale-110"
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{cert.name}</p>
          <p className="text-xs opacity-75 mt-0.5">{cert.issuedBy}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
            </span>
            <span className="text-[10px] opacity-60 bg-white/50 px-2 py-0.5 rounded-full border border-current/20">{cert.category}</span>
          </div>
          <div className="mt-2 text-[11px] opacity-70 space-y-0.5">
            <div>Expedición: {cert.issuedDate.toLocaleDateString('es-MX')}</div>
            {cert.expiryDate && <div>Vencimiento: {cert.expiryDate.toLocaleDateString('es-MX')}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const BLANK_CERT = {
  name: '',
  issuedBy: '',
  issuedDate: '',
  expiryDate: '',
  status: 'vigente' as Certification['status'],
  category: '',
};

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [certForm, setCertForm] = useState(BLANK_CERT);

  const load = () => {
    if (!employeeId) return;
    const emp = getEmployee(employeeId);
    if (emp) { setEmployee(emp); setEditForm(emp); }
  };

  useEffect(() => { load(); }, [employeeId]);

  if (!employee) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <User className="w-12 h-12 mb-3" />
      <p>Empleado no encontrado</p>
      <Button variant="ghost" className="mt-4" onClick={() => navigate('/human-capital')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Volver
      </Button>
    </div>
  );

  const initials = employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSaveEdit = () => {
    updateEmployee(employee.id, editForm);
    load();
    setEditing(false);
    toast.success('Información actualizada');
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    addCertification(employee.id, {
      name: certForm.name,
      issuedBy: certForm.issuedBy,
      issuedDate: new Date(certForm.issuedDate),
      expiryDate: certForm.expiryDate ? new Date(certForm.expiryDate) : undefined,
      status: certForm.status,
      category: certForm.category,
    });
    setIsCertOpen(false);
    setCertForm(BLANK_CERT);
    load();
    toast.success('Certificado agregado');
  };

  const handleDeleteCert = (certId: string) => {
    if (!confirm('¿Eliminar este certificado?')) return;
    deleteCertification(employee.id, certId);
    load();
    toast.success('Certificado eliminado');
  };

  const totalOT = employee.overtimeRecords.reduce((s, r) => s + r.hours, 0);
  const certsByStatus = {
    vigente: employee.certifications.filter(c => c.status === 'vigente').length,
    'por vencer': employee.certifications.filter(c => c.status === 'por vencer').length,
    vencido: employee.certifications.filter(c => c.status === 'vencido').length,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate('/human-capital')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />Capital Humano
      </button>

      {/* Hero card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow-lg flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-blue-700">{initials}</span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  <div><Label className="text-xs">Nombre</Label>
                    <Input value={editForm.name ?? ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div><Label className="text-xs">N° Empleado</Label>
                    <Input value={editForm.employeeNumber ?? ''} onChange={e => setEditForm({ ...editForm, employeeNumber: e.target.value })} /></div>
                  <div><Label className="text-xs">Puesto</Label>
                    <Input value={editForm.position ?? ''} onChange={e => setEditForm({ ...editForm, position: e.target.value })} /></div>
                  <div><Label className="text-xs">Departamento</Label>
                    <Input value={editForm.department ?? ''} onChange={e => setEditForm({ ...editForm, department: e.target.value })} /></div>
                  <div><Label className="text-xs">Estado</Label>
                    <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v as Employee['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${employee.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {employee.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">{employee.employeeNumber}</span>
                  </div>
                  <p className="text-blue-600 font-medium mt-1">{employee.position}</p>
                  <p className="text-gray-500 text-sm">{employee.department}</p>
                </>
              )}
            </div>
            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsBadgeOpen(true)}>
                <CreditCard className="w-4 h-4 mr-2" />Gafete
              </Button>
              {editing ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit}><Save className="w-4 h-4 mr-2" />Guardar</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditForm(employee); }}>Cancelar</Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />Editar
                </Button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{employee.certifications.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Certificaciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{totalOT}</p>
              <p className="text-xs text-gray-500 mt-0.5">Horas extra totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {Math.floor((Date.now() - employee.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365))}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Años en la empresa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="certifications">
        <TabsList>
          <TabsTrigger value="certifications"><Award className="w-4 h-4 mr-2" />Certificaciones</TabsTrigger>
          <TabsTrigger value="personal"><User className="w-4 h-4 mr-2" />Información Personal</TabsTrigger>
          <TabsTrigger value="overtime"><Clock className="w-4 h-4 mr-2" />Historial de HE</TabsTrigger>
        </TabsList>

        {/* ── Certifications ─────────────────────────────────────── */}
        <TabsContent value="certifications" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" />{certsByStatus.vigente} vigentes
              </span>
              <span className="flex items-center gap-1.5 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <AlertCircle className="w-3.5 h-3.5" />{certsByStatus['por vencer']} por vencer
              </span>
              <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <XCircle className="w-3.5 h-3.5" />{certsByStatus.vencido} vencidas
              </span>
            </div>
            <Button size="sm" onClick={() => setIsCertOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />Agregar
            </Button>
          </div>

          {employee.certifications.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Award className="w-10 h-10 mb-2" />
              <p className="text-sm">Sin certificaciones registradas</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {employee.certifications.map(cert => (
                <CertCard key={cert.id} cert={cert} onDelete={() => handleDeleteCert(cert.id)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Personal info ──────────────────────────────────────── */}
        <TabsContent value="personal" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" />Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {editing ? (
                  <>
                    <div><Label className="text-xs">Correo</Label>
                      <Input value={editForm.email ?? ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                    <div><Label className="text-xs">Teléfono</Label>
                      <Input value={editForm.phone ?? ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                    <div><Label className="text-xs">Dirección</Label>
                      <Input value={editForm.address ?? ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 text-gray-600">
                      <Mail className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />{employee.email}
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <Phone className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />{employee.phone}
                    </div>
                    {employee.address && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />{employee.address}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" />Datos laborales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fecha ingreso</span>
                  <span className="font-medium">{employee.startDate.toLocaleDateString('es-MX')}</span>
                </div>
                {employee.birthDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha nacimiento</span>
                    <span className="font-medium">{employee.birthDate.toLocaleDateString('es-MX')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Departamento</span>
                  <span className="font-medium">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Puesto</span>
                  <span className="font-medium">{employee.position}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><HeartPulse className="w-4 h-4 text-red-400" />Contacto de emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {editing ? (
                  <>
                    <div><Label className="text-xs">Nombre</Label>
                      <Input value={editForm.emergencyContact ?? ''} onChange={e => setEditForm({ ...editForm, emergencyContact: e.target.value })} /></div>
                    <div><Label className="text-xs">Teléfono</Label>
                      <Input value={editForm.emergencyPhone ?? ''} onChange={e => setEditForm({ ...editForm, emergencyPhone: e.target.value })} /></div>
                  </>
                ) : (
                  <>
                    {employee.emergencyContact ? (
                      <>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />{employee.emergencyContact}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />{employee.emergencyPhone}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-xs">Sin contacto de emergencia registrado</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Overtime history ───────────────────────────────────── */}
        <TabsContent value="overtime" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Historial de horas extra
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employee.overtimeRecords.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Sin registros de horas extra</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-gray-600">Semana</th>
                      <th className="pb-2 font-medium text-gray-600 text-center">Horas</th>
                      <th className="pb-2 font-medium text-gray-600">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...employee.overtimeRecords]
                      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
                      .map(rec => (
                        <tr key={rec.id} className="border-b last:border-0">
                          <td className="py-3 text-gray-700">
                            {rec.weekStart.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            {' – '}
                            {rec.weekEnd.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-semibold text-orange-600">{rec.hours}h</span>
                          </td>
                          <td className="py-3 text-gray-500">{rec.notes ?? '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td className="pt-3 font-medium text-gray-600">Total</td>
                      <td className="pt-3 text-center font-bold text-orange-600">{totalOT}h</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add certification dialog */}
      <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Certificación</DialogTitle>
            <DialogDescription>Registra un certificado o credencial del empleado</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCert} className="space-y-3">
            <div>
              <Label>Nombre del certificado</Label>
              <Input placeholder="Seguridad en Obra" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} required />
            </div>
            <div>
              <Label>Expedido por</Label>
              <Input placeholder="IMSS, Google, PMI..." value={certForm.issuedBy} onChange={e => setCertForm({ ...certForm, issuedBy: e.target.value })} required />
            </div>
            <div>
              <Label>Categoría</Label>
              <Input placeholder="Seguridad, Técnico, Gestión..." value={certForm.category} onChange={e => setCertForm({ ...certForm, category: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha expedición</Label>
                <Input type="date" value={certForm.issuedDate} onChange={e => setCertForm({ ...certForm, issuedDate: e.target.value })} required />
              </div>
              <div>
                <Label>Vencimiento (opcional)</Label>
                <Input type="date" value={certForm.expiryDate} onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={certForm.status} onValueChange={v => setCertForm({ ...certForm, status: v as Certification['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vigente">Vigente</SelectItem>
                  <SelectItem value="por vencer">Por vencer</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setIsCertOpen(false)}>Cancelar</Button>
              <Button type="submit">Agregar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Badge dialog */}
      <Dialog open={isBadgeOpen} onOpenChange={setIsBadgeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gafete de Empleado</DialogTitle>
            <DialogDescription>Vista previa del gafete de identificación</DialogDescription>
          </DialogHeader>
          <EmployeeBadge employee={employee} />
          <div className="flex justify-center mt-2">
            <Button variant="outline" onClick={() => window.print()}>
              <CreditCard className="w-4 h-4 mr-2" />Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

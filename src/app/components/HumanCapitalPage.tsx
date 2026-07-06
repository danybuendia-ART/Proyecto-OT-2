import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, addOvertimeRecord } from '../lib/storage';
import { Employee } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Users, Plus, Clock, Award, CreditCard, Search, Edit2, Trash2,
    Phone, Mail, Building2, ChevronRight, AlertCircle, CheckCircle2, Timer,
} from 'lucide-react';
import { toast } from 'sonner';

// Returns the most recent Friday on or before the given date
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
    const diff = day >= 5 ? day - 5 : day + 2; // days back to Friday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekEnd(weekStart: Date): Date {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6); // Thursday
    return d;
}

const WEEK_DAYS = ['Vie', 'Sáb', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue'];

function formatDate(d: Date) {
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

// ─── Badge component (used in dialog) ─────────────────────────────────────────
function EmployeeBadge({ employee }: { employee: Employee }) {
    const initials = employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div className="w-64 mx-auto select-none">
            {/* Card */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                {/* Header stripe */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-white/70 text-[10px] font-medium tracking-widest uppercase">Empresa</p>
                        <p className="text-white font-bold text-sm leading-tight">Gestión de Proyectos</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                </div>
                {/* Photo + info */}
                <div className="px-5 pt-4 pb-5 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow flex items-center justify-center -mt-2">
                        <span className="text-2xl font-bold text-blue-700">{initials}</span>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-gray-900 text-base leading-tight">{employee.name}</p>
                        <p className="text-blue-600 text-sm font-medium mt-0.5">{employee.position}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{employee.department}</p>
                    </div>
                    {/* Divider */}
                    <div className="w-full border-t border-dashed border-gray-200" />
                    {/* Details */}
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
                    {/* Footer bar */}
                    <div className="w-full bg-blue-50 rounded-lg px-3 py-2 flex items-center justify-between mt-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider">Estado</span>
                            <span className={`text-xs font-semibold ${employee.status === 'activo' ? 'text-green-600' : 'text-red-500'}`}>
                                {employee.status === 'activo' ? '● Activo' : '● Inactivo'}
                            </span>
                        </div>
                        {/* Barcode-ish decoration */}
                        <div className="flex gap-px">
                            {Array.from({ length: 18 }).map((_, i) => (
                                <div key={i} className={`w-px bg-blue-300 opacity-70`} style={{ height: i % 3 === 0 ? 18 : 12 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── New Employee Form ─────────────────────────────────────────────────────────
const BLANK_FORM = {
    employeeNumber: '',
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    status: 'activo' as Employee['status'],
};

export function HumanCapitalPage() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState('');
    const [isNewEmpOpen, setIsNewEmpOpen] = useState(false);
    const [badgeEmployee, setBadgeEmployee] = useState<Employee | null>(null);
    const [form, setForm] = useState(BLANK_FORM);

    // Overtime state
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
    const [overtimeInputs, setOvertimeInputs] = useState<Record<string, Record<string, string>>>({});

    const load = () => setEmployees(getEmployees());
    useEffect(() => { load(); }, []);

    const weekEnd = getWeekEnd(currentWeekStart);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const prevWeek = () => setCurrentWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    const nextWeek = () => setCurrentWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    const thisWeek = () => setCurrentWeekStart(getWeekStart(new Date()));

    const getOvertimeForWeek = (employee: Employee) =>
        employee.overtimeRecords.find(
            r => r.weekStart.getTime() === currentWeekStart.getTime()
        );

    const handleOvertimeChange = (empId: string, dayIdx: string, val: string) => {
        setOvertimeInputs(prev => ({
            ...prev,
            [empId]: { ...prev[empId], [dayIdx]: val },
        }));
    };

    const totalInputHours = (empId: string) =>
        Object.values(overtimeInputs[empId] ?? {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);

    const handleSaveOvertime = (employee: Employee) => {
        const hours = totalInputHours(employee.id);
        if (hours === 0) { toast.error('Ingresa al menos una hora'); return; }
        addOvertimeRecord(employee.id, {
            weekStart: currentWeekStart,
            weekEnd,
            hours,
        });
        setOvertimeInputs(prev => ({ ...prev, [employee.id]: {} }));
        load();
        toast.success(`Horas extra guardadas para ${employee.name}`);
    };

    const handleCreateEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.employeeNumber || !form.name) { toast.error('Número y nombre son requeridos'); return; }
        addEmployee({ ...form, startDate: new Date() });
        setIsNewEmpOpen(false);
        setForm(BLANK_FORM);
        load();
        toast.success('Empleado registrado');
    };

    const handleDeleteEmployee = (emp: Employee) => {
        if (!confirm(`¿Eliminar a ${emp.name}?`)) return;
        deleteEmployee(emp.id);
        load();
        toast.success('Empleado eliminado');
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeNumber.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = employees.filter(e => e.status === 'activo').length;
    const certExpiring = employees.flatMap(e => e.certifications).filter(c => c.status === 'por vencer').length;
    const certExpired = employees.flatMap(e => e.certifications).filter(c => c.status === 'vencido').length;
    const totalOTThisWeek = employees.reduce((s, e) => s + (getOvertimeForWeek(e)?.hours ?? 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold">Capital Humano</h2>
                    <p className="text-gray-500 mt-1">Gestión de empleados, horas extra y certificaciones</p>
                </div>
                <Dialog open={isNewEmpOpen} onOpenChange={setIsNewEmpOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" />Nuevo Empleado</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Registrar Empleado</DialogTitle>
                            <DialogDescription>Completa los datos del nuevo colaborador</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateEmployee} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Número de empleado</Label>
                                    <Input placeholder="EMP-006" value={form.employeeNumber} onChange={e => setForm({ ...form, employeeNumber: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Estado</Label>
                                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Employee['status'] })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activo">Activo</SelectItem>
                                            <SelectItem value="inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Nombre completo</Label>
                                <Input placeholder="Juan Pérez" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Puesto</Label>
                                    <Input placeholder="Ingeniero Civil" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Departamento</Label>
                                    <Input placeholder="Construcción" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Correo electrónico</Label>
                                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Teléfono</Label>
                                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <Label>Dirección</Label>
                                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Contacto de emergencia</Label>
                                    <Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Tel. emergencia</Label>
                                    <Input value={form.emergencyPhone} onChange={e => setForm({ ...form, emergencyPhone: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <Button type="button" variant="outline" onClick={() => setIsNewEmpOpen(false)}>Cancelar</Button>
                                <Button type="submit">Registrar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPI row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empleados activos</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{activeCount}</div>
                        <p className="text-xs text-gray-500 mt-1">de {employees.length} registrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">HE esta semana</CardTitle>
                        <Timer className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{totalOTThisWeek}</div>
                        <p className="text-xs text-gray-500 mt-1">horas extra totales</p>
                    </CardContent>
                </Card>
                <Card className={certExpiring > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certs. por vencer</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${certExpiring > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-semibold ${certExpiring > 0 ? 'text-yellow-700' : ''}`}>{certExpiring}</div>
                        <p className="text-xs text-gray-500 mt-1">requieren renovación pronto</p>
                    </CardContent>
                </Card>
                <Card className={certExpired > 0 ? 'border-red-200 bg-red-50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certs. vencidas</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${certExpired > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-semibold ${certExpired > 0 ? 'text-red-600' : ''}`}>{certExpired}</div>
                        <p className="text-xs text-gray-500 mt-1">certificados vencidos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="employees">
                <TabsList>
                    <TabsTrigger value="employees"><Users className="w-4 h-4 mr-2" />Empleados</TabsTrigger>
                    <TabsTrigger value="overtime"><Clock className="w-4 h-4 mr-2" />Horas Extra</TabsTrigger>
                </TabsList>

                {/* ── Employees tab ─────────────────────────────────────── */}
                <TabsContent value="employees" className="space-y-4 mt-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            className="pl-9"
                            placeholder="Buscar por nombre, puesto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        {filtered.length === 0 && (
                            <Card><CardContent className="flex flex-col items-center py-12 text-gray-400"><Users className="w-10 h-10 mb-2" /><p>Sin resultados</p></CardContent></Card>
                        )}
                        {filtered.map(emp => {
                            const initials = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            const expiredCerts = emp.certifications.filter(c => c.status === 'vencido').length;
                            const expiringCerts = emp.certifications.filter(c => c.status === 'por vencer').length;
                            const weekOT = getOvertimeForWeek(emp);
                            return (
                                <Card key={emp.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <button
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                                                onClick={() => navigate(`/human-capital/${emp.id}`)}
                                                title="Ver perfil"
                                            >
                                                <span className="text-blue-700 font-bold text-sm">{initials}</span>
                                            </button>

                                            {/* Main info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                                                        onClick={() => navigate(`/human-capital/${emp.id}`)}
                                                    >
                                                        {emp.name}
                                                    </button>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emp.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {emp.status}
                                                    </span>
                                                    {expiredCerts > 0 && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                            {expiredCerts} cert. vencida{expiredCerts > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                    {expiringCerts > 0 && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                                            {expiringCerts} por vencer
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-0.5">{emp.position} · {emp.department}</p>
                                                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</span>
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>
                                                    {weekOT && (
                                                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                            <Clock className="w-3 h-3" />{weekOT.hours}h HE esta semana
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="sm" title="Gafete" onClick={() => setBadgeEmployee(emp)}>
                                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Ver perfil" onClick={() => navigate(`/human-capital/${emp.id}`)}>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Eliminar" onClick={() => handleDeleteEmployee(emp)}
                                                    className="hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* ── Overtime tab ───────────────────────────────────────── */}
                <TabsContent value="overtime" className="space-y-4 mt-4">
                    {/* Week navigator */}
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={prevWeek}>‹ Semana anterior</Button>
                        <div className="text-sm font-medium px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                            {formatDate(currentWeekStart)} — {formatDate(weekEnd)}
                            <span className="text-blue-400 ml-2 text-xs">(Vie → Jue)</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={nextWeek}>Semana siguiente ›</Button>
                        <Button variant="ghost" size="sm" onClick={thisWeek} className="text-blue-600">Hoy</Button>
                    </div>

                    {/* Overtime table */}
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-48">Empleado</th>
                                        {weekDates.map((d, i) => (
                                            <th key={i} className="text-center px-2 py-3 font-medium text-gray-600 min-w-[72px]">
                                                <div>{WEEK_DAYS[i]}</div>
                                                <div className="text-xs text-gray-400 font-normal">{formatDate(d)}</div>
                                            </th>
                                        ))}
                                        <th className="text-center px-3 py-3 font-medium text-gray-600">Total HE</th>
                                        <th className="px-3 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.filter(e => e.status === 'activo').map(emp => {
                                        const existing = getOvertimeForWeek(emp);
                                        const pendingTotal = totalInputHours(emp.id);
                                        const hasInput = pendingTotal > 0;
                                        return (
                                            <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <button
                                                        className="font-medium text-gray-800 hover:text-blue-600 transition-colors text-left"
                                                        onClick={() => navigate(`/human-capital/${emp.id}`)}
                                                    >
                                                        {emp.name}
                                                    </button>
                                                    <p className="text-xs text-gray-400">{emp.position}</p>
                                                </td>
                                                {weekDates.map((_, i) => (
                                                    <td key={i} className="px-2 py-3 text-center">
                                                        {existing ? (
                                                            <span className="text-gray-400 text-xs">—</span>
                                                        ) : (
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="24"
                                                                step="0.5"
                                                                placeholder="0"
                                                                className="w-16 text-center text-sm px-1"
                                                                value={overtimeInputs[emp.id]?.[String(i)] ?? ''}
                                                                onChange={e => handleOvertimeChange(emp.id, String(i), e.target.value)}
                                                            />
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-3 text-center">
                                                    {existing ? (
                                                        <span className="font-semibold text-orange-600">{existing.hours}h</span>
                                                    ) : (
                                                        <span className={`font-semibold ${hasInput ? 'text-blue-600' : 'text-gray-300'}`}>
                                                            {hasInput ? `${pendingTotal}h` : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {existing ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />Guardado
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!hasInput}
                                                            onClick={() => handleSaveOvertime(emp)}
                                                            className={hasInput ? 'border-blue-300 text-blue-600 hover:bg-blue-50' : ''}
                                                        >
                                                            Guardar
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Badge Dialog */}
            <Dialog open={!!badgeEmployee} onOpenChange={v => !v && setBadgeEmployee(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Gafete de Empleado</DialogTitle>
                        <DialogDescription>Vista previa del gafete de identificación</DialogDescription>
                    </DialogHeader>
                    {badgeEmployee && <EmployeeBadge employee={badgeEmployee} />}
                    <div className="flex justify-center mt-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <CreditCard className="w-4 h-4 mr-2" />Imprimir gafete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

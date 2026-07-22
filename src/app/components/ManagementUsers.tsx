import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { getUsers, changePermiso } from '../lib/storage';
import { Employee, Profile } from '../lib/types';
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
//import logo from '../img/SIR-PROJECTS2.png';

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

function safeString(value: unknown) {
    return String(value ?? '');
}



// ─── New Employee Form ─────────────────────────────────────────────────────────

export function ManagementUsers() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true)


    // Overtime state
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

    const load = async () => {

        try {
            const users = await getUsers();
            console.log(users)
            setProfile(users);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        load();
    }, []);


    const weekEnd = getWeekEnd(currentWeekStart);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const prevWeek = () => setCurrentWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    const nextWeek = () => setCurrentWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    const thisWeek = () => setCurrentWeekStart(getWeekStart(new Date()));

    const filteredProfile = profile.filter(e => {
        const query = safeString(search).toLowerCase();
        return (
            safeString(e.nombre).toLowerCase().includes(query) ||
            safeString(e.permiso).toLowerCase().includes(query) ||
            safeString(e.correo).toLowerCase().includes(query)
        )
    })

    const handleEditUser = async (profile: any) => {
        console.log(profile)
        const nombre: string = profile.nombre;
        const correo: string = profile.correo;


        console.log(nombre, correo)
    }
    const handleChangePermission = async (iduser: number, permiso: number) => {
        const message = await changePermiso(iduser, permiso);
        load();
        toast.success(message.message);
    }
    const changeActive = async (id: number, value: number) => {
        console.log(id, value);
    }
    return (
        <div className="space-y-6">

            {/* Tabs */}
            <Tabs defaultValue="employees">
                {/*<TabsList>
                    <TabsTrigger value="employees"><Users className="w-4 h-4 mr-2" />Empleados</TabsTrigger>
                    <TabsTrigger value="overtime"><Clock className="w-4 h-4 mr-2" />Horas Extra</TabsTrigger>
                </TabsList>*/}

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
                        {filteredProfile.length === 0 && (
                            <Card><CardContent className="flex flex-col items-center py-12 text-gray-400"><Users className="w-10 h-10 mb-2" /><p>Sin resultados</p></CardContent></Card>
                        )}
                        {filteredProfile.map((prof) => {
                            const initials = safeString(prof.nombre)
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                                <Card key={prof.id}>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-12 gap-4 items-center">

                                            {/* Avatar */}
                                            <div className="col-span-1 flex justify-center">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="font-bold text-blue-700">
                                                        {initials}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Nombre */}
                                            <div className="col-span-3">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={prof.nombre}
                                                    readOnly
                                                />
                                            </div>

                                            {/* Correo */}
                                            <div className="col-span-3">
                                                <Label>Correo</Label>
                                                <Input
                                                    value={prof.correo}
                                                    readOnly
                                                />
                                            </div>

                                            {/* Permiso */}
                                            <div className="col-span-2">
                                                <Label>Permiso</Label>
                                                <select
                                                    className="w-full border rounded-md p-2"
                                                    value={String(prof.permiso)}
                                                    onChange={(e) =>
                                                        handleChangePermission(
                                                            prof.id,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                >
                                                    <option value="1">Administrador</option>
                                                    <option value="2">Usuario</option>
                                                    <option value="3">Supervisor</option>
                                                </select>
                                            </div>
                                            {/* Estado */}
                                            <div className="col-span-2">
                                                <Label>Estado</Label>

                                                <input
                                                    type="checkbox"
                                                    checked={prof.activo === 1}
                                                    onChange={(e) => changeActive(prof.id, e.target.checked ? 1 : 0)}
                                                />

                                                <span className="ml-2">
                                                    {prof.activo === 1 ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>

                                            {/* Botón editar */}
                                            <div className="col-span-1 flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditUser(prof)}
                                                >
                                                    <Edit2 className="w-4 h-4 mr-1" />
                                                    Editar
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
                                    {/*filteredProfile.map((prof) => (
                                        <tr key={prof.id} className="border-b">
                                            <td>{prof.id}</td>
                                            <td>{prof.nombre}</td>
                                            <td>{prof.correo}</td>
                                            <td>
                                                {prof.permiso === 1
                                                    ? 'Administrador'
                                                    : prof.permiso === 2
                                                        ? 'Supervisor'
                                                        : 'Usuario'}
                                            </td>
                                            <td>{prof.activo}</td>
                                            
                                        </tr>
                                    ))*/}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getUsers, changePermiso, activeUser } from '../lib/storage';
import { Profile } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent } from './ui/tabs';
import {
    Users, Search, Edit2,
} from 'lucide-react';
import { toast } from 'sonner';
//import logo from '../img/SIR-PROJECTS2.png';

function safeString(value: unknown) {
    return String(value ?? '');
}



// ─── New Employee Form ─────────────────────────────────────────────────────────

export function ManagementUsers() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile[]>([]);
    const [search, setSearch] = useState('');
    const [ProfileForm, setProfileForm] = useState<Partial<Profile>>({});
    const [loading, setLoading] = useState(true)

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

    const filteredProfile = profile.filter(e => {
        const query = safeString(search).toLowerCase();
        return (
            safeString(e.nombre).toLowerCase().includes(query) ||
            safeString(e.permiso).toLowerCase().includes(query) ||
            safeString(e.correo).toLowerCase().includes(query)
        )
    })

    const handleChangePermission = async (iduser: number, permiso: number) => {
        const message = await changePermiso(iduser, permiso);
        load();
        toast.success(message.message);
    }
    const changeActive = async (id: number, value: number) => {
        const response = await activeUser(id, value);
        load()
        toast.success(response.message);
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
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                            {/* Avatar */}
                                            <div className="col-span-1 md:col-span-1 flex justify-center">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="font-bold text-blue-700">
                                                        {initials}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Nombre */}
                                            <div className="col-span-1 md:col-span-3">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={prof.nombre ?? ""}
                                                    readOnly
                                                />

                                            </div>

                                            {/* Correo */}
                                            <div className="col-span-1 md:col-span-3">

                                                <Label>Correo</Label>
                                                <Input
                                                    value={prof.correo ?? ""}
                                                    readOnly
                                                />
                                            </div>

                                            {/* Permiso */}
                                            <div className="col-span-1 md:col-span-3">
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
                                            <div className="col-span-1 md:col-span-2">
                                                <Label>Estado</Label>

                                                <input
                                                    type="checkbox"
                                                    checked={prof.activo === 1}
                                                    onChange={(e) => changeActive(prof.id, e.target.checked ? 1 : 0)}
                                                />

                                                <span className={`ml-3 ${prof.activo === 1 ? "bg-green-200" : "bg-red-200"}`}>
                                                    {prof.activo === 1 ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

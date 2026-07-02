import { useState, useMemo, useRef, useCallback } from 'react';
import { getProjects } from '../lib/storage';
import { getCurrentUser } from '../lib/auth';
import { Project, Task } from '../lib/types';
import {
  getEvidence,
  addEvidence,
  deleteEvidence,
  isImage,
  formatFileSize,
  MAX_FILE_SIZE,
  EvidenceItem,
} from '../lib/evidence';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  User,
  CalendarDays,
  X,
  Paperclip,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Colors indexed per project (pill style)
const PROJECT_COLORS = [
  { pill: 'bg-blue-100 text-blue-800 border border-blue-200', dot: 'bg-blue-500', header: 'bg-blue-500' },
  { pill: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500', header: 'bg-emerald-500' },
  { pill: 'bg-amber-100 text-amber-800 border border-amber-200', dot: 'bg-amber-500', header: 'bg-amber-500' },
  { pill: 'bg-purple-100 text-purple-800 border border-purple-200', dot: 'bg-purple-500', header: 'bg-purple-500' },
  { pill: 'bg-pink-100 text-pink-800 border border-pink-200', dot: 'bg-pink-500', header: 'bg-pink-500' },
  { pill: 'bg-teal-100 text-teal-800 border border-teal-200', dot: 'bg-teal-500', header: 'bg-teal-500' },
  { pill: 'bg-orange-100 text-orange-800 border border-orange-200', dot: 'bg-orange-500', header: 'bg-orange-500' },
  { pill: 'bg-red-100 text-red-800 border border-red-200', dot: 'bg-red-500', header: 'bg-red-500' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEntry {
  task: Task;
  project: Project;
  colorIdx: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Evidence Panel ───────────────────────────────────────────────────────────

interface EvidencePanelProps {
  task: Task;
  project: Project;
  colorIdx: number;
  onClose: () => void;
}

function EvidencePanel({ task, project, colorIdx, onClose }: EvidencePanelProps) {
  const user = getCurrentUser();
  const color = PROJECT_COLORS[colorIdx % PROJECT_COLORS.length];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(() => getEvidence(task.id));
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const reload = () => setEvidence(getEvidence(task.id));

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`"${file.name}" supera el límite de ${formatFileSize(MAX_FILE_SIZE)}`);
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        addEvidence(task.id, {
          name: file.name,
          type: file.type,
          dataUrl,
          size: file.size,
          uploadedBy: user?.nombre ?? 'Desconocido',
        });
        toast.success(`"${file.name}" subido correctamente`);
      }
      reload();
    } catch (err: any) {
      toast.error(err.message ?? 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  }, [task.id, user]);

  const handleDelete = (id: string) => {
    deleteEvidence(task.id, id);
    reload();
    toast.success('Evidencia eliminada');
  };

  const images = evidence.filter(e => isImage(e.type));
  const docs = evidence.filter(e => !isImage(e.type));

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
      {/* Coloured header */}
      <div className={`${color.header} px-6 py-4 flex items-start justify-between`}>
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{project.name}</p>
          <DialogTitle className="text-white mt-1">{task.title}</DialogTitle>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors mt-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-5">
          {/* Task meta */}
          <DialogDescription asChild>
            <div className="space-y-3">
              <p className="text-gray-700">{task.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={task.completed ? 'default' : 'secondary'} className="gap-1">
                  {task.completed
                    ? <><CheckCircle2 className="w-3 h-3" /> Completada</>
                    : <><Clock className="w-3 h-3" /> Pendiente</>}
                </Badge>
                <Badge variant="outline" className="gap-1 font-normal">
                  {task.quantity} {task.unit}
                </Badge>
                {task.assignedTo && (
                  <Badge variant="outline" className="gap-1 font-normal">
                    <User className="w-3 h-3" /> {task.assignedTo}
                  </Badge>
                )}
                {task.dueDate && (
                  <Badge variant="outline" className="gap-1 font-normal">
                    <CalendarDays className="w-3 h-3" />
                    {task.dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </Badge>
                )}
              </div>
            </div>
          </DialogDescription>

          <Separator />

          {/* Upload area */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Evidencias adjuntas
              <span className="text-gray-400 font-normal text-sm">({evidence.length} archivo{evidence.length !== 1 ? 's' : ''})</span>
            </h3>

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                {uploading ? 'Subiendo...' : 'Arrastra archivos aquí o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Imágenes, PDF, Word, Excel · Máx. {formatFileSize(MAX_FILE_SIZE)} por archivo
              </p>
            </div>

            {/* LocalStorage warning */}
            <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Los archivos se guardan en el navegador. Evita subir archivos muy grandes.</span>
            </div>
          </div>

          {/* Image gallery */}
          {images.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fotos e imágenes</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((item) => (
                  <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border">
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                      <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-xs truncate">{item.name}</p>
                        <p className="text-white/70 text-xs">{formatFileSize(item.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Full-size view */}
                    <a
                      href={item.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document list */}
          {docs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentos</h4>
              <div className="space-y-2">
                {docs.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString('es-ES')} · {item.uploadedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={item.dataUrl}
                        download={item.name}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Descargar"
                      >
                        <Upload className="w-3.5 h-3.5 text-gray-500 rotate-180" />
                      </a>
                      <button
                        onClick={() => handleDelete(item.id)}
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

          {evidence.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              Aún no hay evidencias adjuntas
            </div>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

// ─── Calendar Page ────────────────────────────────────────────────────────────

export function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  const projects = useMemo(() => getProjects(), []);

  // Map projectId -> color index (stable across renders)
  const projectColorMap = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p, i) => map.set(p.id, i));
    return map;
  }, [projects]);

  // Build day -> entries map for the current view month
  const tasksByDay = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const map: Record<number, CalendarEntry[]> = {};

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        if (!task.dueDate) return;
        const d = task.dueDate;
        if (d.getFullYear() !== year || d.getMonth() !== month) return;
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          task,
          project,
          colorIdx: projectColorMap.get(project.id) ?? 0,
        });
      });
    });
    return map;
  }, [projects, viewDate, projectColorMap]);

  // Calendar grid math (Monday-first)
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const firstDayOffset = (rawFirstDay + 6) % 7; // Mon=0 … Sun=6
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const selectedEntries = selectedDay !== null ? (tasksByDay[selectedDay] ?? []) : [];

  // Legend: projects that have tasks this month
  const activeProjectsThisMonth = useMemo(() => {
    const ids = new Set(Object.values(tasksByDay).flat().map(e => e.project.id));
    return projects.filter(p => ids.has(p.id));
  }, [tasksByDay, projects]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-semibold">Calendario de Actividades</h2>
        <p className="text-gray-500 mt-1">Visualiza y gestiona las tareas por fecha. Haz clic en una actividad para adjuntar evidencias.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Calendar card ── */}
        <Card className="flex-1 min-w-0">
          {/* Month navigation */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-xl font-semibold min-w-[180px] text-center">
                  {MONTHS_ES[month]} {year}
                </h3>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToday}>Hoy</Button>
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_ES.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
              {Array.from({ length: totalCells }).map((_, idx) => {
                const dayNum = idx - firstDayOffset + 1;
                const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                const isSelected = isValid && dayNum === selectedDay;
                const dayEntries = isValid ? (tasksByDay[dayNum] ?? []) : [];
                const visible = dayEntries.slice(0, 3);
                const overflow = dayEntries.length - visible.length;

                return (
                  <div
                    key={idx}
                    onClick={() => isValid && setSelectedDay(dayNum)}
                    className={`
                      bg-white min-h-[90px] p-1.5 flex flex-col transition-colors
                      ${isValid ? 'cursor-pointer hover:bg-blue-50' : 'bg-gray-50 opacity-40'}
                      ${isSelected ? 'ring-2 ring-inset ring-blue-500' : ''}
                    `}
                  >
                    {isValid && (
                      <>
                        {/* Day number */}
                        <div className={`
                          self-start w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                          ${isToday(dayNum)
                            ? 'bg-blue-600 text-white'
                            : isSelected
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700'}
                        `}>
                          {dayNum}
                        </div>

                        {/* Task pills */}
                        <div className="flex flex-col gap-0.5 flex-1">
                          {visible.map((entry) => {
                            const c = PROJECT_COLORS[entry.colorIdx % PROJECT_COLORS.length];
                            return (
                              <button
                                key={entry.task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEntry(entry);
                                }}
                                className={`
                                  w-full text-left px-1.5 py-0.5 rounded text-[10px] leading-tight
                                  truncate font-medium transition-opacity hover:opacity-80
                                  ${c.pill}
                                  ${entry.task.completed ? 'line-through opacity-60' : ''}
                                `}
                                title={`${entry.project.name}: ${entry.task.title}`}
                              >
                                {entry.task.title}
                              </button>
                            );
                          })}
                          {overflow > 0 && (
                            <span className="text-[10px] text-gray-400 pl-1">+{overflow} más</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {activeProjectsThisMonth.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 px-1">
                {activeProjectsThisMonth.map((p) => {
                  const idx = projectColorMap.get(p.id) ?? 0;
                  const c = PROJECT_COLORS[idx % PROJECT_COLORS.length];
                  return (
                    <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                      {p.name}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Side panel: selected day ── */}
        <div className="xl:w-80 flex-shrink-0">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedDay
                  ? `${selectedDay} de ${MONTHS_ES[month]}`
                  : 'Selecciona un día'}
              </CardTitle>
              {selectedDay && isToday(selectedDay) && (
                <span className="text-xs text-blue-600 font-medium">Hoy</span>
              )}
            </CardHeader>
            <CardContent>
              {selectedDay === null ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Haz clic en un día del calendario para ver sus actividades
                </p>
              ) : selectedEntries.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sin actividades programadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEntries.map((entry) => {
                    const c = PROJECT_COLORS[entry.colorIdx % PROJECT_COLORS.length];
                    const evidenceCount = getEvidence(entry.task.id).length;
                    return (
                      <button
                        key={entry.task.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="w-full text-left p-3 rounded-xl border hover:shadow-sm transition-shadow bg-white"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${c.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${entry.task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {entry.task.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{entry.project.name}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] h-4 px-1.5 ${entry.task.completed ? 'bg-green-50 text-green-700' : ''}`}
                              >
                                {entry.task.completed ? '✓ Lista' : 'Pendiente'}
                              </Badge>
                              {evidenceCount > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-blue-500">
                                  <Paperclip className="w-2.5 h-2.5" />
                                  {evidenceCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evidence dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => { if (!open) setSelectedEntry(null); }}>
        {selectedEntry && (
          <EvidencePanel
            task={selectedEntry.task}
            project={selectedEntry.project}
            colorIdx={selectedEntry.colorIdx}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </Dialog>
    </div>
  );
}

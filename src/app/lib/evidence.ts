import { apiRequest } from "../apiClient";
import { fetchProjects } from "./storage";

export interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

const EVIDENCE_KEY = 'evidence';
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const loadAll = (): Record<string, EvidenceItem[]> => {
  const stored = localStorage.getItem(EVIDENCE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

const saveAll = (all: Record<string, EvidenceItem[]>) => {
  try {
    localStorage.setItem(EVIDENCE_KEY, JSON.stringify(all));
  } catch {
    // localStorage quota exceeded
    throw new Error('Almacenamiento lleno. Elimina algunos archivos antes de subir nuevos.');
  }
};

export const getEvidence = (taskId: string): EvidenceItem[] => {
  const all = loadAll();
  return (all[taskId] || []).map((e) => ({
    ...e,
    uploadedAt: new Date(e.uploadedAt),
  }));
};

export const addEvidence = (taskId: string, item: Omit<EvidenceItem, 'id' | 'uploadedAt'>): EvidenceItem => {
  const all = loadAll();
  const newItem: EvidenceItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uploadedAt: new Date(),
  };
  all[taskId] = [...(all[taskId] || []), newItem];
  console.log(all)
  saveAll(all);
  return newItem;
};

export const deleteEvidence = async (evidenceId: string) => {
  console.log("envio de datos al eliminar: ", {action: "deleteEvidence", evidenceId});
  await apiRequest("actionEvidences", {action: "DeleteEvidences", idTask : evidenceId}, "POST")
};

export const isImage = (type: string) =>
  type.startsWith('image/');

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

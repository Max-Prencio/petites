import type { RequestStatus } from '@/constants/requestStatus';
import type { Enums } from '@/types/database.types';

export type RequestActor = 'owner' | 'requester';

export interface RequestAction {
  status: RequestStatus;
  label: string;
  tone: 'primary' | 'secondary' | 'danger';
}

const ownerLabels: Partial<Record<RequestStatus, string>> = {
  in_review: 'Marcar en revisión',
  videocall_requested: 'Pedir videollamada',
  approved: 'Aprobar',
  preparing: 'Preparando salida',
  in_transit: 'Salió en camino',
  nearby: 'Está muy cerca',
  delivered: 'Confirmar entrega',
  rejected: 'No aprobar',
};

// Espejo de update_request_status() en SQL: solo decide qué botones mostrar.
// La validación real vive en la base de datos.
export function allowedTransitions(
  status: RequestStatus,
  actor: RequestActor,
  method: Enums<'delivery_method'>,
): RequestStatus[] {
  if (actor === 'requester') {
    return ['submitted', 'in_review', 'videocall_requested', 'approved', 'preparing'].includes(status)
      ? ['cancelled']
      : [];
  }
  switch (status) {
    case 'submitted':
      return ['in_review', 'videocall_requested', 'approved', 'rejected'];
    case 'in_review':
      return ['videocall_requested', 'approved', 'rejected'];
    case 'videocall_requested':
      return ['in_review', 'approved', 'rejected'];
    case 'approved':
      return ['preparing', 'rejected'];
    case 'preparing':
      return method === 'delivery' ? ['in_transit'] : ['delivered'];
    case 'in_transit':
      return ['nearby', 'delivered'];
    case 'nearby':
      return ['delivered'];
    default:
      return [];
  }
}

export function actionsFor(
  status: RequestStatus,
  actor: RequestActor,
  method: Enums<'delivery_method'>,
): RequestAction[] {
  return allowedTransitions(status, actor, method).map((next) => ({
    status: next,
    label: actor === 'requester' ? 'Cancelar solicitud' : (ownerLabels[next] ?? next),
    tone:
      next === 'rejected' || next === 'cancelled' ? 'danger' : next === 'approved' ? 'primary' : 'secondary',
  }));
}

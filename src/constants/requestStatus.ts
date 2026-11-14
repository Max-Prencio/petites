import type { Enums } from '@/types/database.types';

export type RequestStatus = Enums<'request_status'>;

interface StatusCopy {
  label: string;
  message: string;
}

// Avisos de seguimiento con el copy del manual de marca.
export const requestStatusCopy: Record<RequestStatus, StatusCopy> = {
  submitted: {
    label: 'Solicitud enviada',
    message: '¡Solicitud recibida! Estamos presentando tu hogar a su cuidador.',
  },
  in_review: {
    label: 'En revisión',
    message: 'Revisando detalles para asegurar que sean el match perfecto.',
  },
  videocall_requested: {
    label: 'Videollamada propuesta',
    message: 'Su cuidador quiere conocerte en una breve videollamada. Coordínenla por el chat.',
  },
  approved: {
    label: 'Aprobada',
    message: '¡Luz verde! Prepara su espacio, sus patitas ya tienen destino.',
  },
  preparing: {
    label: 'Preparando traslado',
    message: 'Preparando sus patitas y sus cosas para salir hacia ti.',
  },
  in_transit: {
    label: 'En camino',
    message: '¡En movimiento! Sus patitas van en camino hacia ti.',
  },
  nearby: {
    label: 'Muy cerca',
    message: '¡Asómate! Sus patitas están a pocos minutos de tu puerta.',
  },
  delivered: {
    label: 'Entregada',
    message: '¡Llegó a casa! Hoy comienza su nueva historia juntos.',
  },
  rejected: {
    label: 'No aprobada',
    message: 'Esta vez no fue posible. Hay más patitas esperando por ti.',
  },
  cancelled: {
    label: 'Cancelada',
    message: 'La solicitud fue cancelada.',
  },
};

// Recorrido feliz que se muestra en la línea de tiempo.
export const deliveryTrack: readonly RequestStatus[] = [
  'submitted',
  'in_review',
  'approved',
  'preparing',
  'in_transit',
  'nearby',
  'delivered',
];
export const pickupTrack: readonly RequestStatus[] = [
  'submitted',
  'in_review',
  'approved',
  'preparing',
  'delivered',
];

export const terminalStatuses: readonly RequestStatus[] = ['delivered', 'rejected', 'cancelled'];

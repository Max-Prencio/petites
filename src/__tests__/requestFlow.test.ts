import { actionsFor, allowedTransitions } from '@/utils/requestFlow';

describe('allowedTransitions', () => {
  it('el solicitante solo puede cancelar antes del traslado', () => {
    expect(allowedTransitions('submitted', 'requester', 'delivery')).toEqual(['cancelled']);
    expect(allowedTransitions('in_transit', 'requester', 'delivery')).toEqual([]);
  });

  it('el traslado a domicilio pasa por "en camino"', () => {
    expect(allowedTransitions('preparing', 'owner', 'delivery')).toEqual(['in_transit']);
  });

  it('la recogida con cita va directo a entregado', () => {
    expect(allowedTransitions('preparing', 'owner', 'pickup')).toEqual(['delivered']);
  });

  it('los estados finales no tienen acciones', () => {
    for (const status of ['delivered', 'rejected', 'cancelled'] as const) {
      expect(allowedTransitions(status, 'owner', 'delivery')).toEqual([]);
    }
  });

  it('etiqueta las acciones con el tono correcto', () => {
    const actions = actionsFor('submitted', 'owner', 'delivery');
    expect(actions.find((a) => a.status === 'approved')?.tone).toBe('primary');
    expect(actions.find((a) => a.status === 'rejected')?.tone).toBe('danger');
  });
});

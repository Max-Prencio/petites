import { registerSchema } from '@/schemas/auth';
import { requestSchema, type RequestInput } from '@/schemas/request';

const base: RequestInput = {
  housingType: 'apartment',
  hasYard: false,
  experience: 'Crecí con perros toda mi vida.',
  commitment: 'Quiero darle un hogar tranquilo.',
  deliveryMethod: 'pickup',
  preferredDate: '',
  contractAccepted: true,
};

describe('requestSchema', () => {
  it('acepta una solicitud con recogida', () => {
    expect(requestSchema.safeParse(base).success).toBe(true);
  });

  it('exige dirección cuando es traslado a domicilio', () => {
    const r = requestSchema.safeParse({ ...base, deliveryMethod: 'delivery', deliveryAddress: '' });
    expect(r.success).toBe(false);
  });

  it('exige aceptar el acuerdo de tenencia responsable', () => {
    const r = requestSchema.safeParse({ ...base, contractAccepted: false });
    expect(r.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ANA@Correo.com ',
    phone: '+1 809 555 0000',
    password: 'Petites123',
    confirmPassword: 'Petites123',
  };

  it('normaliza el correo', () => {
    const r = registerSchema.safeParse(valid);
    expect(r.success && r.data.email).toBe('ana@correo.com');
  });

  it('exige contraseñas iguales con letras y números', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'otra123' }).success).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, password: 'solotexto', confirmPassword: 'solotexto' }).success,
    ).toBe(false);
  });
});

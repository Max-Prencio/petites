import { emptyListingForm, listingSchema, type ListingInput } from '@/schemas/listing';

const base: ListingInput = {
  ...emptyListingForm,
  categoryId: 1,
  ageValue: 3,
  description: 'Una perrita muy cariñosa que ama jugar con niños.',
  provinceId: 1,
  city: 'Piantini',
  conditions: 'Mayor de edad y visita previa.',
  images: [{ uri: 'file:///foto.jpg', mimeType: 'image/jpeg' }],
};

const issuesFor = (input: ListingInput) => {
  const result = listingSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('listingSchema', () => {
  it('acepta una adopción válida sin precio', () => {
    expect(issuesFor(base)).toEqual([]);
  });

  it('rechaza una adopción con precio', () => {
    expect(issuesFor({ ...base, price: 1000, currency: 'DOP' })).toContain('price');
  });

  it('exige requisitos en adopción', () => {
    expect(issuesFor({ ...base, conditions: '' })).toContain('conditions');
  });

  it('exige precio y moneda en venta', () => {
    const issues = issuesFor({ ...base, listingType: 'sale', price: null, currency: null });
    expect(issues).toEqual(expect.arrayContaining(['price', 'currency']));
  });

  it('rechaza precio cero o negativo en venta', () => {
    expect(issuesFor({ ...base, listingType: 'sale', price: 0, currency: 'DOP' })).toContain('price');
  });

  it('acepta una venta con precio positivo', () => {
    expect(issuesFor({ ...base, listingType: 'sale', price: 15000, currency: 'DOP' })).toEqual([]);
  });

  it('exige al menos una foto y una forma de entrega', () => {
    const issues = issuesFor({ ...base, images: [], allowsDelivery: false, allowsPickup: false });
    expect(issues).toEqual(expect.arrayContaining(['images', 'allowsPickup']));
  });

  it('rechaza formatos de imagen no permitidos', () => {
    const bad = { ...base, images: [{ uri: 'x', mimeType: 'image/gif' }] } as unknown as ListingInput;
    expect(issuesFor(bad).some((p) => p.startsWith('images'))).toBe(true);
  });
});

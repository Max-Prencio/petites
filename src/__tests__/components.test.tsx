import { fireEvent, render, screen } from '@testing-library/react-native';

import { AnimalCard } from '@/components/AnimalCard';
import { Button } from '@/components/ui/Button';
import type { ListingCard } from '@/types/models';

const card: ListingCard = {
  id: 'l1',
  owner_id: 'u1',
  animal_id: 'a1',
  listing_type: 'adoption',
  price: null,
  currency: null,
  status: 'available',
  moderation_status: 'visible',
  province_id: 1,
  province_name: 'Santiago',
  city: 'Santiago de los Caballeros',
  transfer_fee: null,
  published_at: '2026-11-14T00:00:00Z',
  created_at: '2026-11-14T00:00:00Z',
  animal_name: 'Canela',
  category_id: 1,
  category_name: 'Perros',
  category_slug: 'perros',
  breed_id: null,
  breed_name: 'Mestizo',
  age_value: 8,
  age_unit: 'months',
  age_months: 8,
  sex: 'female',
  size: 'medium',
  vaccinated: 'yes',
  dewormed: 'yes',
  good_for_apartment: true,
  personality_tags: [],
  description: 'Dulce',
  owner_name: 'Refugio Huellitas RD',
  owner_partner_type: 'shelter',
  cover_path: null,
};

describe('Button', () => {
  it('llama onPress y respeta disabled', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(<Button title="Pedir adopción" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Pedir adopción' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    await rerender(<Button title="Pedir adopción" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Pedir adopción' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('AnimalCard', () => {
  it('muestra la etiqueta de adopción, edad y ubicación', async () => {
    await render(<AnimalCard card={card} imageUrl={null} onPress={jest.fn()} />);
    expect(screen.getByText('En adopción')).toBeTruthy();
    expect(screen.getByText('Mestizo · 8 meses')).toBeTruthy();
    expect(screen.getByText('Adopción responsable')).toBeTruthy();
    expect(screen.getByText(/Santiago de los Caballeros/)).toBeTruthy();
  });

  it('muestra el precio en venta y permite marcar favorito', async () => {
    const onToggle = jest.fn();
    await render(
      <AnimalCard
        card={{ ...card, listing_type: 'sale', price: 18000, currency: 'DOP' }}
        imageUrl={null}
        onPress={jest.fn()}
        onToggleFavorite={onToggle}
      />,
    );
    expect(screen.getByText('En venta')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Guardar en mi lista'));
    expect(onToggle).toHaveBeenCalled();
  });
});

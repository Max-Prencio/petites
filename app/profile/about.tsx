import { HeartHandshake, ShieldAlert, Stethoscope, Truck } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, Header, Screen, Text } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors } from '@/constants/theme';

const sections = [
  {
    icon: HeartHandshake,
    title: 'Adopción responsable',
    body: 'Cada solicitud incluye una ficha de hogar y un acuerdo de tenencia responsable. El cuidador siempre tiene la decisión final y puede pedir una videollamada antes de aprobar.',
  },
  {
    icon: Truck,
    title: 'Protocolo de traslado pet-friendly',
    body: 'Las mascotas nunca viajan en mochilas térmicas, motos sin acondicionar ni paquetería común. El traslado lo hace personal de confianza o transporte acondicionado, o se coordina una recogida con cita, dentro de franjas horarias que permiten preparar al animal con calma.',
  },
  {
    icon: Stethoscope,
    title: 'Salud declarada',
    body: 'Los datos de vacunación y salud los declara quien publica. No equivalen a una certificación veterinaria salvo que se aporte documentación. Los documentos veterinarios son privados por defecto.',
  },
  {
    icon: ShieldAlert,
    title: 'Lo que no está permitido',
    body: 'Especies protegidas, comercio ilegal, maltrato o explotación animal, fraude y acoso. Reporta cualquier publicación, usuario o conversación sospechosa: nuestro equipo la revisará.',
  },
];

export default function AboutScreen() {
  return (
    <Screen scroll>
      <Header title="Bienestar animal y normas" />
      <View className="gap-1">
        <Text variant="display">{brand.name}</Text>
        <Text className="text-secondary-muted">{brand.slogan}</Text>
      </View>
      {sections.map(({ icon: Icon, title, body }) => (
        <Card key={title}>
          <View className="flex-row items-center gap-2">
            <Icon size={20} color={colors.primary} />
            <Text variant="subtitle">{title}</Text>
          </View>
          <Text className="text-ink-muted">{body}</Text>
        </Card>
      ))}
      <Text variant="caption" className="text-center">
        Las categorías y especies habilitadas se revisan según la normativa aplicable en República Dominicana.
      </Text>
    </Screen>
  );
}

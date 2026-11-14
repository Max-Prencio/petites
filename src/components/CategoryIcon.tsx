import {
  Bird,
  Cat,
  Dog,
  Fish,
  PawPrint,
  Rabbit,
  Squirrel,
  Turtle,
  type LucideIcon,
} from 'lucide-react-native';

const map: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  squirrel: Squirrel,
  turtle: Turtle,
  'paw-print': PawPrint,
};

// Las categorías vienen del backend; el ícono es un nombre opcional con respaldo genérico.
export function CategoryIcon({
  name,
  size = 22,
  color,
}: {
  name: string | null;
  size?: number;
  color: string;
}) {
  const Icon = (name && map[name]) || PawPrint;
  return <Icon size={size} color={color} />;
}

import {
  Watch, Smartphone, Ear, House, Laptop, Tablet, Plane,
  Cpu, type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Watch,
  Smartphone,
  Ear,
  House,
  Laptop,
  Tablet,
  Plane,
  Cpu,
};

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = iconMap[name] ?? Cpu;
  return <Icon {...props} />;
}

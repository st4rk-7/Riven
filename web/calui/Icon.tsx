// Stand-in for @calcom/ui Icon: same kebab-case names, rendered with lucide-react.
import { icons, type LucideProps } from "lucide-react";

export type IconName = string;

function toPascal(name: string) {
  return name.replace(/(^\w|-\w)/g, (m) => m.replace("-", "").toUpperCase());
}

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = icons[toPascal(name) as keyof typeof icons];
  return Cmp ? <Cmp strokeWidth={2} {...props} /> : null;
}

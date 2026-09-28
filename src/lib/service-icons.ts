import {
  BotIcon,
  CloudIcon,
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  PaletteIcon,
  RocketIcon,
  ServerIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";

/** Icons selectable for services in the dashboard. Keys are stored in Service.icon. */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  server: ServerIcon,
  "layout-dashboard": LayoutDashboardIcon,
  database: DatabaseIcon,
  smartphone: SmartphoneIcon,
  cloud: CloudIcon,
  code: CodeIcon,
  "shield-check": ShieldCheckIcon,
  gauge: GaugeIcon,
  workflow: WorkflowIcon,
  cpu: CpuIcon,
  bot: BotIcon,
  palette: PaletteIcon,
  rocket: RocketIcon,
  sparkles: SparklesIcon,
};

export function serviceIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? SparklesIcon;
}

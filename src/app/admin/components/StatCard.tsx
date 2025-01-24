import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  Icon: IconType | LucideIcon;
}

export function StatCard({ title, value, subtext, Icon }: Readonly<StatCardProps>) {
  return (
    <Card className="bg-white shadow-none transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="text-primary-500 size-6" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-500">{subtext}</p>
      </CardContent>
    </Card>
  );
}

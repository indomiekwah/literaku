import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="hover-card-effect border-transparent shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-bold">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={trendUp ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
              {trend}
            </span>
            <span className="text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

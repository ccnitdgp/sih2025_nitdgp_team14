import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stats } from "@/lib/data";

export function StatsSection() {
  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.id} className="text-center transition-transform hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-col items-center gap-4">
                <stat.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-4xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stat.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

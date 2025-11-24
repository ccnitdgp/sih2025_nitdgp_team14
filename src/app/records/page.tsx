import { healthRecords } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Share2 } from "lucide-react";

export default function RecordsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>My Health Records</CardTitle>
          <CardDescription>
            Access and manage your medical history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.recordType}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.details}</TableCell>
                    <TableCell>{record.issuer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" aria-label="Download">
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Share">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

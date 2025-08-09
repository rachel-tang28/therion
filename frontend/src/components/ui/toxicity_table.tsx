import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

interface ScreeningEntry {
  sequence: string;
  score: number;
  toxin: boolean;
}

export default function ToxicityTable({ data }: { data: ScreeningEntry[] }) {
  return (
    <div className="w-full max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Prediction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.sequence}</TableCell>
              <TableCell className="flex items-center flex-row gap-[8px]">
                <h3>{(item.score)}</h3>
              </TableCell>
              <TableCell>
                    <Badge className={item.toxin ? "text-red-500" : "text-green-600"} variant={"outline"}>
                      {item.toxin ? "Toxin" : "Non-Toxin"}
                    </Badge>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
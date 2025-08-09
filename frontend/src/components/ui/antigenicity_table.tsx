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
  antigen: boolean;
}

export default function ScreeningTable({ data }: { data: ScreeningEntry[] }) {
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
                    <Badge className={item.antigen ? "text-green-600" : "text-red-500"} variant={"outline"}>
                      {item.antigen ? "Antigen" : "Non-Antigen"}
                    </Badge>  
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
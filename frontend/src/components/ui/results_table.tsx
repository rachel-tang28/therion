import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

interface ResultEntry {
  sequence: string;
  binding_score: number;
  allele: string;
  rank: number;
}

export default function ResultsTable({ data }: { data: ResultEntry[] }) {
  return (
    <div className="w-full max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>HLA Allele</TableHead>
            <TableHead>Binding Score</TableHead>
            <TableHead>Rank</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.sequence}</TableCell>
              <TableCell>{item.allele}</TableCell>
              <TableCell className="flex items-center flex-row gap-[8px]">
                <h3>{item.binding_score}</h3>
                <Progress value={item.binding_score} />
              </TableCell>
              <TableCell>
                    <Badge variant="step_badge">{item.rank}</Badge>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
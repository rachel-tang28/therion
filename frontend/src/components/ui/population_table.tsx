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

interface PopulationResult {
  population: string
  coverage: number
  average_hit: number
  pc90: number
}

export default function PopulationTable({ data }: { data: PopulationResult[] }) {
  return (
    <div className="w-full max-w-5xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Population</TableHead> {/* narrower column */}
            <TableHead>Coverage (%)</TableHead>
            <TableHead>Average Hit</TableHead>
            <TableHead>PC90</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            // Determine progress bar color
            let colorClass = "bg-red-500"
            if (item.coverage > 66) colorClass = "bg-green-500"
            else if (item.coverage > 33) colorClass = "bg-yellow-400"

            return (
              <TableRow key={index}>
                {/* 🌍 Population Name */}
                <TableCell className="font-medium truncate max-w-[140px]">
                  {item.population}
                </TableCell>

                {/* 📊 Coverage Progress Bar */}
                <TableCell className="flex items-center gap-2">
                  <span className="min-w-[50px] text-sm">
                    {item.coverage.toFixed(2)}%
                  </span>
                  <div className="relative w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`absolute h-2 rounded ${colorClass}`}
                      style={{ width: `${item.coverage}%` }}
                    ></div>
                  </div>
                </TableCell>

                {/* 📈 Average Hit */}
                <TableCell>
                  <Badge variant="secondary">{item.average_hit.toFixed(2)}</Badge>
                </TableCell>

                {/* 🧮 PC90 */}
                <TableCell>
                  <Badge variant="outline">{item.pc90.toFixed(2)}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

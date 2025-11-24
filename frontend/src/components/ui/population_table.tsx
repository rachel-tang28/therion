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

const dummyData: PopulationResult[] = [
  { population: "Central Africa", coverage: 86.04, average_hit: 10.49, pc90: 5.01 },
  { population: "Central America", coverage: 7.76, average_hit: 0.56, pc90: 0.76 },
  { population: "East Africa", coverage: 90.78, average_hit: 11.73, pc90: 7.16 },
  { population: "East Asia", coverage: 98.18, average_hit: 15.6, pc90: 10.05 },
  { population: "Europe", coverage: 99.68, average_hit: 18.78, pc90: 14.4 },
  { population: "North Africa", coverage: 96.03, average_hit: 13.95, pc90: 8.67 },
  { population: "North America", coverage: 99.06, average_hit: 17.13, pc90: 11.89 },
  { population: "Northeast Asia", coverage: 94.7, average_hit: 12.72, pc90: 8.04 },
  { population: "Oceania", coverage: 94.71, average_hit: 11.64, pc90: 7.86 },
  { population: "South Africa", coverage: 93.03, average_hit: 12.49, pc90: 7.68 },
  { population: "South America", coverage: 88.3, average_hit: 10.22, pc90: 5.98 },
  { population: "South Asia", coverage: 94.73, average_hit: 12.73, pc90: 8.08 },
  { population: "Southeast Asia", coverage: 94.56, average_hit: 12.61, pc90: 8.0 },
  { population: "Southwest Asia", coverage: 92.5, average_hit: 12.08, pc90: 7.52 },
  { population: "West Africa", coverage: 95.49, average_hit: 14.06, pc90: 8.55 },
  { population: "West Indies", coverage: 98.98, average_hit: 17.5, pc90: 12.25 },
  { population: "World", coverage: 98.55, average_hit: 16.09, pc90: 10.6 }
]


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
          {dummyData.map((item, index) => {
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

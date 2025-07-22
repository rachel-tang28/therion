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

interface ResultCompleteEntry {
  sequence: string;
  binding_score: number;
  allele: string;
  antigen: boolean;
  allergen: boolean;
  toxin: boolean;
  rank: number;
}

// Only map 10 results to the table
// This is to ensure that the table does not overflow
export default function ResultsCompleteTable({ data }: { data: ResultCompleteEntry[] }) {
  return (
    <div className="w-full max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>Binding Score</TableHead>
            <TableHead>HLA Alleles</TableHead>
            <TableHead>Antigenicity</TableHead>
            <TableHead>Allergencity</TableHead>
            <TableHead>Toxicity</TableHead>
            <TableHead>Rank</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 10).map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.sequence}</TableCell>
              <TableCell className="flex items-center flex-row gap-[8px]">
                <h3>{item.binding_score}</h3>
                <Progress value={item.binding_score} />
              </TableCell>
              <TableCell>
                {item.allele}
              </TableCell>
              <TableCell>
                <Badge className={item.antigen ? "text-red-500" : "text-black"} variant={"outline"}>
                  {item.antigen ? "Non-Antigen" : "Antigen"}
                </Badge>  
              </TableCell>
              <TableCell>
                <Badge className={item.allergen ? "text-red-500" : "text-black"} variant={"outline"}>
                  {item.allergen ? "Allergen" : "Non-Allergen"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={item.toxin ? "text-red-500" : "text-black"} variant={"outline"}>
                  {item.toxin ? "Toxin" : "Non-Toxin"}
                </Badge>
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
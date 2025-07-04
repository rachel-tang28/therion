"use client";
import React, { PureComponent } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Sector, Cell } from 'recharts';

const data_pie = [
  { name: 'Antigen', value: 90 },
  { name: 'Non-Antigen', value: 10 },
];

const COLORS = ['#0088FE', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const data = [
  {
    "name": "AAACDEFGH",
    "Conservation (%)": 96,
  },
  {
    "name": "BCDEFGHIJ",
    "Conservation (%)": 87,
  },
  {
    "name": "CDEFGHIJK",
    "Conservation (%)": 43,
  }
]

export default function ResultsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Results</h1>
        <p className="mb-8">This is the results page where you can view the analysis results.</p>
        <div className="w-full max-w-4xl">
            <BarChart width={730} height={250} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Conservation (%)" fill="#8b5cf6" />
            </BarChart>
        </div>
        </div>
        <div>
            <PieChart width={400} height={400}>
            <Pie
                data={data_pie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            </PieChart>
        </div>
    </div>
  );
                            
}
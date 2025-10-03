import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Card, CardContent, Typography, Box } from '@mui/material'

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B'] // Protein, Carbs, Fat

export default function MacroDonut({ protein = 0, carbs = 0, fat = 0, title = 'Macro Breakdown' }) {
  const data = [
    { name: 'Protein', value: Math.max(0, protein) },
    { name: 'Carbs', value: Math.max(0, carbs) },
    { name: 'Fat', value: Math.max(0, fat) }
  ]
  return (
    <Card sx={{ p: 1.5, height: '100%' }}>
      <CardContent sx={{ height: 320 }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={24} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

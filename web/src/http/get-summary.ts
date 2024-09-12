type SummaryResponse = {
  completed: number
  total: number
  goals_per_day: Record<
    string,
    {
      id: string
      title: string
      completed_at: string
    }[]
  >
}

export async function getSummary(): Promise<SummaryResponse> {
  const response = await fetch('http://localhost:3333/summary')
  const data = await response.json()
  return data.summary
}

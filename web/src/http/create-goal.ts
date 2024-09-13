interface CreateGoalRequest {
  title: string
  desired_weekly_frequency: number
}

export async function createGoal({ title, desired_weekly_frequency }: CreateGoalRequest) {
  await fetch('http://localhost:3333/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, desired_weekly_frequency }),
  })
}

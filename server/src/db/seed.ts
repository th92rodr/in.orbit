import dayjs from 'dayjs'
import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db.insert(goals).values([
    { title: 'Wake up early', desiredWeeklyFrequency: 5 },
    { title: 'Exercise', desiredWeeklyFrequency: 3 },
    { title: 'Meditate', desiredWeeklyFrequency: 1 },
  ]).returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, createdAt: startOfWeek.add(12, 'hour').toDate() },
    { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').add(10, 'hour').toDate() },
  ])
}

seed().finally(() => {
  client.end()
})

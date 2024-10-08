import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { ClientError } from '../errors/client-error'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({ goalId }: CreateGoalCompletionRequest) {
  const firstDayOfCurrentWeek = dayjs().startOf('week').toDate()
  const lastDayOfCurrentWeek = dayjs().endOf('week').toDate()

  const goal = await db
    .select({})
    .from(goals)
    .where(
      eq(goals.id, goalId)
    )

  if (!goal[0]) {
    throw new ClientError('Goal not found.')
  }

  const goalCompletionCount = db.$with('goal_completion_count').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completion_count'),
      })
      .from(goalCompletions)
      .where(and(
        gte(goalCompletions.createdAt, firstDayOfCurrentWeek),
        lte(goalCompletions.createdAt, lastDayOfCurrentWeek),
        eq(goalCompletions.goalId, goalId)
      ))
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`COALESCE(${goalCompletionCount.completionCount}, 0)`
        .mapWith(Number),
    })
    .from(goals)
    .leftJoin(
      goalCompletionCount,
      eq(goalCompletionCount.goalId, goals.id)
    )
    .where(
      eq(goals.id, goalId)
    )
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new ClientError('Goal already completed this week.')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()

  const goalCompletion = insertResult[0]

  return { goalCompletion }
}

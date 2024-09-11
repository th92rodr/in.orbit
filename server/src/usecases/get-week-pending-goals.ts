import dayjs from 'dayjs';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { goalCompletions, goals } from '../db/schema';

export async function getWeekPendingGoals() {
  const firstDayOfCurrentWeek = dayjs().startOf('week').toDate()
  const lastDayOfCurrentWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToCurrentWeek = db.$with('goals_created_up_to_current_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfCurrentWeek))
  )

  const goalCompletionCount = db.$with('goal_completion_count').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completion_count'),
      })
      .from(goalCompletions)
      .where(and(
        gte(goalCompletions.createdAt, firstDayOfCurrentWeek),
        lte(goalCompletions.createdAt, lastDayOfCurrentWeek)
      ))
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToCurrentWeek, goalCompletionCount)
    .select({
      id: goalsCreatedUpToCurrentWeek.id,
      title: goalsCreatedUpToCurrentWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency,
      completionCount: sql`
        COALESCE(${goalCompletionCount.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToCurrentWeek)
    .leftJoin(
      goalCompletionCount,
      eq(goalCompletionCount.goalId, goalsCreatedUpToCurrentWeek.id)
    )

  return { pendingGoals }
}

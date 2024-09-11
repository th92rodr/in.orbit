import dayjs from 'dayjs';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { goalCompletions, goals } from '../db/schema';

export async function getWeekSummary() {
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

  const goalsCompletedInCurrentWeek = db.$with('goals_completed_in_current_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`DATE(${goalCompletions.createdAt})`.as('completed_at_date'),
      })
      .from(goalCompletions)
      .innerJoin(
        goals,
        eq(goals.id, goalCompletions.goalId)
      )
      .where(and(
        gte(goalCompletions.createdAt, firstDayOfCurrentWeek),
        lte(goalCompletions.createdAt, lastDayOfCurrentWeek)
      ))
  )

  const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInCurrentWeek.completedAtDate,
        completions: sql`JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${goalsCompletedInCurrentWeek.id},
            'title', ${goalsCompletedInCurrentWeek.title},
            'completedAt', ${goalsCompletedInCurrentWeek.completedAt},
          )
        )`.as('completions'),
      })
      .from(goalsCompletedInCurrentWeek)
      .groupBy(goalsCompletedInCurrentWeek.completedAtDate)
  )

  const result = await db
    .with(goalsCreatedUpToCurrentWeek, goalsCompletedInCurrentWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInCurrentWeek})`
        .mapWith(Number),
      total: sql`(SELECT SUM(${goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToCurrentWeek})`
        .mapWith(Number),
      goalsPerDay: sql`JSON_OBJECT_AGG(
        ${goalsCompletedByWeekDay.completedAtDate}, ${goalsCompletedByWeekDay.completions}
      )`,
    })
    .from(goalsCompletedByWeekDay)

  return { summary: result }
}

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createGoal } from '../../usecases/create-goals'

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/goals',
    {
      schema: {
        body: z.object({
          title: z.string(),
          desired_weekly_frequency: z.number().int().min(1).max(7),
        }),
      },
    },
    async request => {
      const { title, desired_weekly_frequency: desiredWeeklyFrequency } = request.body
      const { goal } = await createGoal({ title, desiredWeeklyFrequency })
      return {
        id: goal.id,
        title: goal.title,
        desired_weekly_frequency: goal.desiredWeeklyFrequency,
      }
    }
  )
}

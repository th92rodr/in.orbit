import z from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoal } from '../../usecases/create-goals'

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
  app.post('/goals', {
    schema: {
      body: z.object({
        title: z.string(),
        desired_weekly_frequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { title, desired_weekly_frequency: desiredWeeklyFrequency } = request.body
    await createGoal({ title, desiredWeeklyFrequency })
  })
}

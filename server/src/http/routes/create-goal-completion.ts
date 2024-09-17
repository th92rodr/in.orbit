import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createGoalCompletion } from '../../usecases/create-goal-completion'

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/completions',
    {
      schema: {
        body: z.object({
          goal_id: z.string(),
        }),
      },
    },
    async request => {
      const { goal_id: goalId } = request.body
      const { goalCompletion } = await createGoalCompletion({ goalId })
      return {
        id: goalCompletion.id,
        goal_id: goalCompletion.goalId,
      }
    }
  )
}

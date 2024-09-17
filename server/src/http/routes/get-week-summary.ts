import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { getWeekSummary } from '../../usecases/get-week-summary'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
  app.get('/summary', async () => {
    return await getWeekSummary()
  })
}

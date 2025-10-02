import cors from '@fastify/cors'
import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { env } from '@/env'
import { errorHandler } from '@/error-handler'
import { createGoalCompletionRoute } from '@/http/routes/create-goal-completion'
import { createGoalRoute } from '@/http/routes/create-goals'
import { getPendingGoalsRoute } from '@/http/routes/get-pending-goals'
import { getWeekSummaryRoute } from '@/http/routes/get-week-summary'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(createGoalRoute)
app.register(createGoalCompletionRoute)
app.register(getPendingGoalsRoute)
app.register(getWeekSummaryRoute)

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server running')
})

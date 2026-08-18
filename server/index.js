import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TERMS_TOOL = {
  name: 'return_terms',
  description: 'Return the generated list of candidate concept terms.',
  input_schema: {
    type: 'object',
    properties: {
      terms: {
        type: 'array',
        items: { type: 'string' },
        description: 'Flat, unordered list of 12-20 candidate concept terms.',
      },
    },
    required: ['terms'],
  },
}

app.post('/api/generate-terms', async (req, res) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : ''
  if (!query) {
    res.status(400).json({ error: 'query is required' })
    return
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:
        'You seed a concept-mapping tool. Given a subject, produce a flat, unordered pile of candidate concept terms for that subject — short noun phrases, 1-4 words each. Do NOT organize them into tiers, categories, or any hierarchy, and do NOT include the subject itself as a term. Return 12-20 terms. Ordering the concepts is the user\'s job, not yours, so return them in no particular order.',
      messages: [{ role: 'user', content: `Subject: ${query}` }],
      tools: [TERMS_TOOL],
      tool_choice: { type: 'tool', name: 'return_terms' },
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    const terms = Array.isArray(toolUse?.input?.terms) ? toolUse.input.terms : []

    res.json({ terms: terms.filter((t) => typeof t === 'string' && t.trim()).slice(0, 20) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'term generation failed' })
  }
})

// Named distinctly from PORT: some hosting/dev environments inject a PORT
// env var meant for the main dev server, which would otherwise collide with
// this API process when both are launched by the same `npm run dev`.
const PORT = process.env.API_PORT || 8787
app.listen(PORT, () => {
  console.log(`mycelium server listening on :${PORT}`)
})

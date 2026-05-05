interface OpenAIResponseChoice {
  message?: {
    role: string
    content?: string
    function_call?: {
      name: string
      arguments?: string
    }
  }
}

export interface PlayerAdvicePayload {
  accountId: string
  playerName: string
  win: number
  lose: number
  rankTier?: number
  mmrEstimate?: number
  topHeroes: string
  heroSummary: string
}

export interface PlayerAdviceResult {
  text: string
  provider: string
  request: unknown
  response: unknown
}

function getOpenAiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY as string | undefined
}

function getOpenAiBaseUrl() {
  return (import.meta.env.VITE_OPENAI_API_BASE_URL as string) || 'https://api.openai.com/v1'
}

function getGeminiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY as string | undefined
}

function getGeminiModel() {
  return (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-1.5-mini'
}

function getGeminiBaseUrl() {
  return (import.meta.env.VITE_GEMINI_API_BASE_URL as string) || 'https://generativelanguage.googleapis.com/v1beta2'
}

function getFreeLlmKey() {
  return import.meta.env.VITE_FREE_LLM_API_KEY as string | undefined
}

function getFreeLlmUrl() {
  if (import.meta.env.VITE_FREE_LLM_API_URL) {
    return import.meta.env.VITE_FREE_LLM_API_URL as string
  }
  return import.meta.env.DEV ? '/api/free-llm' : 'https://apifreellm.com/api/v1/chat'
}

function getFreeLlmModel() {
  return (import.meta.env.VITE_FREE_LLM_MODEL as string) || 'apifreellm'
}

function getNvidiaKey() {
  return import.meta.env.VITE_NVIDIA_API_KEY as string | undefined
}

function getNvidiaBaseUrl() {
  if (import.meta.env.VITE_NVIDIA_BASE_URL) {
    return import.meta.env.VITE_NVIDIA_BASE_URL as string
  }
  return import.meta.env.DEV ? '/api/nvidia' : 'https://integrate.api.nvidia.com'
}

function getNvidiaModel() {
  return (import.meta.env.VITE_NVIDIA_MODEL as string) || 'deepseek-ai/deepseek-v4-pro'
}

function getAnthropicKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
}

function getAnthropicModel() {
  return (import.meta.env.VITE_ANTHROPIC_MODEL as string) || 'claude-3.5-mini'
}

function getAnthropicBaseUrl() {
  return (import.meta.env.VITE_ANTHROPIC_API_BASE_URL as string) || 'https://api.anthropic.com'
}

function parseFunctionResponse(text: string) {
  try {
    const json = JSON.parse(text)
    if (typeof json === 'object' && json !== null) {
      const advice = String(json.advice || json.text || '')
      const highlights = String(json.highlights || '')
      const tips = Array.isArray(json.tips) ? json.tips.filter(Boolean).map(String) : []
      const extra = json.extra ? String(json.extra) : ''
      return { advice, highlights, tips, extra }
    }
  } catch {
    // ignore parse errors
  }
  return { advice: text, highlights: '', tips: [], extra: '' }
}

async function fetchOpenAiAdvice(payload: PlayerAdvicePayload): Promise<PlayerAdviceResult> {
  const apiKey = getOpenAiKey()
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in .env.')
  }

  const systemPrompt = `You are a Dota 2 coach assistant inside a gamer analytics dashboard. Analyze the provided player profile data and match statistics to give detailed, constructive improvement advice. Focus on the player's current performance, strengths, weaknesses, hero preferences, win/loss patterns, and provide specific actionable tips for improvement. Make the response comprehensive but readable.`

  const userPrompt = `Player: ${payload.playerName} (account ${payload.accountId})\nWin/Loss: ${payload.win}/${payload.lose} (${payload.win + payload.lose ? ((payload.win / Math.max(1, payload.win + payload.lose)) * 100).toFixed(1) : '0.0'}% winrate)\nRank tier: ${payload.rankTier ?? 'unknown'}\nMMR estimate: ${payload.mmrEstimate ?? 'unknown'}\nTop heroes: ${payload.topHeroes}\nHero summary:\n${payload.heroSummary}`

  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  }

  const url = `${getOpenAiBaseUrl()}/chat/completions`
  console.debug('OpenAI request', { provider: 'OpenAI', url, body })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status} ${JSON.stringify(json)}`)
  }

  const message = json.choices?.[0]?.message
  if (!message) {
    throw new Error('OpenAI response contains no message.')
  }

  const text = (message.content || '').trim()
  console.debug('OpenAI response', { provider: 'OpenAI', status: res.status, json })

  return { text, provider: 'OpenAI', request: body, response: json }
}

async function fetchFreeLlmAdvice(payload: PlayerAdvicePayload): Promise<PlayerAdviceResult> {
  const apiKey = getFreeLlmKey()
  if (!apiKey) {
    throw new Error('Free LLM API key is not configured. Set VITE_FREE_LLM_API_KEY in .env.')
  }

  const systemPrompt = `You are a Dota 2 coach assistant inside a gamer analytics dashboard. Analyze the provided player profile data and match statistics to give detailed, constructive improvement advice. Focus on the player's current performance, strengths, weaknesses, hero preferences, win/loss patterns, and provide specific actionable tips for improvement. Make the response comprehensive but readable.`

  const userPrompt = `Player: ${payload.playerName} (account ${payload.accountId})\nWin/Loss: ${payload.win}/${payload.lose} (${payload.win + payload.lose ? ((payload.win / Math.max(1, payload.win + payload.lose)) * 100).toFixed(1) : '0.0'}% winrate)\nRank tier: ${payload.rankTier ?? 'unknown'}\nMMR estimate: ${payload.mmrEstimate ?? 'unknown'}\nTop heroes: ${payload.topHeroes}\nHero summary:\n${payload.heroSummary}`

  const body = {
    message: `${systemPrompt}\n\n${userPrompt}`,
    model: getFreeLlmModel(),
  }

  const url = getFreeLlmUrl()
  console.debug('Free LLM request', { provider: 'FreeLLM', url, body })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Free LLM request failed: ${res.status} ${JSON.stringify(json)}. Check VITE_FREE_LLM_API_KEY and VITE_FREE_LLM_MODEL.`)
  }

  const content = (json.output || json.text || json.message || '') as string
  const text = content.trim()
  console.debug('Free LLM response', { provider: 'FreeLLM', status: res.status, json })

  return { text, provider: 'FreeLLM', request: body, response: json }
}

async function fetchNvidiaAdvice(payload: PlayerAdvicePayload): Promise<PlayerAdviceResult> {
  const apiKey = getNvidiaKey()
  if (!apiKey) {
    throw new Error('NVIDIA API key is not configured. Set VITE_NVIDIA_API_KEY in .env.')
  }

  const systemPrompt = `You are a Dota 2 coach assistant inside a gamer analytics dashboard. Analyze the provided player profile data and match statistics to give detailed, constructive improvement advice. Focus on the player's current performance, strengths, weaknesses, hero preferences, win/loss patterns, and provide specific actionable tips for improvement. Make the response comprehensive but readable.`

  const userPrompt = `Player: ${payload.playerName} (account ${payload.accountId})\nWin/Loss: ${payload.win}/${payload.lose} (${payload.win + payload.lose ? ((payload.win / Math.max(1, payload.win + payload.lose)) * 100).toFixed(1) : '0.0'}% winrate)\nRank tier: ${payload.rankTier ?? 'unknown'}\nMMR estimate: ${payload.mmrEstimate ?? 'unknown'}\nTop heroes: ${payload.topHeroes}\nHero summary:\n${payload.heroSummary}`

  const body = {
    model: getNvidiaModel(),
    messages: [
      { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` },
    ],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    extra_body: { chat_template_kwargs: { thinking: false } },
    stream: false,
  }

  const url = `${getNvidiaBaseUrl()}/chat/completions`
  console.debug('NVIDIA request', { provider: 'NVIDIA', url, body })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(`NVIDIA request failed: ${res.status} ${JSON.stringify(json)}. Check VITE_NVIDIA_API_KEY and VITE_NVIDIA_MODEL.`)
  }

  const content = (json.choices?.[0]?.message?.content as string) || (json.choices?.[0]?.delta?.content as string) || ''
  const text = content.trim()
  console.debug('NVIDIA response', { provider: 'NVIDIA', status: res.status, json })

  return { text, provider: 'NVIDIA', request: body, response: json }
}

async function fetchGeminiAdvice(payload: PlayerAdvicePayload): Promise<PlayerAdviceResult> {
  const apiKey = getGeminiKey()
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY in .env.')
  }

  const systemPrompt = `You are a Dota 2 coach assistant inside a gamer analytics dashboard. Analyze the provided player profile data and match statistics to give detailed, constructive improvement advice. Focus on the player's current performance, strengths, weaknesses, hero preferences, win/loss patterns, and provide specific actionable tips for improvement. Make the response comprehensive but readable.`

  const userPrompt = `Player: ${payload.playerName} (account ${payload.accountId})\nWin/Loss: ${payload.win}/${payload.lose} (${payload.win + payload.lose ? ((payload.win / Math.max(1, payload.win + payload.lose)) * 100).toFixed(1) : '0.0'}% winrate)\nRank tier: ${payload.rankTier ?? 'unknown'}\nMMR estimate: ${payload.mmrEstimate ?? 'unknown'}\nTop heroes: ${payload.topHeroes}\nHero summary:\n${payload.heroSummary}`

  const body = {
    model: getGeminiModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.35,
    max_tokens_to_sample: 500,
  }

  const res = await fetch(`${getAnthropicBaseUrl()}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Anthropic request failed: ${res.status} ${JSON.stringify(json)}`)
  }

  const content = (json.choices?.[0]?.message?.content as string) || (json.completion as string) || ''
  const text = content.trim()
  console.debug('Anthropic response', { provider: 'Anthropic', status: res.status, json })

  return { text, provider: 'Anthropic', request: body, response: json }
}

export async function fetchPlayerAdvice(payload: PlayerAdvicePayload): Promise<PlayerAdviceResult> {
  if (getFreeLlmKey()) {
    return fetchFreeLlmAdvice(payload)
  }
  if (getNvidiaKey()) {
    return fetchNvidiaAdvice(payload)
  }
  if (getGeminiKey()) {
    return fetchGeminiAdvice(payload)
  }
  if (getAnthropicKey()) {
    return fetchAnthropicAdvice(payload)
  }
  return fetchOpenAiAdvice(payload)
}

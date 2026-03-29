import type { IncomingMessage, ServerResponse } from 'http'
import type { Plugin, ViteDevServer } from 'vite'

interface AgentEnv {
	OPENAI_API_KEY: string
	ANTHROPIC_API_KEY: string
	GOOGLE_API_KEY: string
}

interface AgentBackendStatus {
	ready: boolean
	message: string
}

interface AgentRuntimeErrorData {
	code: string
	message: string
	retryable: boolean
}

interface AgentStreamHandlerDeps {
	env: AgentEnv
	getModelName: (prompt: unknown) => string
	getBackendStatusForModel: (model: string | undefined, env: AgentEnv) => AgentBackendStatus
	AgentRuntimeError: new (error: AgentRuntimeErrorData) => Error
	createAgentService: (env: AgentEnv) => {
		stream: (
			prompt: unknown,
			opts?: {
				abortSignal?: AbortSignal
			}
		) => AsyncIterable<unknown>
	}
	toAgentRuntimeErrorData: (error: unknown) => AgentRuntimeErrorData
	logger?: Pick<Console, 'error'>
	readBody?: (req: IncomingMessage) => Promise<string>
}

export function apiPlugin(): Plugin {
	return {
		name: 'api-stream',
		configureServer(server: ViteDevServer) {
			server.middlewares.use('/api/status', async (req: IncomingMessage, res: ServerResponse) => {
				if (req.method === 'OPTIONS') {
					res.writeHead(204, {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type',
					})
					res.end()
					return
				}

				if (req.method !== 'GET') {
					res.writeHead(405, { 'Content-Type': 'text/plain' })
					res.end('Method not allowed')
					return
				}

				try {
					const { getBackendStatusForModel } = await server.ssrLoadModule('/shared/agent-runtime-status')
					const url = new URL(req.url ?? '/api/status', 'http://localhost')
					const model = url.searchParams.get('model') ?? undefined
					const status = getBackendStatusForModel(model, {
						ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
						OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
						GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
					})

					res.writeHead(200, {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache',
						'Access-Control-Allow-Origin': '*',
					})
					res.end(JSON.stringify(status))
				} catch (error: any) {
					res.writeHead(500, {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache',
						'Access-Control-Allow-Origin': '*',
					})
					res.end(
						JSON.stringify({
							ready: false,
							reasonCode: 'provider_not_configured',
							message: error?.message || 'Unable to determine AI backend status.',
						})
					)
				}
			})

			server.middlewares.use('/api/stream', async (req: IncomingMessage, res: ServerResponse) => {
				try {
					const [
						{ AgentService },
						{ getModelName },
						{ getBackendStatusForModel },
						{ AgentRuntimeError, toAgentRuntimeErrorData },
					] = await Promise.all([
						server.ssrLoadModule('/worker/do/AgentService'),
						server.ssrLoadModule('/worker/prompt/getModelName'),
						server.ssrLoadModule('/shared/agent-runtime-status'),
						server.ssrLoadModule('/shared/types/AgentRuntimeError'),
					])

					await handleAgentStreamRequest(req, res, {
						env: {
							ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
							OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
							GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
						},
						getModelName,
						getBackendStatusForModel,
						AgentRuntimeError,
						createAgentService: (env) => new AgentService(env),
						toAgentRuntimeErrorData,
					})
				} catch (error: any) {
					console.error('Stream error:', error)

					if (!res.headersSent) {
						res.writeHead(200, {
							'Content-Type': 'text/event-stream',
							'Cache-Control': 'no-cache',
							'Access-Control-Allow-Origin': '*',
						})
					}

					if (!res.writableEnded && !res.destroyed) {
						const message =
							error instanceof Error ? error.message : 'Unable to load the AI stream handler.'
						res.write(
							`data: ${JSON.stringify({
								error: {
									code: 'provider_request_failed',
									message,
									retryable: true,
								},
							})}\n\n`
						)
						res.end()
					}
				}
			})
		},
	}
}

export async function handleAgentStreamRequest(
	req: IncomingMessage,
	res: ServerResponse,
	{
		env,
		getModelName,
		getBackendStatusForModel,
		AgentRuntimeError,
		createAgentService,
		toAgentRuntimeErrorData,
		logger = console,
		readBody: readBodyImpl = readBody,
	}: AgentStreamHandlerDeps
) {
	if (req.method === 'OPTIONS') {
		res.writeHead(204, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		})
		res.end()
		return
	}

	if (req.method !== 'POST') {
		res.writeHead(405, { 'Content-Type': 'text/plain' })
		res.end('Method not allowed')
		return
	}

	const abortController = new AbortController()
	let clientClosed = false
	const handleClientClosed = () => {
		if (clientClosed) return
		clientClosed = true
		abortController.abort()
	}

	req.on('aborted', handleClientClosed)
	res.on('close', handleClientClosed)

	try {
		const body = await readBodyImpl(req)
		const prompt = JSON.parse(body)

		const modelName = getModelName(prompt)
		const status = getBackendStatusForModel(modelName, env)

		if (!status.ready) {
			throw new AgentRuntimeError({
				code: 'provider_not_configured',
				message: status.message,
				retryable: false,
			})
		}

		const service = createAgentService(env)

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
			'Access-Control-Allow-Origin': '*',
		})
		res.flushHeaders?.()

		for await (const change of service.stream(prompt, { abortSignal: abortController.signal })) {
			if (clientClosed || res.writableEnded || res.destroyed) {
				break
			}

			res.write(`data: ${JSON.stringify(change)}\n\n`)
		}
	} catch (error: any) {
		logger.error('Stream error:', error)

		if (!res.headersSent) {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Access-Control-Allow-Origin': '*',
			})
			res.flushHeaders?.()
		}

		if (!res.writableEnded && !res.destroyed) {
			res.write(`data: ${JSON.stringify({ error: toAgentRuntimeErrorData(error) })}\n\n`)
		}
	} finally {
		req.off('aborted', handleClientClosed)
		res.off('close', handleClientClosed)

		if (!res.writableEnded && !res.destroyed) {
			res.end()
		}
	}
}

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = []
		req.on('data', (chunk: Buffer) => chunks.push(chunk))
		req.on('end', () => resolve(Buffer.concat(chunks).toString()))
		req.on('error', reject)
	})
}

import { createServer, request as httpRequest } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleAgentStreamRequest } from '../scripts/vite-api-plugin'

class FakeAgentRuntimeError extends Error {
	code: string
	retryable: boolean

	constructor({ code, message, retryable }: { code: string; message: string; retryable: boolean }) {
		super(message)
		this.name = 'AgentRuntimeError'
		this.code = code
		this.retryable = retryable
	}
}

const TEST_ENV = {
	ANTHROPIC_API_KEY: 'test-key',
	OPENAI_API_KEY: '',
	GOOGLE_API_KEY: '',
}

async function startServer(
	createAgentService: (typeof handleAgentStreamRequest extends (
		req: any,
		res: any,
		deps: infer T
	) => any
		? T
		: never)['createAgentService']
) {
	const server = createServer((req, res) =>
		void handleAgentStreamRequest(req, res, {
			env: TEST_ENV,
			getModelName: () => 'claude-sonnet-4-6',
			getBackendStatusForModel: () => ({ ready: true, message: 'ok' }),
			AgentRuntimeError: FakeAgentRuntimeError,
			createAgentService,
			toAgentRuntimeErrorData: (error) => {
				if (error instanceof FakeAgentRuntimeError) {
					return {
						code: error.code,
						message: error.message,
						retryable: error.retryable,
					}
				}

				if (error instanceof Error) {
					return {
						code: 'provider_request_failed',
						message: error.message,
						retryable: true,
					}
				}

				return {
					code: 'provider_request_failed',
					message: 'Unknown error',
					retryable: true,
				}
			},
			logger: {
				error: vi.fn(),
			},
		})
	)

	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
	const address = server.address() as AddressInfo
	return {
		server,
		url: `http://127.0.0.1:${address.port}/api/stream`,
	}
}

async function stopServer(server: ReturnType<typeof createServer>) {
	await new Promise<void>((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()))
	})
}

async function post(url: string, body = '{}') {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body,
	})

	return {
		status: response.status,
		headers: response.headers,
		text: await response.text(),
	}
}

describe('handleAgentStreamRequest', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('streams SSE events after the POST body has finished', async () => {
		const { server, url } = await startServer(() => ({
			stream: async function* () {
				await new Promise((resolve) => setTimeout(resolve, 10))
				yield { _type: 'think', text: 'Planning', complete: true, time: 1 }
				await new Promise((resolve) => setTimeout(resolve, 10))
				yield { _type: 'move', intent: 'Move a node', complete: true, time: 2 }
			},
		}))

		try {
			const response = await post(url)

			expect(response.status).toBe(200)
			expect(response.headers.get('content-type')).toContain('text/event-stream')
			expect(response.text).toContain('data: {"_type":"think","text":"Planning","complete":true,"time":1}')
			expect(response.text).toContain(
				'data: {"_type":"move","intent":"Move a node","complete":true,"time":2}'
			)
		} finally {
			await stopServer(server)
		}
	})

	it('aborts the backend stream when the client disconnects', async () => {
		let capturedAbortSignal: AbortSignal | undefined
		let abortNotified = false

		const { server, url } = await startServer(() => ({
			stream: async function* (
				_prompt,
				{ abortSignal }: { abortSignal?: AbortSignal } = {}
			): AsyncGenerator<unknown> {
				capturedAbortSignal = abortSignal
				abortSignal?.addEventListener(
					'abort',
					() => {
						abortNotified = true
					},
					{ once: true }
				)

				yield { _type: 'think', text: 'First chunk', complete: true, time: 1 }

				await new Promise<void>((resolve) => {
					abortSignal?.addEventListener('abort', () => resolve(), { once: true })
				})
			},
		}))

		try {
			await new Promise<void>((resolve, reject) => {
				const req = httpRequest(
					url,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': '2',
						},
					},
					(res) => {
						res.once('data', () => {
							res.destroy()
						})
						res.once('close', () => resolve())
						res.once('error', reject)
					}
				)

				req.once('error', reject)
				req.write('{}')
				req.end()
			})

			await vi.waitFor(() => {
				expect(abortNotified).toBe(true)
			})
			expect(capturedAbortSignal?.aborted).toBe(true)
		} finally {
			await stopServer(server)
		}
	})

	it('writes structured SSE errors when the stream throws', async () => {
		const { server, url } = await startServer(() => ({
			stream: async function* (): AsyncGenerator<unknown> {
				throw new Error('boom')
			},
		}))

		try {
			const response = await post(url)

			expect(response.status).toBe(200)
			expect(response.text).toContain(
				'data: {"error":{"code":"provider_request_failed","message":"boom","retryable":true}}'
			)
		} finally {
			await stopServer(server)
		}
	})
})

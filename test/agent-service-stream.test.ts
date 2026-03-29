import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
	streamText: vi.fn(),
}))

vi.mock('ai', async () => {
	const actual = await vi.importActual<typeof import('ai')>('ai')
	return {
		...actual,
		streamText: mocks.streamText,
	}
})

import { AgentService } from '../worker/do/AgentService'

const TEST_PROMPT = {
	mode: {
		type: 'mode',
		modeType: 'working',
		partTypes: ['mode', 'debug', 'modelName', 'messages'],
		actionTypes: ['think'],
	},
	debug: {
		type: 'debug',
		logSystemPrompt: false,
		logMessages: false,
	},
	modelName: {
		type: 'modelName',
		modelName: 'claude-sonnet-4-6',
	},
	messages: {
		type: 'messages',
		requestSource: 'user',
		agentMessages: ['Test prompt'],
	},
} as any

describe('AgentService stream aborts', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('forwards abortSignal to streamText and skips the zero-action warning on abort', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
		const abortController = new AbortController()

		mocks.streamText.mockImplementation(
			({ abortSignal }: { abortSignal?: AbortSignal } = {}) => ({
				textStream: (async function* () {
					yield '{"actions":[]}'

					if (!abortSignal?.aborted) {
						await new Promise<void>((resolve) => {
							abortSignal?.addEventListener('abort', () => resolve(), { once: true })
						})
					}
				})(),
			})
		)

		const service = new AgentService({
			ANTHROPIC_API_KEY: 'test-key',
			OPENAI_API_KEY: '',
			GOOGLE_API_KEY: '',
		})

		vi.spyOn(service, 'getModel').mockReturnValue({
			modelId: 'claude-sonnet-4-6',
			provider: 'anthropic.messages',
		} as any)

		const streamPromise = (async () => {
			for await (const _event of service.stream(TEST_PROMPT, {
				abortSignal: abortController.signal,
			})) {
			}
		})()

		await Promise.resolve()
		abortController.abort()
		await streamPromise

		expect(mocks.streamText).toHaveBeenCalledWith(
			expect.objectContaining({
				abortSignal: abortController.signal,
			})
		)
		expect(
			warnSpy.mock.calls.some(([message]) =>
				String(message).includes('Stream parsed but yielded 0 complete actions')
			)
		).toBe(false)

		warnSpy.mockRestore()
		errorSpy.mockRestore()
		logSpy.mockRestore()
	})
})

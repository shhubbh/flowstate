import { describe, expect, it } from 'vitest'
import { getBackendStatusForModel } from '../shared/agent-runtime-status'

describe('getBackendStatusForModel', () => {
	it('reports missing provider config for the default Claude model', () => {
		const status = getBackendStatusForModel('claude-sonnet-4-6', {
			ANTHROPIC_API_KEY: '',
			OPENAI_API_KEY: '',
			GOOGLE_API_KEY: '',
		})

		expect(status.ready).toBe(false)
		expect(status.reasonCode).toBe('provider_not_configured')
		expect(status.requiredEnvVar).toBe('ANTHROPIC_API_KEY')
		expect(status.message).toContain('ANTHROPIC_API_KEY')
	})

	it('reports ready when the required provider key exists', () => {
		const status = getBackendStatusForModel('claude-sonnet-4-6', {
			ANTHROPIC_API_KEY: 'sk-ant-test',
			OPENAI_API_KEY: '',
			GOOGLE_API_KEY: '',
		})

		expect(status.ready).toBe(true)
		expect(status.reasonCode).toBe('ok')
		expect(status.provider).toBe('anthropic')
	})
})

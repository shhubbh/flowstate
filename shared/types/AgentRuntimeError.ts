export type AgentRuntimeErrorCode =
	| 'provider_not_configured'
	| 'network_error'
	| 'provider_request_failed'
	| 'invalid_model_output'

export interface AgentRuntimeErrorData {
	code: AgentRuntimeErrorCode
	message: string
	retryable: boolean
}

export interface AgentRuntimeErrorPayload {
	error: AgentRuntimeErrorData | string
}

export class AgentRuntimeError extends Error implements AgentRuntimeErrorData {
	code: AgentRuntimeErrorCode
	retryable: boolean

	constructor({ code, message, retryable }: AgentRuntimeErrorData) {
		super(message)
		this.name = 'AgentRuntimeError'
		this.code = code
		this.retryable = retryable
	}
}

export function isAgentRuntimeErrorData(value: unknown): value is AgentRuntimeErrorData {
	if (!value || typeof value !== 'object') return false

	const candidate = value as Partial<AgentRuntimeErrorData>
	return (
		typeof candidate.code === 'string' &&
		typeof candidate.message === 'string' &&
		typeof candidate.retryable === 'boolean'
	)
}

export function toAgentRuntimeErrorData(error: unknown): AgentRuntimeErrorData {
	if (error instanceof AgentRuntimeError) {
		return {
			code: error.code,
			message: error.message,
			retryable: error.retryable,
		}
	}

	if (isAgentRuntimeErrorData(error)) {
		return error
	}

	if (error instanceof Error) {
		return {
			code: 'provider_request_failed',
			message: error.message,
			retryable: true,
		}
	}

	if (typeof error === 'string') {
		return {
			code: 'provider_request_failed',
			message: error,
			retryable: true,
		}
	}

	return {
		code: 'provider_request_failed',
		message: 'The AI request failed.',
		retryable: true,
	}
}

export function toAgentRuntimeError(error: unknown): AgentRuntimeError {
	return error instanceof AgentRuntimeError
		? error
		: new AgentRuntimeError(toAgentRuntimeErrorData(error))
}

export function getAgentRuntimeErrorMessage(error: unknown): string {
	return toAgentRuntimeErrorData(error).message
}

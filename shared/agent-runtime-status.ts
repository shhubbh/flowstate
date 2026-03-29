import {
	AgentModelName,
	AgentModelProvider,
	DEFAULT_MODEL_NAME,
	getAgentModelDefinition,
	isValidModelName,
} from './models'

export type AgentProviderEnvVar = 'ANTHROPIC_API_KEY' | 'OPENAI_API_KEY' | 'GOOGLE_API_KEY'

export type AgentBackendStatusReasonCode = 'ok' | 'provider_not_configured'

export interface AgentBackendStatusResponse {
	ready: boolean
	modelName: AgentModelName
	provider: AgentModelProvider
	requiredEnvVar?: AgentProviderEnvVar
	reasonCode: AgentBackendStatusReasonCode
	message: string
}

export interface AgentRuntimeEnv {
	ANTHROPIC_API_KEY?: string
	OPENAI_API_KEY?: string
	GOOGLE_API_KEY?: string
}

const PROVIDER_ENV_VARS: Record<AgentModelProvider, AgentProviderEnvVar> = {
	anthropic: 'ANTHROPIC_API_KEY',
	openai: 'OPENAI_API_KEY',
	google: 'GOOGLE_API_KEY',
}

export function normalizeAgentModelName(value?: string): AgentModelName {
	return isValidModelName(value) ? value : DEFAULT_MODEL_NAME
}

export function getRequiredEnvVarForProvider(provider: AgentModelProvider): AgentProviderEnvVar {
	return PROVIDER_ENV_VARS[provider]
}

export function getBackendStatusForModel(
	modelNameInput: string | undefined,
	env: AgentRuntimeEnv
): AgentBackendStatusResponse {
	const modelName = normalizeAgentModelName(modelNameInput)
	const modelDefinition = getAgentModelDefinition(modelName)
	const requiredEnvVar = getRequiredEnvVarForProvider(modelDefinition.provider)
	const apiKey = env[requiredEnvVar]

	if (!apiKey) {
		return {
			ready: false,
			modelName,
			provider: modelDefinition.provider,
			requiredEnvVar,
			reasonCode: 'provider_not_configured',
			message: `Missing \`${requiredEnvVar}\` for \`${modelName}\`. Add it to \`.env.local\`, then restart \`npm run dev\`.`,
		}
	}

	return {
		ready: true,
		modelName,
		provider: modelDefinition.provider,
		requiredEnvVar,
		reasonCode: 'ok',
		message: `Ready to run \`${modelName}\`.`,
	}
}

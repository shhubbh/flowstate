import { useCallback, useEffect, useState } from 'react'
import type { AgentBackendStatusResponse } from '../../shared/agent-runtime-status'
import { getAgentModelDefinition, type AgentModelName } from '../../shared/models'

const UNKNOWN_STATUS_MESSAGE = 'Could not verify the AI backend. Try restarting `npm run dev`.'

export function useAgentBackendStatus(modelName: AgentModelName) {
	const [status, setStatus] = useState<AgentBackendStatusResponse | null>(null)
	const [loading, setLoading] = useState(true)

	const refresh = useCallback(async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/status?model=${encodeURIComponent(modelName)}`)
			const data = (await response.json()) as AgentBackendStatusResponse
			setStatus(data)
			return data
		} catch (_error) {
			const modelDefinition = getAgentModelDefinition(modelName)
			const fallbackStatus: AgentBackendStatusResponse = {
				ready: false,
				modelName,
				provider: modelDefinition.provider,
				reasonCode: 'provider_not_configured',
				message: UNKNOWN_STATUS_MESSAGE,
			}
			setStatus(fallbackStatus)
			return fallbackStatus
		} finally {
			setLoading(false)
		}
	}, [modelName])

	useEffect(() => {
		void refresh()
	}, [refresh])

	return {
		status,
		loading,
		refresh,
	}
}

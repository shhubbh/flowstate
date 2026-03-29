export interface AgentRunResult {
	status: 'success' | 'noop'
	didMutateCanvas: boolean
	appliedActionCount: number
	messageActionCount: number
}

export const EMPTY_AGENT_RUN_RESULT: AgentRunResult = {
	status: 'noop',
	didMutateCanvas: false,
	appliedActionCount: 0,
	messageActionCount: 0,
}

export function mergeAgentRunResults(results: AgentRunResult[]): AgentRunResult {
	return results.reduce<AgentRunResult>(
		(acc, result) => ({
			status: acc.didMutateCanvas || result.didMutateCanvas ? 'success' : 'noop',
			didMutateCanvas: acc.didMutateCanvas || result.didMutateCanvas,
			appliedActionCount: acc.appliedActionCount + result.appliedActionCount,
			messageActionCount: acc.messageActionCount + result.messageActionCount,
		}),
		EMPTY_AGENT_RUN_RESULT
	)
}

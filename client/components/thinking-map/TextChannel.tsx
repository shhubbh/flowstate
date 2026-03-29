import { FormEventHandler, useCallback, useRef, useState } from 'react'
import { useToasts } from 'tldraw'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import type { AgentBackendStatusResponse } from '../../../shared/agent-runtime-status'
import { getAgentRuntimeErrorMessage } from '../../../shared/types/AgentRuntimeError'

export function TextChannel({
	disabled,
	disabledReason,
	refreshBackendStatus,
}: {
	disabled?: boolean
	disabledReason?: string
	refreshBackendStatus: () => Promise<AgentBackendStatusResponse>
}) {
	const agent = useAgent()
	const editor = useTldrawAgentApp().editor
	const toasts = useToasts()
	const inputRef = useRef<HTMLInputElement>(null)
	const [isExpanded, setIsExpanded] = useState(false)

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault()
			if (!inputRef.current) return
			const value = inputRef.current.value.trim()
			if (!value) return

			inputRef.current.value = ''
			setIsExpanded(false)

			try {
				const backendStatus = await refreshBackendStatus()
				if (!backendStatus.ready) {
					toasts.addToast({
						title: 'AI setup required',
						description: backendStatus.message,
						severity: 'warning',
					})
					return
				}

				const result = agent.interrupt({
					input: {
						agentMessages: [value],
						bounds: editor.getViewportPageBounds(),
						source: 'user',
						contextItems: agent.context.getItems(),
					},
				})

				if (result) {
					const runResult = await result
					if (!runResult.didMutateCanvas && runResult.messageActionCount === 0) {
						toasts.addToast({
							title: 'No response',
							description: 'The agent finished without changing the canvas or sending a message.',
							severity: 'warning',
						})
					}
				}
			} catch (err) {
				console.error('Text channel failed:', err)
				toasts.addToast({
					title: 'Text channel failed',
					description: getAgentRuntimeErrorMessage(err),
					severity: 'error',
				})
			}
		},
		[agent, editor, refreshBackendStatus, toasts]
	)

	return (
		<div className="bottom-bar-text-channel">
			<button
				className="text-toggle"
				onMouseDown={(e) => e.preventDefault()}
				onClick={() => !disabled && setIsExpanded(!isExpanded)}
				disabled={disabled}
				title={disabled ? disabledReason ?? 'Wait for agent to finish' : 'Ask the agent something'}
			>
				&#9998;
			</button>
			{isExpanded && !disabled && (
				<form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
					<input
						ref={inputRef}
						type="text"
						placeholder="Ask the agent something..."
						autoFocus
						onBlur={() => {
							if (!inputRef.current?.value) setIsExpanded(false)
						}}
					/>
				</form>
			)}
		</div>
	)
}

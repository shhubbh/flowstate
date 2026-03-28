import { FormEventHandler, useCallback, useRef, useState } from 'react'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'

export function TextChannel({ disabled }: { disabled?: boolean }) {
	const agent = useAgent()
	const editor = useTldrawAgentApp().editor
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
				agent.interrupt({
					input: {
						agentMessages: [value],
						bounds: editor.getViewportPageBounds(),
						source: 'user',
						contextItems: agent.context.getItems(),
					},
				})
			} catch (err) {
				console.error('Text channel failed:', err)
			}
		},
		[agent, editor]
	)

	return (
		<div className="bottom-bar-text-channel">
			<button
				className="text-toggle"
				onMouseDown={(e) => e.preventDefault()}
				onClick={() => !disabled && setIsExpanded(!isExpanded)}
				disabled={disabled}
				title={disabled ? 'Wait for agent to finish' : 'Ask the agent something'}
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

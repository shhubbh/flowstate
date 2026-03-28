import { useCallback, useState } from 'react'
import { useEditor } from 'tldraw'
import { useAgent } from '../../agent/TldrawAgentAppProvider'
import { buildHandoffPrompt } from '../../prompts/system-prompt'

export function HandoffButton() {
	const agent = useAgent()
	const editor = useEditor()
	const [isThinking, setIsThinking] = useState(false)

	const shapeCount = editor.getCurrentPageShapes().length

	const handleHandoff = useCallback(async () => {
		if (shapeCount === 0 || isThinking) return

		if (shapeCount > 40) {
			alert('Canvas has too many nodes (40+ shapes). Remove some before handoff.')
			return
		}

		if (shapeCount > 30) {
			console.warn(`Node count warning: ${shapeCount} shapes on canvas`)
		}

		setIsThinking(true)
		try {
			agent.interrupt({
				input: {
					agentMessages: [buildHandoffPrompt()],
					bounds: editor.getViewportPageBounds(),
					source: 'user',
					contextItems: agent.context.getItems(),
				},
			})
		} catch (err) {
			console.error('Handoff failed:', err)
			alert('Handoff failed. Please try again.')
		} finally {
			// Reset after a delay to let streaming complete
			setTimeout(() => setIsThinking(false), 2000)
		}
	}, [agent, editor, shapeCount, isThinking])

	const isDisabled = shapeCount === 0 || isThinking

	return (
		<button
			className={`handoff-btn ${isThinking ? 'thinking' : ''}`}
			onClick={handleHandoff}
			disabled={isDisabled}
			title={shapeCount === 0 ? 'Add some thoughts first' : 'Hand off to the agent'}
		>
			{isThinking ? 'Thinking...' : 'Handoff'}
		</button>
	)
}

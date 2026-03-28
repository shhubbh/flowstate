import { useState } from 'react'
import { useValue } from 'tldraw'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import type { UndoManager } from '../../lib/undo-manager'

interface UndoButtonProps {
	undoManager: UndoManager
}

export function UndoButton({ undoManager }: UndoButtonProps) {
	const editor = useTldrawAgentApp().editor
	const agent = useAgent()
	const isGenerating = useValue('isGenerating', () => agent.requests.isGenerating(), [agent])
	const [, forceUpdate] = useState(0)

	const canUndo = undoManager.canUndo()
	const isDisabled = !canUndo || isGenerating

	const handleUndo = () => {
		if (isDisabled) return
		undoManager.restore(editor)
		forceUpdate((n) => n + 1)
	}

	return (
		<button
			className={`undo-btn ${canUndo ? 'has-history' : ''}`}
			onClick={handleUndo}
			disabled={isDisabled}
			title={!canUndo ? 'No handoff to undo' : isGenerating ? 'Wait for agent to finish' : 'Undo last handoff'}
		>
			Undo
		</button>
	)
}

import { useCallback, useRef, useState } from 'react'
import { useValue } from 'tldraw'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import { DEFAULT_PERSONA, type AgentPersona } from '../../data/agent-personas'
import type { HandoffDiffSummary } from '../../lib/diff-utils'
import { UndoManager } from '../../lib/undo-manager'
import { DemoLoader } from './DemoLoader'
import { DiffToast } from './DiffToast'
import { EmptyCanvasPrompt } from './EmptyCanvasPrompt'
import { HandoffButton } from './HandoffButton'
import { PersonaSelector } from './PersonaSelector'
import { TextChannel } from './TextChannel'
import { UndoButton } from './UndoButton'

export function BottomBar() {
	const editor = useTldrawAgentApp().editor
	const agent = useAgent()
	const isGenerating = useValue('isGenerating', () => agent.requests.isGenerating(), [agent])
	const shapeCount = useValue('shapeCount', () => editor.getCurrentPageShapes().length, [editor])
	const undoManagerRef = useRef(new UndoManager())

	const [persona, setPersona] = useState<AgentPersona>(DEFAULT_PERSONA)
	const [lastDiff, setLastDiff] = useState<HandoffDiffSummary | null>(null)
	const [diffVisible, setDiffVisible] = useState(false)

	const handleHandoffComplete = useCallback((diff: HandoffDiffSummary) => {
		setLastDiff(diff)
		setDiffVisible(true)
	}, [])

	const handleDismissDiff = useCallback(() => {
		setDiffVisible(false)
	}, [])

	const handleShowLastDiff = useCallback(() => {
		if (lastDiff) setDiffVisible(true)
	}, [lastDiff])

	return (
		<>
			<EmptyCanvasPrompt shapeCount={shapeCount} />
			<DiffToast diff={lastDiff} visible={diffVisible} onDismiss={handleDismissDiff} />
			<div className="bottom-bar">
				<DemoLoader />
				<TextChannel />
				<span className="node-count">
					{shapeCount} node{shapeCount !== 1 ? 's' : ''}
				</span>
				<PersonaSelector value={persona} onChange={setPersona} disabled={isGenerating} />
				<HandoffButton
					undoManager={undoManagerRef.current}
					onHandoffComplete={handleHandoffComplete}
					persona={persona}
				/>
				<UndoButton undoManager={undoManagerRef.current} />
				<button
					className="last-diff-btn"
					onClick={handleShowLastDiff}
					disabled={!lastDiff}
					title="Show last agent diff"
				>
					Last diff
				</button>
			</div>
		</>
	)
}

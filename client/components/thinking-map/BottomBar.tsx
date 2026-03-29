import { useCallback, useRef, useState } from 'react'
import { useValue } from 'tldraw'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import { DEFAULT_PERSONA, type AgentPersona } from '../../data/agent-personas'
import { useAgentBackendStatus } from '../../hooks/useAgentBackendStatus'
import { getUserOwnedShapeCount } from '../../lib/agent-artifacts'
import type { HandoffDiffSummary } from '../../lib/diff-utils'
import { UndoManager } from '../../lib/undo-manager'
import { AgentStatusBanner } from './AgentStatusBanner'
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
	const shapeCount = useValue('shapeCount', () => getUserOwnedShapeCount(editor), [editor])
	const isGenerating = useValue('isGenerating', () => agent.requests.isGenerating(), [agent])
	const modelName = useValue('modelName', () => agent.modelName.getModelName(), [agent])
	const undoManagerRef = useRef(new UndoManager())
	const { status: backendStatus, loading: backendStatusLoading, refresh: refreshBackendStatus } =
		useAgentBackendStatus(modelName)

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
			<AgentStatusBanner
				loading={backendStatusLoading}
				ready={backendStatus?.ready ?? false}
				message={backendStatus?.message ?? 'Checking AI backend…'}
			/>
			<div className="bottom-bar">
				<DemoLoader disabled={isGenerating} />
				<TextChannel
					disabled={isGenerating || backendStatusLoading || !backendStatus?.ready}
					disabledReason={backendStatus?.message}
					refreshBackendStatus={refreshBackendStatus}
				/>
				<span className="node-count">
					{shapeCount} node{shapeCount !== 1 ? 's' : ''}
				</span>
				<PersonaSelector value={persona} onChange={setPersona} disabled={isGenerating} />
				<HandoffButton
					undoManager={undoManagerRef.current}
					onHandoffComplete={handleHandoffComplete}
					persona={persona}
					disabled={isGenerating || backendStatusLoading || !backendStatus?.ready}
					disabledReason={backendStatus?.message}
					refreshBackendStatus={refreshBackendStatus}
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

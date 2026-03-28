import { useCallback, useEffect, useRef, useState } from 'react'
import { TLShape, TLShapeId, useValue } from 'tldraw'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import { computeHandoffDiff, HandoffDiffSummary } from '../../lib/diff-utils'
import type { UndoManager } from '../../lib/undo-manager'
import { buildHandoffPrompt } from '../../prompts/system-prompt'

interface HandoffButtonProps {
	undoManager: UndoManager
	onHandoffComplete?: (diff: HandoffDiffSummary) => void
}

export function HandoffButton({ undoManager, onHandoffComplete }: HandoffButtonProps) {
	const agent = useAgent()
	const editor = useTldrawAgentApp().editor
	const [isThinking, setIsThinking] = useState(false)
	const beforeShapesRef = useRef<Map<TLShapeId, TLShape>>(new Map())
	const staggerTimeoutIds = useRef<number[]>([])

	const shapeCount = useValue('shapeCount', () => editor.getCurrentPageShapes().length, [editor])
	const isGenerating = useValue('isGenerating', () => agent.requests.isGenerating(), [agent])

	// Clean up ghost presence classes and stagger timeouts
	const cleanupGhostPresence = useCallback(() => {
		// Clear all stagger timeouts
		staggerTimeoutIds.current.forEach((id) => clearTimeout(id))
		staggerTimeoutIds.current = []

		// Remove ghost classes from canvas container
		const container = editor.getContainer()
		if (container) {
			container.classList.remove('agent-thinking')
		}

		// Remove .agent-reading from all nodes
		document.querySelectorAll('.agent-reading').forEach((el) => {
			el.classList.remove('agent-reading')
		})
	}, [editor])

	// Detect agent completion for diff computation + thinking state reset
	const prevIsGenerating = useRef(false)
	useEffect(() => {
		if (prevIsGenerating.current && !isGenerating) {
			// Agent just finished — compute diff
			const afterShapes = editor.getCurrentPageShapes()
			const diff = computeHandoffDiff(beforeShapesRef.current, afterShapes)
			onHandoffComplete?.(diff)
			cleanupGhostPresence()
			setIsThinking(false)
		}
		prevIsGenerating.current = isGenerating
	}, [isGenerating, editor, onHandoffComplete, cleanupGhostPresence])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			staggerTimeoutIds.current.forEach((id) => clearTimeout(id))
			staggerTimeoutIds.current = []
		}
	}, [])

	const handleHandoff = useCallback(async () => {
		if (shapeCount === 0 || isThinking) return

		if (shapeCount > 40) {
			alert('Canvas has too many nodes (40+ shapes). Remove some before handoff.')
			return
		}

		if (shapeCount > 30) {
			console.warn(`Node count warning: ${shapeCount} shapes on canvas`)
		}

		// Snapshot for undo
		undoManager.takeSnapshot(editor)

		// Snapshot shapes for diff computation
		beforeShapesRef.current = new Map(
			editor.getCurrentPageShapes().map((s) => [s.id, s])
		)

		setIsThinking(true)

		// Ghost presence: add .agent-thinking to canvas container
		const container = editor.getContainer()
		if (container) {
			container.classList.add('agent-thinking')
		}

		// Stagger .agent-reading on thought nodes after 300ms delay
		const delayId = window.setTimeout(() => {
			const nodes = document.querySelectorAll('.thought-node')
			nodes.forEach((node, i) => {
				const id = window.setTimeout(() => {
					node.classList.add('agent-reading')
				}, i * 200)
				staggerTimeoutIds.current.push(id)
			})
		}, 300)
		staggerTimeoutIds.current.push(delayId)

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
			beforeShapesRef.current = new Map()
			cleanupGhostPresence()
			setIsThinking(false)
		}
	}, [agent, editor, shapeCount, isThinking, undoManager, cleanupGhostPresence])

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

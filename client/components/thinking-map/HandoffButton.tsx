import { useCallback, useEffect, useRef, useState } from 'react'
import { TLShape, TLShapeId, useToasts, useValue } from 'tldraw'
import { useAgent, useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import type { AgentPersona } from '../../data/agent-personas'
import type { AgentBackendStatusResponse } from '../../../shared/agent-runtime-status'
import { getAgentRuntimeErrorMessage } from '../../../shared/types/AgentRuntimeError'
import {
	clearAgentArtifactShapes,
	getHandoffDiffBaseline,
	getUserOwnedShapeCount,
} from '../../lib/agent-artifacts'
import { computeHandoffDiff, HandoffDiffSummary } from '../../lib/diff-utils'
import { applyTensionHeartbeats, clearTensionHeartbeats } from '../../lib/tension-heartbeat'
import type { UndoManager } from '../../lib/undo-manager'
import { buildHandoffPrompt } from '../../prompts/system-prompt'

interface HandoffButtonProps {
	undoManager: UndoManager
	onHandoffComplete?: (diff: HandoffDiffSummary) => void
	persona?: AgentPersona
	disabled?: boolean
	disabledReason?: string
	refreshBackendStatus: () => Promise<AgentBackendStatusResponse>
}

export function HandoffButton({
	undoManager,
	onHandoffComplete,
	persona,
	disabled = false,
	disabledReason,
	refreshBackendStatus,
}: HandoffButtonProps) {
	const agent = useAgent()
	const editor = useTldrawAgentApp().editor
	const toasts = useToasts()
	const [isThinking, setIsThinking] = useState(false)
	const beforeShapesRef = useRef<Map<TLShapeId, TLShape>>(new Map())
	const staggerTimeoutIds = useRef<number[]>([])
	const userShapeCount = useValue('userShapeCount', () => getUserOwnedShapeCount(editor), [editor])

	// Clean up ghost presence classes and stagger timeouts
	const cleanupGhostPresence = useCallback(() => {
		// Clear tension heartbeats
		clearTensionHeartbeats()

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

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			staggerTimeoutIds.current.forEach((id) => clearTimeout(id))
			staggerTimeoutIds.current = []
		}
	}, [])

	const handleHandoff = useCallback(async () => {
		if (disabled || isThinking) return

		const backendStatus = await refreshBackendStatus()
		if (!backendStatus.ready) {
			toasts.addToast({
				title: 'AI setup required',
				description: backendStatus.message,
				severity: 'warning',
			})
			return
		}

		const shapeCount = getUserOwnedShapeCount(editor)
		if (shapeCount === 0) return

		if (shapeCount > 40) {
			toasts.addToast({
				title: 'Canvas too large',
				description: 'Canvas has too many nodes (40+ non-agent shapes). Remove some before handoff.',
				severity: 'warning',
			})
			return
		}

		if (shapeCount > 30) {
			console.warn(`Node count warning: ${shapeCount} shapes on canvas`)
		}

		undoManager.beginSnapshot(editor)
		beforeShapesRef.current = getHandoffDiffBaseline(editor)

		editor.run(
			() => {
				clearAgentArtifactShapes(editor)
			},
			{
				ignoreShapeLock: true,
				history: 'ignore',
			}
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
			const result = agent.interrupt({
				input: {
					agentMessages: [buildHandoffPrompt(persona?.promptSuffix)],
					bounds: editor.getViewportPageBounds(),
					source: 'user',
					contextItems: agent.context.getItems(),
				},
			})

			if (!result) {
				throw new Error('The handoff did not start.')
			}

			const runResult = await result
			if (!runResult.didMutateCanvas) {
				undoManager.rollbackPending(editor)
				toasts.addToast({
					title: 'No canvas changes',
					description:
						runResult.messageActionCount > 0
							? 'The agent responded, but it did not change the canvas.'
							: 'The agent finished without producing any canvas changes.',
					severity: 'warning',
				})
				return
			}

			undoManager.commitSnapshot()
			const afterShapes = editor.getCurrentPageShapes()
			const diff = computeHandoffDiff(beforeShapesRef.current, afterShapes)
			onHandoffComplete?.(diff)
			requestAnimationFrame(() => applyTensionHeartbeats(editor))
		} catch (err) {
			console.error('Handoff failed:', err)
			undoManager.rollbackPending(editor)
			toasts.addToast({
				title: 'Handoff failed',
				description: getAgentRuntimeErrorMessage(err),
				severity: 'error',
			})
			beforeShapesRef.current = new Map()
		} finally {
			beforeShapesRef.current = new Map()
			cleanupGhostPresence()
			setIsThinking(false)
		}
	}, [
		agent,
		cleanupGhostPresence,
		disabled,
		editor,
		isThinking,
		onHandoffComplete,
		persona?.promptSuffix,
		refreshBackendStatus,
		toasts,
		undoManager,
	])

	const isDisabled = disabled || isThinking || userShapeCount === 0

	return (
		<button
			className={`handoff-btn ${isThinking ? 'thinking' : ''}`}
			onClick={handleHandoff}
			disabled={isDisabled}
			title={userShapeCount === 0 ? 'Add some thoughts first' : (disabledReason ?? 'Hand off to the agent')}
		>
			{isThinking ? 'Thinking...' : 'Handoff'}
		</button>
	)
}

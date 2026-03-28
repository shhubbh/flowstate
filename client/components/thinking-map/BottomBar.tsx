import { useCallback, useRef, useState } from 'react'
import { useEditor } from 'tldraw'
import type { HandoffDiffSummary } from '../../lib/diff-utils'
import { UndoManager } from '../../lib/undo-manager'
import { DemoLoader } from './DemoLoader'
import { DiffToast } from './DiffToast'
import { HandoffButton } from './HandoffButton'
import { TextChannel } from './TextChannel'
import { UndoButton } from './UndoButton'

export function BottomBar() {
	const editor = useEditor()
	const shapeCount = editor.getCurrentPageShapes().length
	const undoManagerRef = useRef(new UndoManager())

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
			<DiffToast diff={lastDiff} visible={diffVisible} onDismiss={handleDismissDiff} />
			<div className="bottom-bar">
				<DemoLoader />
				<TextChannel />
				<span className="node-count">
					{shapeCount} node{shapeCount !== 1 ? 's' : ''}
				</span>
				<HandoffButton
					undoManager={undoManagerRef.current}
					onHandoffComplete={handleHandoffComplete}
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

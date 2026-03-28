import { useEditor } from 'tldraw'
import { HandoffButton } from './HandoffButton'
import { TextChannel } from './TextChannel'

export function BottomBar() {
	const editor = useEditor()
	const shapeCount = editor.getCurrentPageShapes().length

	return (
		<div className="bottom-bar">
			<TextChannel />
			<span className="node-count">{shapeCount} node{shapeCount !== 1 ? 's' : ''}</span>
			<HandoffButton />
			<button className="undo-btn" disabled title="Undo last handoff (coming soon)">
				Undo
			</button>
		</div>
	)
}

import { createShapeId } from 'tldraw'
import { useTldrawAgentApp } from '../../agent/TldrawAgentAppProvider'
import { DEMO_SCENARIO } from '../../data/demo-scenario'

export function DemoLoader({ disabled }: { disabled?: boolean }) {
	const editor = useTldrawAgentApp().editor

	const handleLoad = () => {
		const shapes = editor.getCurrentPageShapes()
		if (shapes.length > 0) {
			if (!window.confirm('This will replace your current canvas. Continue?')) {
				return
			}
			editor.deleteShapes(shapes.map((s) => s.id))
		}

		editor.createShapes(
			DEMO_SCENARIO.nodes.map((node) => {
				const w = Math.max(240, Math.min(320, node.text.length * 6.5))
				return {
					id: createShapeId(),
					type: 'thought-node' as const,
					x: node.x,
					y: node.y,
					props: { text: node.text, w, h: 80 },
				}
			})
		)

		editor.zoomToFit({ animation: { duration: 300 } })
	}

	return (
		<button className="demo-btn" onClick={handleLoad} disabled={disabled} title={disabled ? 'Wait for agent to finish' : 'Load demo scenario'}>
			Load Demo
		</button>
	)
}

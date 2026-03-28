import { createShapeId, useEditor } from 'tldraw'
import { DEMO_SCENARIO } from '../../data/demo-scenario'

export function DemoLoader() {
	const editor = useEditor()

	const handleLoad = () => {
		const shapes = editor.getCurrentPageShapes()
		if (shapes.length > 0) {
			if (!window.confirm('This will replace your current canvas. Continue?')) {
				return
			}
			editor.deleteShapes(shapes.map((s) => s.id))
		}

		editor.createShapes(
			DEMO_SCENARIO.nodes.map((node) => ({
				id: createShapeId(),
				type: 'thought-node' as const,
				x: node.x,
				y: node.y,
				props: { text: node.text, w: 240, h: 80 },
			}))
		)

		editor.zoomToFit({ animation: { duration: 300 } })
	}

	return (
		<button className="demo-btn" onClick={handleLoad} title="Load demo scenario">
			Load Demo
		</button>
	)
}

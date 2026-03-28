import type { Editor } from 'tldraw'

/**
 * Applies heartbeat animation classes to thought nodes connected by tension arrows.
 * More tensions = faster heartbeat.
 */
export function applyTensionHeartbeats(editor: Editor): void {
	const shapes = editor.getCurrentPageShapes()
	const tensionCounts = new Map<string, number>()

	// Find all tension arrows (red arrows) and count tensions per connected node
	for (const shape of shapes) {
		if (shape.type !== 'arrow') continue
		const arrow = shape as any
		if (arrow.props?.color !== 'red') continue

		const bindings = editor.getBindingsFromShape(arrow.id, 'arrow')
		if (!bindings) continue

		for (const binding of bindings) {
			const targetId = binding.toId
			if (targetId) {
				tensionCounts.set(targetId, (tensionCounts.get(targetId) || 0) + 1)
			}
		}
	}

	// Apply heartbeat classes to DOM elements
	const nodes = document.querySelectorAll('.thought-node')
	nodes.forEach((el) => {
		const shapeEl = el.closest('[data-shape-id]')
		const shapeId = shapeEl?.getAttribute('data-shape-id')
		if (!shapeId) return

		const count = tensionCounts.get(shapeId) || 0
		if (count === 0) return

		if (count >= 3) {
			el.classList.add('tension-heartbeat-fast')
		} else if (count === 2) {
			el.classList.add('tension-heartbeat-med')
		} else {
			el.classList.add('tension-heartbeat')
		}
	})
}

/**
 * Removes all tension heartbeat classes from the DOM.
 */
export function clearTensionHeartbeats(): void {
	document.querySelectorAll('.tension-heartbeat, .tension-heartbeat-med, .tension-heartbeat-fast').forEach((el) => {
		el.classList.remove('tension-heartbeat', 'tension-heartbeat-med', 'tension-heartbeat-fast')
	})
}

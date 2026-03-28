import { useEffect } from 'react'
import { Box, createShapeId, useEditor, useToasts } from 'tldraw'

const MAX_NODES_PER_PASTE = 30
const COLUMN_COUNT = 3
const COLUMN_WIDTH = 280
const ROW_HEIGHT = 120
const PASTE_OFFSET = 40

export function usePasteHandler() {
	const editor = useEditor()
	const toasts = useToasts()

	useEffect(() => {
		function handlePaste(e: ClipboardEvent) {
			// Only handle if focus is on the tldraw canvas area (not on an input, textarea, etc.)
			const target = e.target as HTMLElement
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable
			) {
				return
			}

			const text = e.clipboardData?.getData('text/plain')
			if (!text) return

			const lines = text
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line.length > 0)

			if (lines.length === 0) return

			if (lines.length > MAX_NODES_PER_PASTE) {
				toasts.addToast({
					title: `Pasted ${MAX_NODES_PER_PASTE} of ${lines.length} lines (max ${MAX_NODES_PER_PASTE})`,
				})
			}

			const linesToCreate = lines.slice(0, MAX_NODES_PER_PASTE)

			// Calculate offset to avoid overlapping existing shapes
			const existingShapes = editor.getCurrentPageShapes()
			let offsetX = 0
			let offsetY = 0

			if (existingShapes.length > 0) {
				const allBounds = existingShapes
					.map((s) => editor.getShapeMaskedPageBounds(s))
					.filter((b): b is Box => b !== undefined)

				if (allBounds.length > 0) {
					const commonBounds = Box.Common(allBounds)
					// Place new nodes below and slightly to the right of existing content
					offsetX = commonBounds.x
					offsetY = commonBounds.maxY + PASTE_OFFSET
				}
			} else {
				// Center on viewport if canvas is empty
				const viewportBounds = editor.getViewportPageBounds()
				offsetX = viewportBounds.x + 40
				offsetY = viewportBounds.y + 40
			}

			// Prevent default paste to avoid tldraw's own paste handling for plain text
			e.preventDefault()

			// Create ThoughtNode shapes in a grid layout
			const shapeCreates = linesToCreate.map((line, i) => {
				const col = i % COLUMN_COUNT
				const row = Math.floor(i / COLUMN_COUNT)

				return {
					id: createShapeId(),
					type: 'thought-node' as const,
					x: offsetX + col * COLUMN_WIDTH,
					y: offsetY + row * ROW_HEIGHT,
					props: {
						text: line,
						w: 240,
						h: 60,
					},
				}
			})

			editor.createShapes(shapeCreates)
		}

		document.addEventListener('paste', handlePaste)
		return () => {
			document.removeEventListener('paste', handlePaste)
		}
	}, [editor, toasts])
}

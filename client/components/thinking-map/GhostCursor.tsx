import { useEffect, useRef, useState } from 'react'
import { SVGContainer, useEditor, useValue } from 'tldraw'
import { useAgent } from '../../agent/TldrawAgentAppProvider'

export function GhostCursor() {
	const editor = useEditor()
	const agent = useAgent()
	const isGenerating = useValue('isGenerating', () => agent.requests.isGenerating(), [agent])
	const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
	const [fadingOut, setFadingOut] = useState(false)
	const intervalRef = useRef<number | null>(null)
	const indexRef = useRef(0)

	useEffect(() => {
		if (isGenerating) {
			setFadingOut(false)

			// Collect thought-node shapes, sort top-to-bottom then left-to-right
			const shapes = editor.getCurrentPageShapes().filter((s) => s.type === 'thought-node')
			if (shapes.length === 0) return

			const sorted = [...shapes].sort((a, b) => {
				const dy = a.y - b.y
				if (Math.abs(dy) > 20) return dy
				return a.x - b.x
			})

			indexRef.current = 0
			// Set initial position
			const first = sorted[0]
			setPosition({ x: first.x - 12, y: first.y - 8 })

			// Advance to next node every 400ms
			intervalRef.current = window.setInterval(() => {
				indexRef.current = (indexRef.current + 1) % sorted.length
				const shape = sorted[indexRef.current]
				setPosition({ x: shape.x - 12, y: shape.y - 8 })
			}, 400)
		} else {
			// Agent finished — fade out
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
			if (position) {
				setFadingOut(true)
				const timeout = window.setTimeout(() => {
					setPosition(null)
					setFadingOut(false)
				}, 400)
				return () => clearTimeout(timeout)
			}
		}

		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGenerating, editor])

	if (!position) return null

	const size = 20

	return (
		<SVGContainer
			className={`ghost-cursor-svg ${fadingOut ? 'fading-out' : ''}`}
			style={{
				top: position.y,
				left: position.x,
				width: size,
				height: size * 1.4,
			}}
		>
			<svg viewBox="0 0 20 28" width={size} height={size * 1.4}>
				<path
					d="M1 1L1 21L6 16L11 26L14 24.5L9 14.5L16 13L1 1Z"
					fill="#A8A4A0"
					fillOpacity={0.85}
					stroke="#7A7672"
					strokeWidth={1}
					strokeLinejoin="round"
				/>
			</svg>
		</SVGContainer>
	)
}

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

			const shapes = editor.getCurrentPageShapes().filter((s) => s.type === 'thought-node')
			if (shapes.length === 0) return

			// Shuffle shapes using Fisher-Yates for a non-repetitive random order
			const shuffled = [...shapes]
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1))
				;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
			}

			// Small random offset so cursor doesn't land on the exact same pixel each visit
			const jitter = () => (Math.random() - 0.5) * 24

			indexRef.current = 0
			const first = shuffled[0]
			setPosition({ x: first.x - 12 + jitter(), y: first.y - 8 + jitter() })

			// Schedule moves with varying dwell times (300-600ms) for organic feel
			const scheduleNext = () => {
				indexRef.current = (indexRef.current + 1) % shuffled.length
				// Re-shuffle when we've visited every node
				if (indexRef.current === 0) {
					for (let i = shuffled.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1))
						;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
					}
				}
				const shape = shuffled[indexRef.current]
				setPosition({ x: shape.x - 12 + jitter(), y: shape.y - 8 + jitter() })
				const delay = 300 + Math.random() * 300
				intervalRef.current = window.setTimeout(scheduleNext, delay)
			}
			const initialDelay = 300 + Math.random() * 300
			intervalRef.current = window.setTimeout(scheduleNext, initialDelay)
		} else {
			// Agent finished — fade out
			if (intervalRef.current !== null) {
				clearTimeout(intervalRef.current)
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
				clearTimeout(intervalRef.current)
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

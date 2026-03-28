interface EmptyCanvasPromptProps {
	shapeCount: number
}

export function EmptyCanvasPrompt({ shapeCount }: EmptyCanvasPromptProps) {
	const isVisible = shapeCount === 0

	return (
		<div
			className="empty-canvas-prompt"
			style={{
				opacity: isVisible ? 0.6 : 0,
				transition: 'opacity 300ms ease',
				pointerEvents: 'none',
			}}
		>
			<h2>Paste your messy thinking</h2>
			<p>We'll make sense of it together.</p>
		</div>
	)
}

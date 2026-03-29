import { BaseBoxShapeUtil, HTMLContainer, T, TLBaseShape, TLResizeInfo } from 'tldraw'

// --- Shape type definition ---

export type ThoughtNodeShape = TLBaseShape<
	'thought-node',
	{
		text: string
		w: number
		h: number
	}
>

// --- Module augmentation to register the shape type ---

declare module 'tldraw' {
	interface TLGlobalShapePropsMap {
		'thought-node': ThoughtNodeShape['props']
	}
}

// --- ShapeUtil ---

export class ThoughtNodeShapeUtil extends BaseBoxShapeUtil<ThoughtNodeShape> {
	static override type = 'thought-node' as const

	static override props = {
		text: T.string,
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): ThoughtNodeShape['props'] {
		return {
			text: '',
			w: 200,
			h: 60,
		}
	}

	override canResize() {
		return true
	}

	override onResize(shape: ThoughtNodeShape, info: TLResizeInfo<ThoughtNodeShape>) {
		const { scaleX, scaleY } = info
		return {
			props: {
				w: Math.max(140, shape.props.w * scaleX),
				h: Math.max(40, shape.props.h * scaleY),
			},
		}
	}

	component(shape: ThoughtNodeShape) {
		const shortId = shape.id.replace('shape:', '').slice(0, 6)

		return (
			<HTMLContainer>
				<div
					style={{
						width: shape.props.w,
						height: shape.props.h,
						maxWidth: 240,
						minWidth: 140,
						borderRadius: 6,
						padding: '14px 16px',
						fontFamily: 'Inter, sans-serif',
						fontSize: 13.5,
						lineHeight: 1.5,
						boxSizing: 'border-box',
						overflow: 'hidden',
						cursor: 'grab',
						display: 'flex',
						flexDirection: 'column',
						gap: 4,
						pointerEvents: 'all',
					}}
					className="thought-node"
				>
					<span
						className="thought-node-id"
						style={{
							fontFamily: "'JetBrains Mono', monospace",
							fontSize: 10,
							userSelect: 'none',
							flexShrink: 0,
						}}
					>
						{shortId}
					</span>
					<span
						style={{
							flex: 1,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							wordBreak: 'break-word',
						}}
					>
						{shape.props.text}
					</span>
				</div>
			</HTMLContainer>
		)
	}

	override toSvg(shape: ThoughtNodeShape) {
		const maxChars = Math.floor((shape.props.w - 32) / 8)
		const displayText =
			shape.props.text.length > maxChars
				? shape.props.text.slice(0, maxChars) + '\u2026'
				: shape.props.text

		return (
			<g>
				<rect
					width={shape.props.w}
					height={shape.props.h}
					rx={6}
					fill="#f5f0eb"
					stroke="#d4cdc4"
					strokeWidth={1}
				/>
				<text
					x={16}
					y={36}
					fontSize={13.5}
					fontFamily="Inter, sans-serif"
					fill="#2c2824"
				>
					{displayText}
				</text>
			</g>
		)
	}

	indicator(shape: ThoughtNodeShape) {
		return (
			<rect
				width={shape.props.w}
				height={shape.props.h}
				rx={6}
				ry={6}
			/>
		)
	}
}

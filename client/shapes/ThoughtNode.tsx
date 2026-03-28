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
						background: '#ffffff',
						border: '1px solid #d4d0ca',
						borderRadius: 6,
						padding: '14px 16px',
						fontFamily: 'Inter, sans-serif',
						fontSize: 13.5,
						lineHeight: 1.5,
						color: '#3a3a3a',
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
						style={{
							fontFamily: "'JetBrains Mono', monospace",
							fontSize: 10,
							color: '#a8a4a0',
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
				<style>{`
					.thought-node:hover {
						box-shadow: 0 2px 8px rgba(0,0,0,0.08);
						border-color: #b8b4ae !important;
					}
				`}</style>
			</HTMLContainer>
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

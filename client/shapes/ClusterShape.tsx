import { BaseBoxShapeUtil, HTMLContainer, T, TLBaseShape, TLResizeInfo } from 'tldraw'

// --- Shape type definition ---

export type ClusterShapeType = TLBaseShape<
	'cluster',
	{
		name: string
		w: number
		h: number
	}
>

// --- Module augmentation to register the shape type ---

declare module 'tldraw' {
	interface TLGlobalShapePropsMap {
		cluster: ClusterShapeType['props']
	}
}

// --- ShapeUtil ---

export class ClusterShapeUtil extends BaseBoxShapeUtil<ClusterShapeType> {
	static override type = 'cluster' as const

	static override props = {
		name: T.string,
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): ClusterShapeType['props'] {
		return {
			name: 'Untitled Cluster',
			w: 320,
			h: 240,
		}
	}

	override canResize() {
		return true
	}

	override onResize(shape: ClusterShapeType, info: TLResizeInfo<ClusterShapeType>) {
		const { scaleX, scaleY } = info
		return {
			props: {
				w: Math.max(120, shape.props.w * scaleX),
				h: Math.max(80, shape.props.h * scaleY),
			},
		}
	}

	component(shape: ClusterShapeType) {
		return (
			<HTMLContainer>
				<div
					style={{
						width: shape.props.w,
						height: shape.props.h,
						border: '1.5px dashed #b8b4ae',
						borderRadius: 12,
						background: 'rgba(255,255,255,0.3)',
						boxSizing: 'border-box',
						position: 'relative',
						pointerEvents: 'all',
					}}
				>
					<span
						style={{
							position: 'absolute',
							top: -10,
							left: 16,
							fontFamily: 'Inter, sans-serif',
							fontSize: 11.5,
							fontWeight: 600,
							textTransform: 'uppercase',
							color: '#6b6660',
							letterSpacing: '0.03em',
							background: '#f8f7f4',
							padding: '2px 10px',
							userSelect: 'none',
							lineHeight: '18px',
						}}
					>
						{shape.props.name}
					</span>
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: ClusterShapeType) {
		return (
			<rect
				width={shape.props.w}
				height={shape.props.h}
				rx={12}
				ry={12}
			/>
		)
	}
}

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
					className="cluster-shape"
					style={{
						width: shape.props.w,
						height: shape.props.h,
						borderRadius: 12,
						boxSizing: 'border-box',
						position: 'relative',
						pointerEvents: 'all',
					}}
				>
					<span
						className="cluster-label"
						style={{
							position: 'absolute',
							top: -10,
							left: 16,
							fontFamily: "'Instrument Serif', serif",
							fontSize: 13,
							fontWeight: 400,
							letterSpacing: '0.01em',
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

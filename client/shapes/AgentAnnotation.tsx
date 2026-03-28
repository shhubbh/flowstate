import { BaseBoxShapeUtil, HTMLContainer, T, TLBaseShape } from 'tldraw'

// --- Annotation type variants (dark mode) ---

const ANNOTATION_STYLES = {
	question: {
		bg: '#2A2620',
		color: '#9A8E7E',
		border: '#5A5444',
		icon: '?',
	},
	tension: {
		bg: '#2E2220',
		color: '#B85A4A',
		border: '#5A3830',
		icon: '!',
	},
	insight: {
		bg: '#1E2A22',
		color: '#5A9A6A',
		border: '#3A5A42',
		icon: '\u25CF', // bullet character
	},
} as const

// --- Shape type definition ---

export type AgentAnnotationShape = TLBaseShape<
	'agent-annotation',
	{
		annotationType: 'question' | 'tension' | 'insight'
		text: string
		w: number
		h: number
	}
>

// --- Module augmentation to register the shape type ---

declare module 'tldraw' {
	interface TLGlobalShapePropsMap {
		'agent-annotation': AgentAnnotationShape['props']
	}
}

// --- Validator for annotationType ---

const annotationTypeValidator = T.literalEnum('question', 'tension', 'insight')

// --- ShapeUtil ---

export class AgentAnnotationShapeUtil extends BaseBoxShapeUtil<AgentAnnotationShape> {
	static override type = 'agent-annotation' as const

	static override props = {
		annotationType: annotationTypeValidator,
		text: T.string,
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): AgentAnnotationShape['props'] {
		return {
			annotationType: 'question',
			text: '',
			w: 24,
			h: 24,
		}
	}

	override canResize() {
		return false
	}

	component(shape: AgentAnnotationShape) {
		const style = ANNOTATION_STYLES[shape.props.annotationType]

		return (
			<HTMLContainer>
				<div
					className={`agent-annotation-badge agent-annotation-${shape.props.annotationType}`}
					style={{
						width: 24,
						height: 24,
						borderRadius: '50%',
						background: style.bg,
						border: `1.5px solid ${style.border}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: 'Inter, sans-serif',
						fontSize: 13,
						fontWeight: 700,
						color: style.color,
						cursor: 'default',
						userSelect: 'none',
						position: 'relative',
						pointerEvents: 'all',
					}}
				>
					{style.icon}
					{shape.props.text && (
						<div
							className="agent-annotation-tooltip"
							style={{
								position: 'absolute',
								bottom: 'calc(100% + 6px)',
								left: '50%',
								transform: 'translateX(-50%)',
								borderRadius: 6,
								padding: '6px 10px',
								fontSize: 12,
								lineHeight: 1.4,
								whiteSpace: 'nowrap',
								maxWidth: 220,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								pointerEvents: 'none',
								opacity: 0,
								transition: 'opacity 0.15s ease',
								fontWeight: 400,
								zIndex: 1000,
							}}
						>
							{shape.props.text}
						</div>
					)}
				</div>
				<style>{`
					.agent-annotation-badge:hover .agent-annotation-tooltip {
						opacity: 1 !important;
					}
				`}</style>
			</HTMLContainer>
		)
	}

	indicator(_shape: AgentAnnotationShape) {
		return <circle cx={12} cy={12} r={12} />
	}
}

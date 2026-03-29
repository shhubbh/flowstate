import type { TLGeoShape, TLShape, TLShapeId, TLTextShape } from 'tldraw'
import { getAgentArtifactNote } from './agent-artifacts'

export interface HandoffDiffSummary {
	clustersCreated: number
	connectionsCreated: number
	annotationsCreated: number
	nodesMoved: number
	nodesDeleted: number
	totalChanges: number
	summaryText: string
}

export function computeHandoffDiff(
	beforeShapes: Map<TLShapeId, TLShape>,
	afterShapes: TLShape[]
): HandoffDiffSummary {
	const afterMap = new Map<TLShapeId, TLShape>(afterShapes.map((s) => [s.id, s]))

	let clustersCreated = 0
	let connectionsCreated = 0
	let annotationsCreated = 0
	let nodesMoved = 0
	let nodesDeleted = 0

	// Find created shapes (in after but not in before)
	for (const [id, shape] of afterMap) {
		if (!beforeShapes.has(id)) {
			if (isClusterFrame(shape)) {
				clustersCreated++
			} else if (shape.type === 'arrow') {
				connectionsCreated++
			} else if (isAnnotation(shape)) {
				annotationsCreated++
			}
		}
	}

	// Find deleted and moved shapes
	for (const [id, beforeShape] of beforeShapes) {
		const afterShape = afterMap.get(id)
		if (!afterShape) {
			nodesDeleted++
		} else if (afterShape.x !== beforeShape.x || afterShape.y !== beforeShape.y) {
			nodesMoved++
		}
	}

	const totalChanges =
		clustersCreated + connectionsCreated + annotationsCreated + nodesMoved + nodesDeleted

	// Build summary text
	const parts: string[] = []
	if (clustersCreated > 0) parts.push(`${clustersCreated} cluster${clustersCreated > 1 ? 's' : ''}`)
	if (connectionsCreated > 0)
		parts.push(`${connectionsCreated} connection${connectionsCreated > 1 ? 's' : ''}`)
	if (annotationsCreated > 0)
		parts.push(`${annotationsCreated} annotation${annotationsCreated > 1 ? 's' : ''}`)

	const createdText = parts.length > 0 ? `Created ${parts.join(', ')}` : ''
	const movedText = nodesMoved > 0 ? `Moved ${nodesMoved} node${nodesMoved > 1 ? 's' : ''}` : ''
	const deletedText =
		nodesDeleted > 0 ? `Removed ${nodesDeleted} node${nodesDeleted > 1 ? 's' : ''}` : ''

	const summaryText =
		[createdText, movedText, deletedText].filter(Boolean).join('. ') || 'No changes detected'

	return {
		clustersCreated,
		connectionsCreated,
		annotationsCreated,
		nodesMoved,
		nodesDeleted,
		totalChanges,
		summaryText,
	}
}

function isClusterFrame(shape: TLShape): boolean {
	if (getAgentArtifactNote(shape) === 'artifact:cluster-frame') {
		return true
	}

	if (shape.type !== 'geo') return false

	const geoShape = shape as TLGeoShape
	return geoShape.props.geo === 'rectangle' && geoShape.props.color === 'grey'
}

function isAnnotation(shape: TLShape): boolean {
	if (getAgentArtifactNote(shape) === 'artifact:annotation') {
		return true
	}

	if (shape.type !== 'text') return false

	const textShape = shape as TLTextShape
	const plainText = extractTextContent(textShape)
	return plainText.startsWith('💡') || plainText.startsWith('⚡') || plainText.startsWith('❓')
}

function extractTextContent(shape: TLTextShape): string {
	const richText = (shape.props.richText as { content?: Array<{ text?: string }> } | undefined)?.content
	if (!Array.isArray(richText)) return ''
	return richText.map((part) => part.text ?? '').join('')
}

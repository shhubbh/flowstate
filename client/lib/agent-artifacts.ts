import type { Editor, TLShape } from 'tldraw'

const AGENT_ARTIFACT_NOTE_PREFIX = 'artifact:'

type ShapeMeta = {
	agentGenerated?: boolean
	agentArtifact?: boolean
	note?: string
}

function getShapeMeta(shape: TLShape): ShapeMeta {
	return (shape.meta ?? {}) as ShapeMeta
}

export function getAgentArtifactNote(shape: TLShape): string {
	return getShapeMeta(shape).note ?? ''
}

export function isAgentGeneratedShape(shape: TLShape): boolean {
	const meta = getShapeMeta(shape)
	return meta.agentGenerated === true || meta.agentArtifact === true
}

export function isAgentArtifactShape(shape: TLShape): boolean {
	const meta = getShapeMeta(shape)
	return meta.agentArtifact === true || getAgentArtifactNote(shape).startsWith(AGENT_ARTIFACT_NOTE_PREFIX)
}

export function getUserOwnedShapes(editor: Editor): TLShape[] {
	return editor.getCurrentPageShapes().filter((shape) => !isAgentArtifactShape(shape))
}

export function getUserOwnedShapeCount(editor: Editor): number {
	return getUserOwnedShapes(editor).length
}

export function getHandoffDiffBaseline(editor: Editor): Map<TLShape['id'], TLShape> {
	return new Map(getUserOwnedShapes(editor).map((shape) => [shape.id, shape]))
}

export function clearAgentArtifactShapes(editor: Editor): TLShape['id'][] {
	const shapeIds = editor
		.getCurrentPageShapes()
		.filter((shape) => isAgentArtifactShape(shape))
		.map((shape) => shape.id)

	if (shapeIds.length > 0) {
		editor.deleteShapes(shapeIds)
	}

	return shapeIds
}

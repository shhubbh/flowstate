import { describe, it, expect } from 'vitest'
import { computeHandoffDiff } from '../client/lib/diff-utils'
import type { TLShape, TLShapeId } from 'tldraw'

function makeShape(id: string, type: string, x = 0, y = 0): TLShape {
	return { id: id as TLShapeId, type, x, y, props: {} } as any
}

describe('computeHandoffDiff', () => {
	it('detects created clusters', () => {
		const before = new Map<TLShapeId, TLShape>()
		const after = [makeShape('shape:1', 'cluster')]

		const diff = computeHandoffDiff(before, after)
		expect(diff.clustersCreated).toBe(1)
		expect(diff.totalChanges).toBe(1)
		expect(diff.summaryText).toContain('1 cluster')
	})

	it('detects created arrows and annotations', () => {
		const before = new Map<TLShapeId, TLShape>()
		const after = [
			makeShape('shape:1', 'arrow'),
			makeShape('shape:2', 'arrow'),
			makeShape('shape:3', 'agent-annotation'),
		]

		const diff = computeHandoffDiff(before, after)
		expect(diff.connectionsCreated).toBe(2)
		expect(diff.annotationsCreated).toBe(1)
		expect(diff.totalChanges).toBe(3)
	})

	it('detects deleted shapes', () => {
		const before = new Map<TLShapeId, TLShape>([
			['shape:1' as TLShapeId, makeShape('shape:1', 'thought-node')],
			['shape:2' as TLShapeId, makeShape('shape:2', 'thought-node')],
		])
		const after = [makeShape('shape:1', 'thought-node')]

		const diff = computeHandoffDiff(before, after)
		expect(diff.nodesDeleted).toBe(1)
		expect(diff.summaryText).toContain('Removed 1 node')
	})

	it('detects moved shapes', () => {
		const before = new Map<TLShapeId, TLShape>([
			['shape:1' as TLShapeId, makeShape('shape:1', 'thought-node', 0, 0)],
			['shape:2' as TLShapeId, makeShape('shape:2', 'thought-node', 100, 100)],
		])
		const after = [
			makeShape('shape:1', 'thought-node', 50, 50), // moved
			makeShape('shape:2', 'thought-node', 100, 100), // unchanged
		]

		const diff = computeHandoffDiff(before, after)
		expect(diff.nodesMoved).toBe(1)
		expect(diff.summaryText).toContain('Moved 1 node')
	})

	it('returns "No changes detected" when nothing changed', () => {
		const shape = makeShape('shape:1', 'thought-node', 10, 20)
		const before = new Map<TLShapeId, TLShape>([['shape:1' as TLShapeId, shape]])
		const after = [makeShape('shape:1', 'thought-node', 10, 20)]

		const diff = computeHandoffDiff(before, after)
		expect(diff.totalChanges).toBe(0)
		expect(diff.summaryText).toBe('No changes detected')
	})

	it('handles mixed changes', () => {
		const before = new Map<TLShapeId, TLShape>([
			['shape:1' as TLShapeId, makeShape('shape:1', 'thought-node', 0, 0)],
			['shape:2' as TLShapeId, makeShape('shape:2', 'thought-node', 50, 50)],
		])
		const after = [
			makeShape('shape:1', 'thought-node', 100, 0), // moved
			// shape:2 deleted
			makeShape('shape:3', 'cluster'), // new
			makeShape('shape:4', 'agent-annotation'), // new
		]

		const diff = computeHandoffDiff(before, after)
		expect(diff.nodesMoved).toBe(1)
		expect(diff.nodesDeleted).toBe(1)
		expect(diff.clustersCreated).toBe(1)
		expect(diff.annotationsCreated).toBe(1)
		expect(diff.totalChanges).toBe(4)
	})
})

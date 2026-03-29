import { describe, expect, it, vi } from 'vitest'
import { convertTldrawShapeToBlurryShape } from '../shared/format/convertTldrawShapeToBlurryShape'

describe('convertTldrawShapeToBlurryShape', () => {
	it('preserves custom thought-node subtype information', () => {
		const editor = {
			getShapeMaskedPageBounds: vi.fn(() => ({ x: 10, y: 20, w: 240, h: 80 })),
			getShapeUtil: vi.fn(() => ({
				getText: () => 'Founder note',
			})),
		} as any

		const blurryShape = convertTldrawShapeToBlurryShape(editor, {
			id: 'shape:thought-1',
			type: 'thought-node',
		} as any)

		expect(blurryShape).toMatchObject({
			type: 'unknown',
			subType: 'thought-node',
			text: 'Founder note',
			shapeId: 'thought-1',
		})
	})
})

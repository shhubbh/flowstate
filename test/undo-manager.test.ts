import { describe, it, expect, vi } from 'vitest'
import { UndoManager } from '../client/lib/undo-manager'

// Minimal mock for Editor and its store
function mockEditor(snapshotData: string = 'snapshot') {
	return {
		store: {
			getStoreSnapshot: vi.fn(() => ({ data: snapshotData })),
			loadStoreSnapshot: vi.fn(),
		},
	} as any
}

describe('UndoManager', () => {
	it('starts with empty stack', () => {
		const um = new UndoManager()
		expect(um.canUndo()).toBe(false)
	})

	it('can begin, commit, and restore a snapshot', () => {
		const um = new UndoManager()
		const editor = mockEditor('state-1')

		um.beginSnapshot(editor)
		um.commitSnapshot()
		expect(um.canUndo()).toBe(true)

		const restored = um.restore(editor)
		expect(restored).toBe(true)
		expect(editor.store.loadStoreSnapshot).toHaveBeenCalledWith({ data: 'state-1' })
		expect(um.canUndo()).toBe(false)
	})

	it('restore returns false on empty stack', () => {
		const um = new UndoManager()
		const editor = mockEditor()

		expect(um.restore(editor)).toBe(false)
		expect(editor.store.loadStoreSnapshot).not.toHaveBeenCalled()
	})

	it('caps stack at maxDepth (3)', () => {
		const um = new UndoManager()

		for (let i = 1; i <= 5; i++) {
			um.beginSnapshot(mockEditor(`state-${i}`))
			um.commitSnapshot()
		}

		// Stack should have 3 entries (states 3, 4, 5)
		const editor = mockEditor()
		um.restore(editor)
		expect(editor.store.loadStoreSnapshot).toHaveBeenCalledWith({ data: 'state-5' })

		um.restore(editor)
		expect(editor.store.loadStoreSnapshot).toHaveBeenCalledWith({ data: 'state-4' })

		um.restore(editor)
		expect(editor.store.loadStoreSnapshot).toHaveBeenCalledWith({ data: 'state-3' })

		expect(um.canUndo()).toBe(false)
	})

	it('clear empties the stack', () => {
		const um = new UndoManager()
		um.beginSnapshot(mockEditor())
		um.commitSnapshot()
		um.beginSnapshot(mockEditor())
		um.commitSnapshot()
		expect(um.canUndo()).toBe(true)

		um.clear()
		expect(um.canUndo()).toBe(false)
	})

	it('discarding a pending snapshot keeps undo history empty', () => {
		const um = new UndoManager()
		um.beginSnapshot(mockEditor('state-1'))
		um.discardSnapshot()

		expect(um.canUndo()).toBe(false)
	})

	it('can roll back a pending snapshot without committing it', () => {
		const um = new UndoManager()
		const editor = mockEditor('state-rollback')

		um.beginSnapshot(editor)
		expect(um.rollbackPending(editor)).toBe(true)
		expect(editor.store.loadStoreSnapshot).toHaveBeenCalledWith({ data: 'state-rollback' })
		expect(um.canUndo()).toBe(false)
	})
})

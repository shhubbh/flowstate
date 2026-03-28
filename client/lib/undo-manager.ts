import type { Editor, StoreSnapshot, TLRecord } from 'tldraw'

interface UndoEntry {
	snapshot: StoreSnapshot<TLRecord>
	timestamp: number
}

export class UndoManager {
	private stack: UndoEntry[] = []
	private maxDepth = 3

	takeSnapshot(editor: Editor) {
		this.stack.push({
			snapshot: editor.store.getStoreSnapshot(),
			timestamp: Date.now(),
		})
		if (this.stack.length > this.maxDepth) this.stack.shift()
	}

	restore(editor: Editor): boolean {
		const entry = this.stack.pop()
		if (!entry) return false
		editor.store.loadStoreSnapshot(entry.snapshot)
		return true
	}

	canUndo(): boolean {
		return this.stack.length > 0
	}

	clear() {
		this.stack = []
	}
}

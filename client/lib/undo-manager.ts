import type { Editor, StoreSnapshot, TLRecord } from 'tldraw'

interface UndoEntry {
	snapshot: StoreSnapshot<TLRecord>
	timestamp: number
}

export class UndoManager {
	private stack: UndoEntry[] = []
	private pendingEntry: UndoEntry | null = null
	private maxDepth = 3

	beginSnapshot(editor: Editor) {
		this.pendingEntry = {
			snapshot: editor.store.getStoreSnapshot(),
			timestamp: Date.now(),
		}
	}

	commitSnapshot() {
		if (!this.pendingEntry) return false
		this.stack.push(this.pendingEntry)
		this.pendingEntry = null
		if (this.stack.length > this.maxDepth) this.stack.shift()
		return true
	}

	discardSnapshot() {
		this.pendingEntry = null
	}

	rollbackPending(editor: Editor): boolean {
		if (!this.pendingEntry) return false
		editor.store.loadStoreSnapshot(this.pendingEntry.snapshot)
		this.pendingEntry = null
		return true
	}

	restore(editor: Editor): boolean {
		this.pendingEntry = null
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
		this.pendingEntry = null
	}
}

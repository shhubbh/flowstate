import { Editor } from 'tldraw'
import { AgentAppAgentsManager } from './managers/AgentAppAgentsManager'

/**
 * The TldrawAgentApp class manages the agent system for a given editor instance.
 *
 * This is a coordinator class that handles app-level concerns shared across agents,
 * such as agent lifecycle management and global settings.
 *
 * Individual agents (TldrawAgent) handle their own concerns like chat, context, and requests.
 * The app manages the agents and coordinates shared state.
 *
 * @example
 * ```tsx
 * const app = new TldrawAgentApp(editor, { onError: handleError })
 * const agent = app.agents.getAgent()
 * agent.prompt('Draw a cat')
 * ```
 */
export class TldrawAgentApp {
	/**
	 * Manager for agent lifecycle - creation, disposal, and tracking.
	 */
	agents: AgentAppAgentsManager

	/**
	 * Handle crash and dispose events.
	 */
	private handleCrash = () => {
		try { this.dispose() } catch { this._editor = null }
	}
	private handleDispose = () => {
		try { this.dispose() } catch { this._editor = null }
	}

	private _editor: Editor | null

	/**
	 * The editor associated with this app.
	 * @throws Error if the app has been disposed.
	 */
	get editor(): Editor {
		if (!this._editor) {
			throw new Error('TldrawAgentApp has been disposed')
		}
		return this._editor
	}

	constructor(
		editor: Editor,
		public options: {
			onError: (e: any) => void
		}
	) {
		this._editor = editor
		this.agents = new AgentAppAgentsManager(this)
		editor.on('crash', this.handleCrash)
		editor.on('dispose', this.handleDispose)
	}

	/**
	 * Dispose of all resources. Call this during cleanup.
	 */
	dispose() {
		if (!this._editor) return
		this._editor.off('crash', this.handleCrash)
		this._editor.off('dispose', this.handleDispose)
		try { this.agents.dispose() } catch { /* disposal must not cascade */ }
		this._editor = null
	}

	/**
	 * Reset everything to initial state.
	 */
	reset() {
		this.agents.reset()
	}
}

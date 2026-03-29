import { UpsertPersonalTodoItemAction } from '../../shared/schema/AgentActionSchemas'
import { Streaming } from '../../shared/types/Streaming'
import { AgentActionUtil, registerActionUtil } from './AgentActionUtil'

export const UpsertTodoListItemActionUtil = registerActionUtil(
	class UpsertTodoListItemActionUtil extends AgentActionUtil<UpsertPersonalTodoItemAction> {
		static override type = 'update-todo-list' as const

		override getInfo() {
			// Don't show todo actions in the chat history because we show them in the dedicated todo list UI
			return null
		}

		override applyAction(action: Streaming<UpsertPersonalTodoItemAction>) {
			if (!action.complete) return

			const { id, text, status } = action

			const index = this.agent.todos.getTodos().findIndex((item) => item.id === id)
			if (index === -1) {
				if (!text) {
					const result = this.agent.interrupt({
						input: 'You must provide text when creating a new todo item.',
					})
					if (result) {
						void result.catch((error) => this.agent.onError(error))
					}
					return
				}
				this.agent.todos.push(id, text)
			} else {
				this.agent.todos.update({ id, status, text })
			}
		}
	}
)

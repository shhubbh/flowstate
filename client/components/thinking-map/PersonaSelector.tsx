import type { AgentPersona } from '../../data/agent-personas'
import { PERSONAS } from '../../data/agent-personas'

interface PersonaSelectorProps {
	value: AgentPersona
	onChange: (persona: AgentPersona) => void
	disabled?: boolean
}

export function PersonaSelector({ value, onChange, disabled }: PersonaSelectorProps) {
	return (
		<div className="persona-selector">
			{PERSONAS.map((persona) => (
				<button
					key={persona.id}
					className={`persona-pill ${persona.id === value.id ? 'active' : ''}`}
					onClick={() => onChange(persona)}
					disabled={disabled}
					title={persona.label}
				>
					{persona.icon} {persona.label}
				</button>
			))}
		</div>
	)
}

interface AgentStatusBannerProps {
	loading: boolean
	message: string
	ready: boolean
}

export function AgentStatusBanner({ loading, message, ready }: AgentStatusBannerProps) {
	if (ready && !loading) return null

	return (
		<div className={`agent-status-banner ${ready ? 'ready' : 'not-ready'}`} role="status" aria-live="polite">
			<span className="agent-status-banner-title">{loading ? 'Checking AI backend…' : 'AI setup required'}</span>
			<span className="agent-status-banner-message">{message}</span>
		</div>
	)
}

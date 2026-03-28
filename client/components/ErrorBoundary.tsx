import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
	children: ReactNode
}

interface State {
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null }

	static getDerivedStateFromError(error: Error): State {
		return { error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('Unhandled error:', error, info.componentStack)
	}

	render() {
		if (this.state.error) {
			return (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#1E1D1B',
						color: '#E8E5E0',
						fontFamily: 'Inter, sans-serif',
						gap: '16px',
					}}
				>
					<p style={{ fontSize: '16px', fontWeight: 500 }}>Something went wrong</p>
					<p
						style={{
							fontSize: '13px',
							color: '#A8A4A0',
							maxWidth: '400px',
							textAlign: 'center',
						}}
					>
						{this.state.error.message}
					</p>
					<button
						onClick={() => window.location.reload()}
						style={{
							marginTop: '8px',
							padding: '8px 20px',
							fontSize: '13px',
							fontWeight: 500,
							background: '#E8E5E0',
							color: '#1E1D1B',
							border: 'none',
							borderRadius: '6px',
							cursor: 'pointer',
						}}
					>
						Reload
					</button>
				</div>
			)
		}
		return this.props.children
	}
}

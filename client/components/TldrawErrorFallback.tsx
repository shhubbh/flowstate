import type { TLErrorFallbackComponent } from '@tldraw/editor'
import { resetLegacyTldrawState } from '../lib/resetLegacyTldrawState'

export const TldrawErrorFallback: TLErrorFallbackComponent = ({ error }) => {
	const message = error instanceof Error ? error.message : 'An unexpected error occurred'

	const handleReload = () => {
		window.location.reload()
	}

	const handleResetAndReload = () => {
		void resetLegacyTldrawState().finally(() => {
			window.location.reload()
		})
	}

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
				{message}
			</p>
			<div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
				<button
					onClick={handleReload}
					style={{
						padding: '8px 20px',
						fontSize: '13px',
						fontWeight: 500,
						background: 'transparent',
						color: '#E8E5E0',
						border: '1px solid #555250',
						borderRadius: '6px',
						cursor: 'pointer',
					}}
				>
					Reload
				</button>
				<button
					onClick={handleResetAndReload}
					style={{
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
					Reset &amp; Reload
				</button>
			</div>
		</div>
	)
}

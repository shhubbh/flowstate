import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../client/components/ErrorBoundary'

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) throw new Error('Test explosion')
	return <div>OK</div>
}

describe('ErrorBoundary', () => {
	it('renders children when no error', () => {
		render(
			<ErrorBoundary>
				<ThrowingChild shouldThrow={false} />
			</ErrorBoundary>
		)
		expect(screen.getByText('OK')).toBeInTheDocument()
	})

	it('renders error message when child throws', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
		render(
			<ErrorBoundary>
				<ThrowingChild shouldThrow={true} />
			</ErrorBoundary>
		)
		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
		expect(screen.getByText('Test explosion')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
		spy.mockRestore()
	})
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TldrawErrorFallback } from '../client/components/TldrawErrorFallback'

vi.mock('@tldraw/editor', () => ({
	hardReset: vi.fn(),
}))

describe('TldrawErrorFallback', () => {
	it('renders error message and both buttons', () => {
		render(<TldrawErrorFallback error={new Error('Test crash')} />)

		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
		expect(screen.getByText('Test crash')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /reset & reload/i })).toBeInTheDocument()
	})

	it('renders fallback message for non-Error values', () => {
		render(<TldrawErrorFallback error="string error" />)

		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
		expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
	})

	it('Reset & Reload button exists and is distinct from Reload', () => {
		render(<TldrawErrorFallback error={new Error('crash')} />)

		const buttons = screen.getAllByRole('button')
		expect(buttons).toHaveLength(2)
		expect(buttons[0]).toHaveTextContent('Reload')
		expect(buttons[1]).toHaveTextContent('Reset & Reload')
	})
})

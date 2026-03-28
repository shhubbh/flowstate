import { useEffect, useState } from 'react'
import type { HandoffDiffSummary } from '../../lib/diff-utils'

interface DiffToastProps {
	diff: HandoffDiffSummary | null
	visible: boolean
	onDismiss: () => void
}

export function DiffToast({ diff, visible, onDismiss }: DiffToastProps) {
	const [fading, setFading] = useState(false)

	useEffect(() => {
		if (!visible || !diff) return

		setFading(false)
		const fadeTimer = setTimeout(() => setFading(true), 9000)
		const dismissTimer = setTimeout(onDismiss, 10000)

		return () => {
			clearTimeout(fadeTimer)
			clearTimeout(dismissTimer)
		}
	}, [visible, diff, onDismiss])

	if (!visible || !diff || diff.totalChanges === 0) return null

	return (
		<div className={`diff-toast ${fading ? 'diff-toast-fading' : ''}`}>
			<div className="diff-toast-header">
				<span className="diff-toast-title">Agent changes</span>
				<button className="diff-toast-close" onClick={onDismiss}>
					&times;
				</button>
			</div>
			<p className="diff-toast-summary">{diff.summaryText}</p>
		</div>
	)
}

import { useCallback, useEffect, useRef, useState } from 'react'
import './LandingPage.css'

type Phase = 'entry' | 'transitioning' | 'video' | 'ending' | 'cta'

interface LandingPageProps {
	onComplete: () => void
	exiting: boolean
}

export function LandingPage({ onComplete, exiting }: LandingPageProps) {
	const [phase, setPhase] = useState<Phase>('entry')
	const videoRef = useRef<HTMLVideoElement>(null)
	const isTransitioning = useRef(false)
	const timers = useRef<ReturnType<typeof setTimeout>[]>([])

	// Clean up timers on unmount
	useEffect(() => {
		return () => {
			timers.current.forEach(clearTimeout)
			if (videoRef.current) {
				videoRef.current.pause()
				videoRef.current.removeAttribute('src')
				videoRef.current.load()
			}
		}
	}, [])

	const schedule = useCallback((fn: () => void, ms: number) => {
		const id = setTimeout(fn, ms)
		timers.current.push(id)
		return id
	}, [])

	const skipToDemo = useCallback(() => {
		setPhase('ending')
		schedule(() => {
			setPhase('cta')
		}, 1500)
	}, [schedule])

	const handleLogoClick = useCallback(() => {
		if (isTransitioning.current) return
		isTransitioning.current = true

		// Start loading the video now (2.5s buffer before play)
		if (videoRef.current) {
			videoRef.current.load()
		}

		setPhase('transitioning')

		// After flow-line animation (1.5s), start zoom-out and transition to video
		schedule(() => {
			// After another 1s for zoom-out, reveal video
			schedule(() => {
				setPhase('video')
				if (videoRef.current) {
					videoRef.current.currentTime = 0
					videoRef.current.play().catch(() => {
						// Video play blocked (autoplay policy, network error, etc.)
						// Skip directly to CTA so the user isn't stuck
						skipToDemo()
					})
				}

				// Fallback: if video hasn't ended after 20s, skip to CTA
				schedule(() => {
					setPhase((current) => {
						if (current === 'video') {
							skipToDemo()
						}
						return current
					})
				}, 20000)
			}, 1000)
		}, 1500)
	}, [schedule, skipToDemo])

	const handleVideoEnded = useCallback(() => {
		setPhase('ending')

		// Wait for fade-to-black (1.5s), then show CTA
		schedule(() => {
			setPhase('cta')
		}, 1500)
	}, [schedule])

	const logoClasses = [
		'logo-btn',
		phase === 'transitioning' || phase === 'video' ? 'flow-anim' : '',
		phase === 'video' || phase === 'ending' || phase === 'cta' ? 'zoom-out' : '',
	]
		.filter(Boolean)
		.join(' ')

	const videoContainerClasses = [
		'layer',
		'video-container',
		phase === 'entry' || phase === 'transitioning' ? 'hidden-layer' : '',
		phase === 'ending' || phase === 'cta' ? 'ended' : '',
	]
		.filter(Boolean)
		.join(' ')

	const demoOverlayClasses = ['demo-overlay', phase === 'cta' ? 'active' : '']
		.filter(Boolean)
		.join(' ')

	const entryHidden =
		phase === 'video' || phase === 'ending' || phase === 'cta'

	return (
		<div className={`landing-page${exiting ? ' exiting' : ''}`}>
			{/* Entry Screen */}
			<div
				className={`fullscreen-container${entryHidden ? ' hidden' : ''}`}
			>
				<button className={logoClasses} onClick={handleLogoClick}>
					<img
						className="logo-image"
						src="/landing/logo.png"
						alt="Flowstate"
					/>
				</button>
				<p
					className="click-hint"
					style={
						phase !== 'entry' ? { opacity: 0 } : undefined
					}
				>
					Click to begin
				</p>
			</div>

			{/* Video Layer */}
			<div className={videoContainerClasses}>
				<video
					ref={videoRef}
					className="main-video"
					preload="none"
					playsInline
					onEnded={handleVideoEnded}
				>
					<source src="/landing/flow.mp4" type="video/mp4" />
				</video>
			</div>

			{/* Demo CTA Overlay */}
			<div className={demoOverlayClasses}>
				<button className="primary-btn" onClick={onComplete}>
					DEMO
				</button>
			</div>
		</div>
	)
}

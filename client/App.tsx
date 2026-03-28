import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	DefaultSizeStyle,
	TLComponents,
	Tldraw,
	TldrawOverlays,
	TldrawUiToastsProvider,
	TLUiOverrides,
} from 'tldraw'
import { TldrawAgentApp } from './agent/TldrawAgentApp'
import {
	TldrawAgentAppContextProvider,
	TldrawAgentAppProvider,
} from './agent/TldrawAgentAppProvider'
import { LandingPage } from './components/landing/LandingPage'
import { BottomBar } from './components/thinking-map/BottomBar'
import { GhostCursor } from './components/thinking-map/GhostCursor'
import { CustomHelperButtons } from './components/CustomHelperButtons'
import { AgentViewportBoundsHighlights } from './components/highlights/AgentViewportBoundsHighlights'
import { AllContextHighlights } from './components/highlights/ContextHighlights'
import { usePasteHandler } from './hooks/usePasteHandler'
import { AgentAnnotationShapeUtil } from './shapes/AgentAnnotation'
import { ClusterShapeUtil } from './shapes/ClusterShape'
import { ThoughtNodeShapeUtil } from './shapes/ThoughtNode'
import { TargetAreaTool } from './tools/TargetAreaTool'
import { TargetShapeTool } from './tools/TargetShapeTool'

// Customize tldraw's styles to play to the agent's strengths
DefaultSizeStyle.setDefaultValue('s')

// Custom shape utils for the thinking map
const shapeUtils = [ThoughtNodeShapeUtil, ClusterShapeUtil, AgentAnnotationShapeUtil]

// Custom tools for picking context items
const tools = [TargetShapeTool, TargetAreaTool]
const overrides: TLUiOverrides = {
	tools: (editor, tools) => {
		return {
			...tools,
			'target-area': {
				id: 'target-area',
				label: 'Pick Area',
				kbd: 'c',
				icon: 'tool-frame',
				onSelect() {
					editor.setCurrentTool('target-area')
				},
			},
			'target-shape': {
				id: 'target-shape',
				label: 'Pick Shape',
				kbd: 's',
				icon: 'tool-frame',
				onSelect() {
					editor.setCurrentTool('target-shape')
				},
			},
		}
	},
}

function App() {
	const [view, setView] = useState<'landing' | 'exiting' | 'app'>('landing')
	const [app, setApp] = useState<TldrawAgentApp | null>(null)
	const [entering, setEntering] = useState(true)

	const handleUnmount = useCallback(() => {
		setApp(null)
	}, [])

	const handleLandingComplete = useCallback(() => {
		setView('exiting')
		setTimeout(() => setView('app'), 800)
	}, [])

	// Fade in the app container after mount
	useEffect(() => {
		if (view === 'app' && entering) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setEntering(false)
				})
			})
		}
	}, [view, entering])

	// Custom components to visualize what the agent is doing
	const components: TLComponents = useMemo(() => {
		return {
			HelperButtons: () =>
				app && (
					<TldrawAgentAppContextProvider app={app}>
						<CustomHelperButtons />
					</TldrawAgentAppContextProvider>
				),
			Overlays: () => (
				<>
					<TldrawOverlays />
					{app && (
						<TldrawAgentAppContextProvider app={app}>
							<AgentViewportBoundsHighlights />
							<AllContextHighlights />
							<GhostCursor />
						</TldrawAgentAppContextProvider>
					)}
				</>
			),
		}
	}, [app])

	if (view === 'landing' || view === 'exiting') {
		return (
			<LandingPage
				onComplete={handleLandingComplete}
				exiting={view === 'exiting'}
			/>
		)
	}

	return (
		<TldrawUiToastsProvider>
			<div className={`tldraw-agent-container${entering ? ' entering' : ''}`}>
				<div className="tldraw-canvas">
					<Tldraw
						persistenceKey="thinking-map"
						tools={tools}
						overrides={overrides}
						components={components}
						shapeUtils={shapeUtils}
					>
						<TldrawAgentAppProvider onMount={setApp} onUnmount={handleUnmount} />
						<PasteHandlerWiring />
					</Tldraw>
				</div>
				{app && (
					<TldrawAgentAppContextProvider app={app}>
						<BottomBar />
					</TldrawAgentAppContextProvider>
				)}
			</div>
		</TldrawUiToastsProvider>
	)
}

/**
 * Thin wrapper that wires the paste handler inside the Tldraw editor context.
 * Must be rendered as a child of <Tldraw> to access the editor via useEditor().
 */
function PasteHandlerWiring() {
	usePasteHandler()
	return null
}

export default App

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { resetLegacyTldrawState } from './lib/resetLegacyTldrawState'
import App from './App'
import './index.css'

function renderApp() {
	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<React.StrictMode>
			<ErrorBoundary>
				<App />
			</ErrorBoundary>
		</React.StrictMode>
	)
}

void resetLegacyTldrawState().finally(renderApp)

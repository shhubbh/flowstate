import React from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { bootApp } from './lib/bootApp'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error('Root element not found')
}

bootApp(
	rootElement,
	<React.StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</React.StrictMode>
)

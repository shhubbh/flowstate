import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import { apiPlugin } from './scripts/vite-api-plugin.js'
import { zodLocalePlugin } from './scripts/vite-zod-locale-plugin.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Load ALL env vars (not just VITE_ prefixed) so the API plugin can read API keys
	const env = loadEnv(mode, process.cwd(), '')
	Object.assign(process.env, env)

	return {
		plugins: [
			apiPlugin(),
			zodLocalePlugin(fileURLToPath(new URL('./scripts/zod-locales-shim.js', import.meta.url))),
			react(),
		],
		server: {
			port: 3000,
		},
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: ['./test/setup.ts'],
			exclude: ['**/node_modules/**', '**/.claude/**'],
		},
	}
})

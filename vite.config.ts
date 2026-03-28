import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { zodLocalePlugin } from './scripts/vite-zod-locale-plugin.js'

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		plugins: [
			zodLocalePlugin(fileURLToPath(new URL('./scripts/zod-locales-shim.js', import.meta.url))),
			react(),
		],
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: ['./test/setup.ts'],
			exclude: ['**/node_modules/**', '**/.claude/**'],
		},
	}
})

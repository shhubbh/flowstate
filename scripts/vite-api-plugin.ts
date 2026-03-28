import type { IncomingMessage, ServerResponse } from 'http'
import type { Plugin, ViteDevServer } from 'vite'

export function apiPlugin(): Plugin {
	return {
		name: 'api-stream',
		configureServer(server: ViteDevServer) {
			server.middlewares.use('/api/stream', async (req: IncomingMessage, res: ServerResponse) => {
				if (req.method === 'OPTIONS') {
					res.writeHead(204, {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'POST, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type',
					})
					res.end()
					return
				}

				if (req.method !== 'POST') {
					res.writeHead(405, { 'Content-Type': 'text/plain' })
					res.end('Method not allowed')
					return
				}

				try {
					const body = await readBody(req)
					const prompt = JSON.parse(body)

					const { AgentService } = await server.ssrLoadModule('/worker/do/AgentService')

					const service = new AgentService({
						ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
						OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
						GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
					})

					res.writeHead(200, {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache, no-transform',
						Connection: 'keep-alive',
						'X-Accel-Buffering': 'no',
						'Access-Control-Allow-Origin': '*',
					})

					for await (const change of service.stream(prompt)) {
						if (req.destroyed) break
						const data = `data: ${JSON.stringify(change)}\n\n`
						res.write(data)
					}
					res.end()
				} catch (error: any) {
					console.error('Stream error:', error)
					const errorMessage = error?.message || String(error)
					if (!res.headersSent) {
						res.writeHead(200, {
							'Content-Type': 'text/event-stream',
							'Cache-Control': 'no-cache',
							'Access-Control-Allow-Origin': '*',
						})
					}
					res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
					res.end()
				}
			})
		},
	}
}

function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = []
		req.on('data', (chunk: Buffer) => chunks.push(chunk))
		req.on('end', () => resolve(Buffer.concat(chunks).toString()))
		req.on('error', reject)
	})
}

import { AgentPrompt } from '../shared/types/AgentPrompt'
import { AgentService } from '../worker/do/AgentService'

export const config = {
	runtime: 'edge',
}

export default async function handler(req: Request) {
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		})
	}

	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	const encoder = new TextEncoder()
	const { readable, writable } = new TransformStream()
	const writer = writable.getWriter()

	const service = new AgentService({
		OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
		ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
		GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!,
	})

	;(async () => {
		try {
			const prompt = (await req.json()) as AgentPrompt

			for await (const change of service.stream(prompt)) {
				const data = `data: ${JSON.stringify(change)}\n\n`
				await writer.write(encoder.encode(data))
				await writer.ready
			}
			await writer.close()
		} catch (error: any) {
			console.error('Stream error:', error)

			const errorMessage =
				error?.message ||
				(typeof error === 'object'
					? JSON.stringify(error, Object.getOwnPropertyNames(error))
					: String(error))
			const errorData = `data: ${JSON.stringify({ error: errorMessage })}\n\n`
			try {
				await writer.write(encoder.encode(errorData))
				await writer.close()
			} catch (writeError) {
				await writer.abort(writeError)
			}
		}
	})()

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
			'Access-Control-Allow-Origin': '*',
		},
	})
}

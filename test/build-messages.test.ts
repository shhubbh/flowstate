import { describe, expect, it } from 'vitest'
import type { AgentMessage } from '../shared/types/AgentMessage'
import { buildMessages, toModelMessages } from '../worker/prompt/buildMessages'

describe('buildMessages', () => {
	it('converts data URI images to AI SDK image parts with mediaType', () => {
		const messages = buildMessages({
			messages: {
				type: 'messages',
				agentMessages: ['data:image/png;base64,aGVsbG8='],
				requestSource: 'user',
			},
		} as any)

		const content = messages[0].content as any[]
		expect(content[0]).toMatchObject({
			type: 'image',
			image: 'aGVsbG8=',
			mediaType: 'image/png',
		})
	})

	it('keeps plain text prompt content unchanged', () => {
		const messages = buildMessages({
			messages: {
				type: 'messages',
				agentMessages: ['hello world'],
				requestSource: 'user',
			},
		} as any)

		const content = messages[0].content as any[]
		expect(content[0]).toEqual({
			type: 'text',
			text: 'hello world',
		})
	})
})

describe('toModelMessages', () => {
	it('passes through non-data-URI image content without mediaType parsing', () => {
		const messages = toModelMessages([
			{
				role: 'user',
				priority: 0,
				content: [
					{
						type: 'image',
						image: 'https://example.com/example.png',
					},
				],
			},
		] satisfies AgentMessage[])

		const content = messages[0].content as any[]
		expect(content[0]).toEqual({
			type: 'image',
			image: 'https://example.com/example.png',
		})
	})
})

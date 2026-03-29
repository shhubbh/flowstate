export const DEMO_SCENARIO = {
	name: 'AI Startup Strategy Brain Dump',
	description: 'A messy brain dump of strategic thoughts for an AI startup — contradictions, half-formed ideas, and competing priorities',
	nodes: [
		// GTM cluster candidates (scattered far apart)
		{ text: 'Start with developers — they tell their managers', x: 60, y: 520 },
		{ text: 'Enterprise pilot with 3 Fortune 500 cos?', x: 820, y: 80 },
		{ text: 'Freemium → convert at team level', x: 430, y: 750 },

		// Product cluster candidates (scattered)
		{ text: 'Ship MVP in 4 weeks, iterate weekly after', x: 140, y: 60 },
		{ text: 'Enterprise needs SOC2 + SSO + audit logs before they even talk', x: 560, y: 430 },
		{ text: 'API-first — let people build on top of us', x: 900, y: 620 },

		// Team & resources (scattered)
		{ text: "3 engineers, burning $40k/mo", x: 350, y: 280 },
		{ text: 'Need to hire enterprise sales rep', x: 720, y: 300 },
		{ text: "Can't do enterprise support with current team", x: 100, y: 380 },

		// Tension bait (placed near wrong clusters to test agent)
		{ text: 'Move fast and break things', x: 680, y: 680 },
		{ text: 'Enterprise customers need 99.9% uptime SLA', x: 50, y: 170 },

		// Orphan / insight bait
		{ text: 'Are we trying to serve two masters??', x: 500, y: 140 },
		{ text: 'YC Demo Day in 8 weeks — need a clear story', x: 250, y: 620 },
	],
}

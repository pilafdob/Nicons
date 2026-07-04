export const SEARCH_ALIASES: Record<string, string[]> = {
	math: ['function', 'functions', 'calculator', 'numbers', 'number', 'plus', 'minus', 'divide', 'equals', 'pi', 'sigma'],
	functions: ['function', 'math', 'calculator'],
	function: ['functions', 'math', 'calculator'],
	number: ['numbers', 'math', 'hash', 'digit'],
	numbers: ['number', 'math', 'hash', 'digit'],
	calculate: ['calculator', 'math', 'divide', 'plus', 'minus', 'equals'],
	calculator: ['calculate', 'math', 'numbers'],

	gym: ['barbell', 'heartbeat', 'boxing glove', 'person simple run', 'person simple bike', 'person simple swim', 'bicycle', 'basketball', 'baseball', 'soccer ball', 'tennis ball'],
	fitness: ['gym', 'barbell', 'heartbeat', 'person simple run', 'person simple bike', 'person simple swim', 'bicycle'],
	workout: ['gym', 'barbell', 'heartbeat', 'person simple run'],
	exercise: ['gym', 'barbell', 'heartbeat', 'person simple run', 'bicycle'],
	training: ['gym', 'barbell', 'heartbeat', 'person simple run'],
	sport: ['basketball', 'baseball', 'football', 'soccer ball', 'tennis ball', 'barbell', 'bicycle'],
	sports: ['basketball', 'baseball', 'football', 'soccer ball', 'tennis ball', 'barbell', 'bicycle'],
	running: ['person simple run', 'sneaker', 'heartbeat'],
	run: ['person simple run', 'sneaker', 'heartbeat'],
	cycling: ['person simple bike', 'bicycle'],
	swimming: ['person simple swim', 'swimming pool'],

	bill: ['invoice', 'receipt', 'money', 'money wavy', 'currency', 'wallet', 'bank', 'credit card', 'cardholder'],
	bills: ['invoice', 'receipt', 'money', 'money wavy', 'currency', 'wallet', 'bank', 'credit card', 'cardholder'],
	invoice: ['bill', 'bills', 'receipt', 'money', 'currency'],
	receipt: ['bill', 'bills', 'invoice', 'money', 'currency'],
	money: ['cash', 'currency', 'bill', 'bills', 'invoice', 'receipt', 'wallet', 'bank'],
	cash: ['money', 'currency', 'bill', 'bills', 'wallet'],
	payment: ['money', 'cash', 'credit card', 'cardholder', 'wallet', 'bank'],
	payments: ['money', 'cash', 'credit card', 'cardholder', 'wallet', 'bank'],
	finance: ['money', 'currency', 'bank', 'wallet', 'invoice', 'receipt'],
	finances: ['money', 'currency', 'bank', 'wallet', 'invoice', 'receipt'],
	subscription: ['receipt', 'invoice', 'money', 'credit card'],
	subscriptions: ['receipt', 'invoice', 'money', 'credit card'],

	school: ['student', 'graduation cap', 'book', 'books', 'notebook', 'chalkboard teacher', 'exam'],
	study: ['student', 'book', 'books', 'notebook', 'pencil', 'exam'],
	education: ['student', 'graduation cap', 'book', 'books', 'chalkboard teacher'],
	learn: ['student', 'book', 'books', 'brain', 'notebook'],
	learning: ['student', 'book', 'books', 'brain', 'notebook'],
	university: ['graduation cap', 'student', 'book', 'chalkboard teacher'],

	write: ['pencil', 'pen', 'edit', 'note'],
	edit: ['pencil', 'pen', 'write'],
	note: ['notebook', 'notepad', 'note pencil', 'file text'],
	notes: ['notebook', 'notepad', 'note pencil', 'file text'],
	document: ['file', 'file text', 'file doc', 'page'],
	documents: ['file', 'file text', 'file doc', 'files'],
	file: ['document', 'page'],
	files: ['document', 'page', 'folders'],
	pdf: ['file pdf'],
	word: ['file doc', 'microsoft word logo'],
	excel: ['file xls', 'microsoft excel logo'],
	powerpoint: ['file ppt', 'microsoft powerpoint logo'],
	presentation: ['file ppt', 'projector screen'],

	delete: ['trash', 'remove', 'x'],
	remove: ['trash', 'delete', 'minus', 'x'],
	settings: ['gear', 'sliders', 'controls'],
	folder: ['directory'],
	directory: ['folder'],
	image: ['picture', 'photo'],
	picture: ['image', 'photo'],
	photo: ['image', 'picture'],
	photography: ['camera', 'image', 'aperture'],
	link: ['url', 'chain'],
	url: ['link', 'globe'],
	time: ['clock', 'calendar'],
	date: ['calendar', 'clock'],
	idea: ['lightbulb', 'brain'],
	search: ['magnifying', 'find'],
	find: ['search', 'magnifying'],

	travel: ['airplane', 'suitcase', 'map pin', 'globe', 'train', 'car'],
	trip: ['airplane', 'suitcase', 'map pin', 'globe', 'train', 'car'],
	vacation: ['airplane', 'beach ball', 'suitcase', 'map pin'],
	transport: ['car', 'bus', 'train', 'airplane', 'bicycle'],
	transportation: ['car', 'bus', 'train', 'airplane', 'bicycle'],

	food: ['fork knife', 'bowl food', 'hamburger', 'pizza', 'coffee', 'cooking pot'],
	recipe: ['fork knife', 'bowl food', 'cooking pot', 'chef hat'],
	recipes: ['fork knife', 'bowl food', 'cooking pot', 'chef hat'],
	cooking: ['cooking pot', 'fork knife', 'chef hat'],
	restaurant: ['fork knife', 'bowl food', 'coffee'],

	health: ['heartbeat', 'first aid kit', 'hospital', 'stethoscope', 'pill'],
	medical: ['first aid kit', 'hospital', 'stethoscope', 'pill', 'heartbeat'],
	doctor: ['stethoscope', 'hospital', 'first aid kit'],
	medicine: ['pill', 'first aid kit', 'hospital'],

	security: ['lock', 'shield', 'key', 'fingerprint', 'password'],
	secure: ['lock', 'shield', 'key', 'fingerprint', 'password'],
	password: ['key', 'lock', 'fingerprint'],
	private: ['lock', 'shield', 'key'],

	shopping: ['shopping bag', 'shopping cart', 'basket', 'storefront', 'tag'],
	shop: ['shopping bag', 'shopping cart', 'basket', 'storefront', 'tag'],
	store: ['storefront', 'shopping bag', 'shopping cart'],

	music: ['music note', 'music notes', 'headphones', 'speaker high', 'microphone'],
	audio: ['speaker high', 'headphones', 'music note', 'waveform'],
	video: ['video camera', 'film slate', 'play circle'],
	movie: ['film slate', 'video camera', 'popcorn'],

	code: ['code', 'file code', 'terminal window', 'brackets curly'],
	programming: ['code', 'file code', 'terminal window', 'brackets curly'],
	development: ['code', 'file code', 'terminal window', 'git branch'],
	database: ['database', 'file sql'],
	server: ['server', 'cloud', 'hard drives'],

	weather: ['cloud', 'sun', 'moon', 'rainbow', 'umbrella', 'snowflake'],
	rain: ['cloud rain', 'umbrella'],
	snow: ['snowflake', 'cloud snow'],
	sunny: ['sun'],
	night: ['moon', 'star'],
};

export function normalizeSearchTerm(term: string): string {
	return term
		.toLowerCase()
		.replace(/[-_]+/g, ' ')
		.replace(/[^a-z0-9\s]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function getAliasTermsForIcon(slug: string): string[] {
	const normalizedSlug = normalizeSearchTerm(slug);
	if (!normalizedSlug) return [];

	const slugTokens = new Set(normalizedSlug.split(' '));
	const aliases = new Set<string>();

	for (const [query, relatedTerms] of Object.entries(SEARCH_ALIASES)) {
		for (const [index, relatedTerm] of relatedTerms.entries()) {
			const normalizedRelatedTerm = normalizeSearchTerm(relatedTerm);
			if (!normalizedRelatedTerm) continue;

			const relatedTokens = normalizedRelatedTerm.split(' ');
			if (
				normalizedRelatedTerm === normalizedSlug
				|| relatedTokens.every(token => slugTokens.has(token))
			) {
				if (index > 3) break;
				aliases.add(query);
				break;
			}
		}
	}

	return [...aliases];
}

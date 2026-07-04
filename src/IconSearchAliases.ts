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

	school: ['student', 'backpack', 'book', 'books', 'notebook', 'chalkboard teacher', 'exam'],
	study: ['student', 'book', 'books', 'notebook', 'pencil', 'exam'],
	education: ['student', 'backpack', 'book', 'books', 'chalkboard teacher'],
	learn: ['student', 'book', 'books', 'brain', 'notebook'],
	learning: ['student', 'book', 'books', 'brain', 'notebook'],
	university: ['student', 'backpack', 'book', 'chalkboard teacher'],
	subject: ['book', 'notebook', 'student', 'chalkboard teacher'],
	class: ['chalkboard teacher', 'student', 'book', 'notebook'],
	classes: ['chalkboard teacher', 'student', 'book', 'notebook'],
	course: ['student', 'book', 'notebook', 'chalkboard teacher'],
	courses: ['student', 'book', 'notebook', 'chalkboard teacher'],
	homework: ['notebook', 'pencil', 'book open text', 'exam'],
	worksheet: ['clipboard text', 'file text', 'list checks', 'notebook'],
	worksheets: ['clipboard text', 'file text', 'list checks', 'notebook'],
	ebook: ['book open text', 'book open', 'book', 'books'],
	ebooks: ['book open text', 'book open', 'book', 'books'],
	tutor: ['chalkboard teacher', 'student', 'book open text', 'notebook'],
	tutoring: ['chalkboard teacher', 'student', 'book open text', 'notebook'],
	nachhilfe: ['chalkboard teacher', 'student', 'book open text', 'notebook'],
	exam: ['exam', 'student', 'notebook', 'check square'],
	test: ['exam', 'student', 'notebook', 'check square'],
	tests: ['exam', 'student', 'notebook', 'check square'],

	science: ['flask', 'test tube', 'atom', 'microscope', 'dna', 'biohazard', 'brain', 'leaf'],
	lab: ['flask', 'test tube', 'microscope', 'atom'],
	laboratory: ['flask', 'test tube', 'microscope', 'atom'],
	research: ['microscope', 'flask', 'test tube', 'magnifying glass'],
	chemistry: ['flask', 'test tube', 'atom', 'microscope', 'biohazard', 'warning diamond'],
	chemstry: ['flask', 'test tube', 'atom', 'microscope', 'biohazard'],
	chemestry: ['flask', 'test tube', 'atom', 'microscope', 'biohazard'],
	chemical: ['flask', 'test tube', 'atom', 'biohazard', 'drop'],
	chem: ['flask', 'test tube', 'atom', 'microscope', 'biohazard'],
	biology: ['dna', 'microscope', 'leaf', 'brain', 'cell signal full', 'biohazard', 'first aid kit'],
	bio: ['dna', 'microscope', 'leaf', 'brain', 'biohazard'],
	physics: ['atom', 'magnet', 'lightning', 'wave sine', 'ruler', 'thermometer'],
	geography: ['globe hemisphere east', 'globe hemisphere west', 'globe', 'map trifold', 'map pin', 'compass rose'],
	geo: ['globe', 'map trifold', 'map pin', 'compass rose'],
	history: ['scroll', 'book open text', 'clock counter clockwise', 'archive', 'bank', 'castle turret'],
	religion: ['church', 'star of david', 'star and crescent', 'yin yang', 'hands praying'],
	ethics: ['scales', 'hand heart', 'heart', 'users', 'question'],
	ethik: ['scales', 'hand heart', 'heart', 'users', 'question'],
	philosophy: ['brain', 'lightbulb', 'question', 'scales', 'book open text'],
	art: ['palette', 'paint brush', 'paint bucket', 'pencil', 'image', 'aperture'],
	arts: ['palette', 'paint brush', 'paint bucket', 'pencil', 'image', 'aperture'],
	be: ['palette', 'paint brush', 'paint bucket', 'pencil', 'image'],
	drawing: ['pencil', 'palette', 'paint brush', 'image'],
	language: ['translate', 'book open text', 'chat text', 'globe', 'quotes'],
	languages: ['translate', 'book open text', 'chat text', 'globe', 'quotes'],
	english: ['translate', 'book open text', 'chat text', 'quotes'],
	german: ['translate', 'book open text', 'chat text', 'globe hemisphere east'],
	deutsch: ['translate', 'book open text', 'chat text', 'globe hemisphere east'],
	spanish: ['translate', 'book open text', 'chat text', 'globe hemisphere west'],
	espanol: ['translate', 'book open text', 'chat text', 'globe hemisphere west'],
	latin: ['scroll', 'book open text', 'bank', 'columns', 'translate'],
	music: ['music note', 'music notes', 'music notes simple', 'piano keys', 'headphones', 'speaker high', 'microphone'],
	it: ['cpu', 'circuitry', 'desktop tower', 'terminal window', 'code', 'database', 'wifi high'],
	ict: ['cpu', 'circuitry', 'desktop tower', 'terminal window', 'code', 'database'],
	'computer science': ['cpu', 'circuitry', 'desktop tower', 'terminal window', 'code', 'database'],
	'comp sci': ['cpu', 'circuitry', 'desktop tower', 'terminal window', 'code', 'database'],
	computer: ['desktop tower', 'cpu', 'circuitry', 'terminal window', 'code'],
	computers: ['desktop tower', 'cpu', 'circuitry', 'terminal window', 'code'],

	write: ['pencil', 'pen', 'edit', 'note'],
	edit: ['pencil', 'pen', 'write'],
	note: ['notebook', 'notepad', 'note pencil', 'file text'],
	notes: ['notebook', 'notepad', 'note pencil', 'file text'],
	document: ['file', 'file text', 'file doc', 'page'],
	documents: ['file', 'file text', 'file doc', 'files'],
	attachment: ['paperclip', 'paperclip horizontal'],
	attachments: ['paperclip', 'paperclip horizontal'],
	inbox: ['tray arrow down', 'tray', 'archive', 'box arrow down'],
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
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
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

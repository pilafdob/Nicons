export interface BundledPhosphor {
	name: string;
	variants: Record<string, Record<string, string>>;
}

export function loadBundledPhosphorData(): Promise<BundledPhosphor>;

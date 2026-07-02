export function parseOpenClawStores(value?: string): string[] {
    if (!value) return ['costco'];
    return value.split(',').map(s => s.trim()).filter(Boolean);
}
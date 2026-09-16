import { cn as mergeClasses, type ClassValue } from 'cn';

export function cn(...inputs: ClassValue[]): string {
    return mergeClasses(inputs);
}

export function initials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
}

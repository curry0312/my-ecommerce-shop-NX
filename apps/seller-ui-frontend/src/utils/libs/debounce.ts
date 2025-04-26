export default function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timeoutId: NodeJS.Timeout | null;
    return function (...args: any[]) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
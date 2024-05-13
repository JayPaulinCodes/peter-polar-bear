export class Filters {
    public static notNull<T>(value: T | null | undefined): value is T {
        return value !== null;
    }

    public static notUndefined<T>(value: T | null | undefined): value is T {
        return value !== undefined;
    }

    public static notEmpty<T>(value: T | null | undefined): value is T {
        return value !== null && value !== undefined;
    }
}
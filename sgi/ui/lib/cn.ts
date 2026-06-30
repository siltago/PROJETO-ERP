type ClassValue = string | undefined | null | false | 0 | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];
  for (const input of inputs) {
    if (input === null || input === undefined || input === false || input === 0 || input === "") continue;
    if (typeof input === "string") {
      result.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) result.push(key);
      }
    }
  }
  return result.join(" ");
}

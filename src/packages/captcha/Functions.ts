export function randomCaptchaText(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array(6)
        .join()
        .split(',')
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join('');
}

export function shuffleArray(arr: number[]): number[] {
    let i: number = arr.length,
			temp: number,
			randomIndex: number;
    // While there remain elements to shuffle...
    while (0 !== i) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * i);
        i -= 1;
        // And swap it with the current element.
        temp = arr[i];
        arr[i] = arr[randomIndex];
        arr[randomIndex] = temp;
    }
    return arr;
}
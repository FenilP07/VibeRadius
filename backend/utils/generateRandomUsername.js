/**
 * Music App Username Generator
 * Generates random, readable, music-themed usernames
 */

const adjectives = [
    "lofi",
    "echo",
    "neon",
    "bass",
    "chill",
    "retro",
    "vinyl",
    "cosmic",
    "midnight",
    "electric",
    "silent",
    "urban",
    "dreamy",
    "smooth"
];

const nouns = [
    "beats",
    "vibes",
    "waves",
    "melody",
    "rhythm",
    "groove",
    "tune",
    "note",
    "sound",
    "track",
    "harmonic",
    "studio",
    "dj",
    "synth"
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(length = 3) {
    return Math.floor(
        Math.pow(10, length - 1) +
        Math.random() * Math.pow(10, length - 1)
    );
}

/**
 * Generate a random username
 * @param {Object} options
 * @param {boolean} options.includeNumber - Append numbers (default true)
 * @param {string} options.separator - Separator between words (default "")
 * @returns {string}
 */
function generateUsername(options = {}) {
    const {
        includeNumber = true,
        separator = ""
    } = options;

    const adjective = randomItem(adjectives);
    const noun = randomItem(nouns);

    let username = `${adjective}${separator}${noun}`;

    if (includeNumber) {
        username += randomNumber(3);
    }

    return username.toLowerCase();
}

export {
    generateUsername
};

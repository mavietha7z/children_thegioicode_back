function randomPassword(lettersUppercase, lettersNormal, letters, numbers, special, either) {
    const chars = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'abcdefghijklmnopqrstuvwxyz',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        '0123456789',
        '!#?',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    ];

    return [lettersUppercase, lettersNormal, letters, numbers, special, either]
        .map((len, i) => {
            return Array(len)
                .fill(chars[i])
                .map(() => {
                    return chars[i][Math.floor(Math.random() * chars[i].length)];
                })
                .join('');
        })
        .concat()
        .join('')
        .split('')
        .sort(() => {
            return 0.5 - Math.random();
        })
        .join('');
}

function randomPasswordCloudServer() {
    return randomPassword(0, 0, 1, 0, 0, 0) + randomPassword(2, 2, 0, 2, 2, 2) + randomPassword(0, 0, 1, 0, 0, 0);
}

function generateVncPassword(length = 8) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

export { randomPasswordCloudServer, generateVncPassword };

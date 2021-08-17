
export const numMatches = (card1, card2) => {
    if (!card1 || !card2) {
        return 0
    }
    return (card1.color === card2.color ? 1 : 0)
        + (card1.wallpaper === card2.wallpaper ? 1 : 0)
        + (card1.decoration === card2.decoration ? 1 : 0)
}

export const perfectMatch = (card, state) => {
    return numMatches(card, state.center.last()) === 3
}
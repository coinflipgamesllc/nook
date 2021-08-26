export enum Location {
    Deck = "deck",
    Discard = "discard",
    Center = "center",
    Hand = "hand",
    Win = "win",
};

export const getLocationSortOrder = (location: Location): number => {
    switch (location) {
        case Location.Center:
            return 0;
        case Location.Discard:
            return 1;
        case Location.Deck:
            return 2;
        case Location.Hand:
            return 3;
        case Location.Win:
            return 4;
    }
};

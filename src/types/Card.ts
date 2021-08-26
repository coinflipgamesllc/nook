import { Location } from './Location';
import { Position } from './Position';

export type Card = {
    id: Readonly<number>;

    color: Readonly<string>;
    wallpaper: Readonly<string>;
    decoration: Readonly<string>;

    location: Location;
    visible: boolean;

    pos: Position;

    // Player index that this card belongs to
    owner: number | null;

    animating: boolean;
};

export const numMatches = (a: Card, b: Card): number => {
    return (a.color === b.color ? 1 : 0)
        + (a.wallpaper === b.wallpaper ? 1 : 0)
        + (a.decoration === b.decoration ? 1 : 0);
};

export const cardToString = (card: Card): string => {
    return `[${card.color},${card.wallpaper},${card.decoration} (${card.id})]`;
};

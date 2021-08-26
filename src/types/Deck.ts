import { Card } from './Card';
import { Location } from './Location';

export class Deck extends Array<Card>
{
    static create(): Deck
    {
        let deck = new Deck();

        const colors = ['blue', 'grey', 'red'];
        const wallpapers = ['flower', 'stripes', 'chevron'];
        const decorations = ['clock', 'picture', 'plant'];

        for (let i = 0; i < 2; i++) {
            colors.forEach((color) => {
                wallpapers.forEach((wallpaper) => {
                    decorations.forEach((decoration) => {
                        deck.push({
                            id: deck.length,
                            color,
                            wallpaper,
                            decoration,
                            location: Location.Deck,
                            visible: false,
                            pos: { x: 0, y: 0 },
                            owner: null,
                            animating: false,
                        });
                    });
                });
            });
        }

        return deck.shuffle();
    }

    shuffle(): Deck
    {
        let d = new Deck();
        d.push(
            ...this.map((value) => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        );

        return d;
    }
};

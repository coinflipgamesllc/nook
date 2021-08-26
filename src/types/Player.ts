import { Dispatch } from 'react';
import { GameState, Action, Actions, getHand, getCenter } from './GameState';
import { numMatches } from './Card';
import { Phase } from './Turn';

export type Player = {
    // Which "seat" this player is in at the table
    seat: number;

    // Display name
    name: string;

    // What strategy to use while playing (used for bots, mostly)
    strategy: PlayerStrategy;

    // Number of cards needed to be discarded
    toDiscard: number;
};

export interface PlayerStrategy {
    isHuman(): boolean;

    // Turn off your mind
    cancelThoughts(): void;

    // What this player should do when a new card is played
    onCardPlayed(player: Player, state: GameState, dispatch: Dispatch<Action>): void;

    // What this player should do when they have to discard cards
    onDiscardNeeded(player: Player, state: GameState, dispatch: Dispatch<Action>): void;
};

export class HumanStrategy implements PlayerStrategy {
    isHuman(): boolean
    {
        return true;
    }

    cancelThoughts(): void
    {
        // Do nothing! (Free will?)
    }

    onCardPlayed(player: Player, state: GameState, dispatch: Dispatch<Action>): void
    {
        // Do nothing!
    }

    onDiscardNeeded(player: Player, state: GameState, dispatch: Dispatch<Action>): void
    {
        // Do nothing!
    }
}

export class BotStrategy implements PlayerStrategy {
    timeout: NodeJS.Timeout | null;

    constructor()
    {
        this.timeout = null;
    }

    isHuman(): boolean
    {
        return false; // beep boop beep
    }

    cancelThoughts(): void
    {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }
    }

    onCardPlayed(player: Player, state: GameState, dispatch: Dispatch<Action>): void
    {
        // Only handle one operation at a time
        this.cancelThoughts();

        // Only play a card when you're allowed (other player is thinking or player is playing)
        if (state.paused || [Phase.Wait, Phase.Discard, Phase.Pregame, Phase.Preround].includes(state.turn.phase)) {
            return;
        }

        // Handle the actual logic after "deciding"
        this.timeout = setTimeout(() => {
            const center = getCenter(state);
            const hand = getHand(state, player.seat);

            // Play the best match in-hand
            let bestMatch = 0;
            let toPlay = -1;
            for (let i = 0; i < hand.length; i++) {
                const matches = numMatches(hand[i], center);
                if (matches > bestMatch) {
                    bestMatch = matches;
                    toPlay = hand[i].id;
                }
            }

            // Play a card if it's our turn or we have a perfect match
            if (toPlay !== -1 && (state.turn.player === player.seat || bestMatch === 3)) {
                dispatch({ type: Actions.PlayCard, payload: { id: toPlay, player: player.seat }});
            } else if (state.turn.player === player.seat) {
                // No matches, draw a card
                dispatch({ type: Actions.Draw, payload: { player: player.seat }});
            }
        }, 1000 * getHand(state, player.seat).length);

        if (state.turn.player === player.seat && state.turn.phase !== Phase.Think) {
            dispatch({ type: Actions.Think, payload: { player: player.seat }});
        }
    }

    onDiscardNeeded(player: Player, state: GameState, dispatch: Dispatch<Action>): void
    {
        const hand = getHand(state, player.seat);

        if (player.toDiscard > 0 && hand.length > 0) {
            dispatch({ 
                type: Actions.DiscardCard, 
                payload: { id: hand[0].id, player: player.seat },
            })
        }
    }
}

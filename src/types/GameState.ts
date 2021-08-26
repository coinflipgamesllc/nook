import { toast } from 'react-toastify';
import { Card, numMatches, cardToString } from './Card';
import { Deck } from './Deck';
import { Player, HumanStrategy, BotStrategy } from './Player';
import { Turn, Phase } from './Turn'
import { Location } from './Location';
import { Draft } from 'immer';
import { DefaultPositions, calculatePositions } from '../util/usePositions';

export type GameState = {
    cards: Deck;
    center: number; // Card ID that is the current center
    previousCenter: number; // Card ID that was previously the center
    players: Player[];
    turn: Turn;
    paused: boolean;
    positions: DefaultPositions;
};

export const initialState: GameState = {
    cards: new Deck(),
    center: -1,
    previousCenter: -1,
    players: [],
    turn: {
        player: 0,
        phase: Phase.Pregame,
    },
    paused: false,
    positions: calculatePositions({ width: window.innerWidth, height: window.innerHeight }),
};

export enum Actions {
    LoadGame = "LoadGame",
    StartGame = "StartGame",
    PauseGame = "PauseGame",
    ResumeGame = "ResumeGame",
    Resize = "Resize",
    Deal = "Deal",
    StartRound = "StartRound",
    PlayCard = "PlayCard",
    DiscardCard = "DiscardCard",
    Draw = "Draw",
    Think = "Think",
    WinRound = "WinRound",
    WinGame = "WinGame",
    FinishAnimation = "FinishAnimation",
};

export interface StartGamePayload {
    numHumans: number;
    numBots: number;
};

export interface PlayCardPayload {
    id: number;
    player: number;
}

export interface CardPayload {
    id: number;
}

export interface PlayerPayload {
    player: number;
}

export type Action =
    | { type: Actions.LoadGame, payload: GameState }
    | { type: Actions.StartGame, payload: StartGamePayload }
    | { type: Actions.PauseGame, payload: null }
    | { type: Actions.ResumeGame, payload: null }
    | { type: Actions.Resize, payload: DefaultPositions }
    | { type: Actions.Deal, payload: null }
    | { type: Actions.StartRound, payload: null }
    | { type: Actions.PlayCard, payload: PlayCardPayload }
    | { type: Actions.DiscardCard, payload: PlayCardPayload }
    | { type: Actions.Think, payload: PlayerPayload }
    | { type: Actions.Draw, payload: PlayerPayload }
    | { type: Actions.WinRound, payload: PlayerPayload }
    | { type: Actions.FinishAnimation, payload: CardPayload }
    | { type: Actions.WinGame, payload: PlayerPayload }

export function reducer(draft: Draft<GameState>, action: Action): void {
    switch(action.type) {
        case Actions.LoadGame:
            draft.cards = new Deck(...action.payload.cards);
            draft.center = action.payload.center;
            draft.previousCenter = action.payload.previousCenter;
            draft.players = action.payload.players;
            draft.turn = action.payload.turn;

            break;

        case Actions.StartGame:
            let players = new Array<Player>();
            for (let i = 0; i < action.payload.numHumans; i++) {
                players.push({
                    seat: i,
                    name: `You`,
                    strategy: new HumanStrategy(),
                    toDiscard: 0,
                });
            }

            for (let i = 0; i < action.payload.numBots; i++) {
                players.push({
                    seat: i + action.payload.numHumans,
                    name: `Bot ${i + 1}`,
                    strategy: new BotStrategy(),
                    toDiscard: 0,
                });
            }

            draft.cards = Deck.create();
            draft.players = players;
            draft.turn = {
                player: Math.floor(Math.random() * players.length),
                phase: Phase.Preround
            };
            break;

        case Actions.PauseGame:
            draft.paused = true;
            break;

        case Actions.ResumeGame:
            draft.paused = false;
            break;

        case Actions.Resize:
            draft.positions = action.payload;
            draft.cards.map((c) => {
                switch (c.location) {
                    case Location.Center:
                        c.pos = draft.positions.center;
                        break;
                    case Location.Deck:
                        c.pos = draft.positions.deck;
                        break;
                    case Location.Discard:
                        c.pos = draft.positions.discard;
                        break;
                    case Location.Hand:
                        if (c.owner !== null) {
                            c.pos = draft.positions.players[c.owner];
                        }
                        break;
                }

                return c;
            });

            break;

        case Actions.Deal:
            // 2-3 players = 9 cards, 4 players = 8 cards, 5 players = 7 cards
            const baseCards = 9 - draft.players.length + 3;

            moveToCenter(draft, draft.cards.find((c) => c.location === Location.Deck) as Card, false);

            for (let seat = 0; seat < draft.players.length; seat++) {
                for (let i = 0; i < baseCards + numWins(draft, seat); i++) {
                    dealCard(draft, seat);
                }
            }

            draft.turn.phase = Phase.Wait;
            break;

        case Actions.StartRound:
            draft.cards.filter((c) => c.id === draft.center)[0].visible = true;
            draft.turn.phase = Phase.Play;
            break;

        case Actions.PlayCard: {
            const playedCard = getCard(draft, action.payload.id);
            const center = getCard(draft, draft.center);
            if (playedCard && center) {
                const matches = numMatches(center, playedCard);
                console.log(`${draft.players[action.payload.player].name} played ${cardToString(playedCard)}. It has ${matches} matches on ${cardToString(center)}`);

                // On turn play
                if (draft.turn.player === action.payload.player && matches > 0) {
                    moveToCenter(draft, playedCard, true);
                    
                    if (matches - 1 > 0) {
                        draft.turn.phase = Phase.Discard;
                        draft.players[draft.turn.player].toDiscard = matches - 1;
                    } else {
                        draft.turn.player++;
                        if (draft.turn.player >= draft.players.length) {
                            draft.turn.player = 0;
                        }
                        draft.turn.phase = Phase.Play;
                    }
                } else if (draft.turn.player !== action.payload.player && matches === 3) {
                    toast('Perfect Match!', { toastId: 'perfect-match' });

                    // Perfect match, off turn
                    moveToCenter(draft, playedCard, true);
                    
                    draft.turn.player = action.payload.player;
                    draft.turn.phase = Phase.Play;
                } else if (action.payload.player === 0) {
                    // No match! (Do something?)
                    toast.error('That card has no matches!', { toastId: 'rejected' });
                }
            }

            break;
        }

        case Actions.DiscardCard: {
            const playedCard = getCard(draft, action.payload.id);

            if (playedCard) {
                moveToDiscard(draft, playedCard);   
                    
                draft.players[draft.turn.player].toDiscard--;
                console.log(`${draft.players[action.payload.player].name} discarded a card.`);

                if (draft.players[draft.turn.player].toDiscard <= 0) {
                    draft.turn.player++;
                    if (draft.turn.player >= draft.players.length) {
                        draft.turn.player = 0;
                    }
                    draft.turn.phase = Phase.Play;
                }
            }

            break;
        }

        case Actions.Think:
            if (draft.turn.player === action.payload.player) {
                draft.turn.phase = Phase.Think;
            }
            break;

        case Actions.Draw:
            // Shuffle the discard pile back into the draw pile when it runs out
            if (draft.cards.filter((c) => c.location === Location.Deck).length === 0) {
                draft.cards.map((c) => {
                    if (c.location === Location.Discard) {
                        c.location = Location.Deck;
                        c.pos = draft.positions.deck;
                        c.animating = true;
                    }

                    return c;
                });
            }

            if (draft.turn.player === action.payload.player) {
                dealCard(draft, draft.turn.player);
            }
            break;

        case Actions.WinRound:
            toast(`${draft.players[action.payload.player].name} won the round!`, { toastId: 'win-round' });

            moveToWin(draft, draft.cards.find((c) => c.location !== Location.Win) as Card, action.payload.player);
            resetRound(draft, action.payload.player);

            break;

        case Actions.WinGame:
            moveToWin(draft, draft.cards.find((c) => c.location !== Location.Win) as Card, action.payload.player);
            draft.turn.phase = Phase.Postgame;

            break;

        case Actions.FinishAnimation:
            const card = getCard(draft, action.payload.id);
            if (card) {
                card.animating = false;
            }
            break;

        default:
            throw new Error(`Unknown action ${JSON.stringify(action)}`)
    }
}

function getCard(draft: Draft<GameState>, id: number): Card | undefined {
    return draft.cards.find((c) => c.id === id);
}

function moveToCenter(draft: Draft<GameState>, card: Card, visible: boolean): void {
    draft.previousCenter = draft.center;

    card.location = Location.Center;
    card.pos = draft.positions.center;
    card.visible = visible;
    card.owner = null;
    card.animating = true;
    
    draft.center = card.id;
}

function moveToDiscard(draft: Draft<GameState>, card: Card): void {
    card.location = Location.Discard;
    card.pos = draft.positions.discard;
    card.visible = false;
    card.owner = null;
    card.animating = true;
}

function resetRound(draft: Draft<GameState>, lastWinner: number) {
    draft.cards.map((c) => {
        if (c.location !== Location.Win) {
            c.location = Location.Deck;
            c.pos = draft.positions.deck;
            c.visible = false;
            c.owner = null;
            c.animating = true;
        }

        return c;
    });
    draft.cards = draft.cards.shuffle();

    draft.turn = {
        player: lastWinner,
        phase: Phase.Preround,
    };

    draft.players.forEach((player) => player.toDiscard = 0);
}

function numWins(draft: Draft<GameState>, seat: number): number {
    return draft.cards.filter((c) => c.owner === seat && c.location === Location.Win).length;
}

function dealCard(draft: Draft<GameState>, seat: number): void {
    let card = draft.cards.find((c) => c.location === Location.Deck);

    if (card) {
        card.pos = draft.positions.players[seat];
        card.location = Location.Hand;
        card.owner = seat;
        card.visible = draft.players[seat].strategy.isHuman();
        card.animating = true;
    }
}

function moveToWin(draft: Draft<GameState>, card: Card, seat: number): void {
    card.pos = draft.positions.win;
    card.location = Location.Win;
    card.owner = seat;
    card.visible = false;
}

export const getCenter = (state: GameState): Card => 
    state.cards.filter((c) => c.id === state.center)[0];

export const getHand = (state: GameState, player: number): Card[] => 
    state.cards.filter((c) => c.owner === player && c.location === Location.Hand);

export const getRoundWinner = (state: GameState): number | undefined => {
    if (state.turn.phase === Phase.Preround) {
        return undefined;
    }

    return state.players
        .map((p) => ({ seat: p.seat, handSize: getHand(state, p.seat).length }))
        .filter((p) => p.handSize === 0)
        .map((p) => p.seat )
        .shift();
};

export const getGameWinner = (state: GameState): number | undefined => {
    if (state.turn.phase === Phase.Preround) {
        return undefined;
    }

    // Because of the state updates, we're actually checking for a win at the moment the
    // player's hand goes to 0 and they have 2 wins already (which will be 3 in a second if they do).
    return state.players
        .map((p) => ({ seat: p.seat, handSize: getHand(state, p.seat).length, wins: numWins(state, p.seat) }))
        .filter((p) => p.wins === 2 && p.handSize === 0)
        .map((p) => p.seat)
        .shift();
};

export const animationRunning = (state: GameState): boolean => 
    state.cards.filter((c) => c.animating === true).length > 0;
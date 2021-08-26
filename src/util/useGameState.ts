import { useEffect, Dispatch } from 'react'
import { useImmerReducer } from 'use-immer';
import { reducer, initialState, getCenter, getRoundWinner, GameState, Action, Actions, animationRunning, getGameWinner } from '../types/GameState';
import { Phase } from '../types/Turn';
import { HumanStrategy, BotStrategy } from '../types/Player';
import usePositions, { DefaultPositions } from './usePositions';

const useGameState = (): { state: GameState, dispatch: Dispatch<Action>, positions: DefaultPositions } => {
    const [state, dispatch] = useImmerReducer(reducer, initialState);
    const positions = usePositions();

    // Try to save/load the state from localstorage
    useEffect(() => {
        // Try to pull state from localstorage and only populate if we don't already have a state in memory
        const gameData = window.localStorage.getItem('gameData')
        if (gameData !== null && state === initialState) {
            dispatch({ type: Actions.LoadGame, payload: JSON.parse(gameData, (key, value) => {
                if (key === 'strategy') {
                    return value === 'HumanStrategy' ? new HumanStrategy() : new BotStrategy();
                }

                return value;
            })});
        }

        // Save state to localstorage if we have a state to save
        if (state !== initialState) {
            window.localStorage.setItem('gameData', JSON.stringify(state, (key, value) => {
                if (key === 'strategy') {
                    return value.timeout === undefined ? 'HumanStrategy' : 'BotStrategy';
                }

                return value;
            }));
        }
    // eslint-disable-next-line
    }, [state]);

    // Update bots whenever state changes
    useEffect(() => {
        // No bot actions before/after the game/round starts or if there are active animations
        if (state === initialState 
            || state.paused
            || [Phase.Pregame, Phase.Preround, Phase.Postgame].includes(state.turn.phase) 
            || animationRunning(state)
        ) {
            return;
        }

        // Check for a round win
        const roundWinner = getRoundWinner(state);
        if (typeof roundWinner !== 'undefined') {
            state.players.forEach((player) => player.strategy.cancelThoughts());

            // Check for a game win
            const gameWinner = getGameWinner(state);
            if (typeof gameWinner !== 'undefined') {
                dispatch({ type: Actions.WinGame, payload: { player: gameWinner }});
            } else {
                dispatch({ type: Actions.WinRound, payload: { player: roundWinner }});
            }

            return;
        }

        const center = getCenter(state);
        let centerChanged = false;
        if (center && center.visible && center.id !== state.previousCenter) {
            centerChanged = true;
        }

        // Only allow a bot to play a card when the center card changes or when it's their turn
        state.players.forEach((player) => {
            if (state.turn.player === player.seat || centerChanged) {
                player.strategy.onCardPlayed(player, state, dispatch)
            }
        });

        // Only discard when you need to discard
        state.players.forEach((player) => player.strategy.onDiscardNeeded(player, state, dispatch));
    // eslint-disable-next-line
    }, [state]);

    useEffect(() => {
        dispatch({ type: Actions.Resize, payload: positions });
    // eslint-disable-next-line
    }, [positions]);

    return {
        state,
        dispatch,
        positions,
    };
}

export default useGameState;

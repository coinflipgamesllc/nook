import React, { Dispatch, FC } from 'react';
import { GameState, Actions, Action, getGameWinner } from '../types/GameState';

import './OffBoarding.scss';

interface OffBoardingProps {
    state: GameState;
    dispatch: Dispatch<Action>;
}

const OffBoarding: FC<OffBoardingProps> = ({ state, dispatch }) => {
    const winner = getGameWinner(state) as number;

    return (
        <div className="offboarding">
            <h1>{state.players[winner].name} win{winner === 0 ? '' : 's'}!</h1>
            <p>Thanks for playing nook!</p>

            <button 
                onClick={() => dispatch({ type: Actions.StartGame, payload: { numHumans: 1, numBots: 3 }})}
            >
                Play Again?
            </button>
        </div>
    )
}

export default OffBoarding

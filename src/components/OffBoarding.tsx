import React, { Dispatch, FC } from 'react';
import { GameState, Actions, Action } from '../types/GameState';

import './OffBoarding.scss';

interface OffBoardingProps {
    state: GameState;
    dispatch: Dispatch<Action>;
}

const OffBoarding: FC<OffBoardingProps> = ({ state, dispatch }) => {
    return (
        <div className="offboarding">
            <h1>{state.players[state.turn.player].name} wins!</h1>
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

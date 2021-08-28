import React, { Dispatch, FC } from 'react';
import { GameState, Actions, Action, getGameWinner } from '../types/GameState';

import './OffBoarding.scss';

interface OffBoardingProps {
    state: GameState;
    dispatch: Dispatch<Action>;
}

const OffBoarding: FC<OffBoardingProps> = ({ state, dispatch }) => {
    const winner = getGameWinner(state) || 0;

    return (
        <div className="offboarding">
            <h1>{state.players[winner].name} win{winner === 0 ? '' : 's'}!</h1>
            <p>Thanks for playing nook!</p>
            <p>
                Please fill out this&nbsp;
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfelrfR0elf49pKwpVmCrPzMz5f5rcwJd3TKnu13Rfc4Ajm_w/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">survey</a>
                &nbsp;with your thoughts on the game. I really appreciate it!
            </p>

            <p>
                <button
                    onClick={() => dispatch({ type: Actions.StartGame, payload: { numHumans: 1, numBots: 3 } })}
                >
                    Play Again?
                </button>
            </p>
        </div>
    )
}

export default OffBoarding

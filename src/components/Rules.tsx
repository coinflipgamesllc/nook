import React, { Dispatch, FC, useState, Fragment } from 'react';
import { Actions, Action } from '../types/GameState';

import './Rules.scss';

import title from '../img/title.png';
import matching from '../img/rules-matching.png';
import discards from '../img/rules-discards.png';
import perfect from '../img/rules-perfect-match.png';

interface RulesProps {
    dispatch: Dispatch<Action>;
    resume: boolean;
}

const Rules: FC<RulesProps> = ({ dispatch, resume }) => {
    const [page, setPage] = useState(0);

    let instructions = <Fragment />
    switch (page) {
        case 0:
        instructions = (
            <Fragment>
                <p>
                    Compete with your fellow interior designers to suggest ideas for how this nook should look.
                </p>
                <img src={title} alt="Nook title" />
            </Fragment>
        );
        break;

        case 1:
        instructions = (
            <Fragment>
                <p>
                    Play cards from your hand to create matches with the card in the center.
                </p>
                <img src={matching} alt="Rules on matching" />
            </Fragment>
        );
        break;

        case 2:
        instructions = (
            <Fragment>
                <p>
                    The better the match, the more cards you can discard. Discard your hand first to win the round.
                </p>
                <img src={discards} alt="Rules on discarding" />
            </Fragment>
        );
        break;

        case 3:
        instructions = (
            <Fragment>
                <p>
                    You can also play a perfect match at any time &mdash; even when it's not your turn. It will become your turn instantly!
                </p>
                <img src={perfect} alt="Rules on perfect matches" />
            </Fragment>
        );
        break;

        case 4:
        instructions = (
            <Fragment>
                <p>
                    Be the first designer to empty your hand and you'll win the round! Win 3 rounds and you'll win the game. Good Luck!
                </p>
            </Fragment>
        );
        break;
    }

    return (
        <div className="rules">
            <h1>nook</h1>

            <div className="instructions-box">
                {instructions}
                
                <div className="instruction-page-buttons">
                    <button 
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                    >&larr;</button>

                    <button 
                        onClick={() => setPage(page + 1)}
                        disabled={page === 4}
                    >&rarr;</button>
                </div>
            </div>

            <button 
                className={page === 4 ? 'highlight' : ''}
                onClick={() => {
                    resume
                        ? dispatch({ type: Actions.ResumeGame, payload: null })
                        : dispatch({ type: Actions.StartGame, payload: { numHumans: 1, numBots: 3 }});
                }}
            >
                {resume ? 'Resume' : 'Start'} Game
            </button>
        </div>
    )
}

export default Rules

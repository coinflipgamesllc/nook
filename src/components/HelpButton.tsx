import React, { FC, Dispatch, Fragment } from 'react';
import { Action, Actions } from '../types/GameState';

import Rules from './Rules';

import './HelpButton.scss';

type HelpButtonProps = {
    dispatch: Dispatch<Action>,
    paused: boolean,
};

const HelpButton: FC<HelpButtonProps> = ({ dispatch, paused }) => {

    return ( 
        <Fragment>
            {paused && <Rules dispatch={dispatch} resume={true} />}
            <button 
                className="help-button" 
                onClick={() => {
                    paused
                        ? dispatch({ type: Actions.ResumeGame, payload: null })
                        : dispatch({ type: Actions.PauseGame, payload: null });
                }}>&#8264;</button>
        </Fragment>
    )
};

export default HelpButton;

import React, { FC, CSSProperties, Dispatch, useEffect } from 'react';
import { Action, Actions } from '../types/GameState';
import { Card as CardModel } from '../types/Card';
import { Turn, Phase } from '../types/Turn';

import './Card.scss'

type CardProps = CardModel & {
    dispatch: Dispatch<Action>;
    turn: Turn;
    index: number;
}

const Card: FC<CardProps> = ({ index, id, color, wallpaper, decoration, visible, location, pos, owner, dispatch, turn, animating }) => {
    useEffect(() => {
        if (animating === true) {
            setTimeout(() => dispatch({ type: Actions.FinishAnimation, payload: { id }}), 1000);
        }
    // eslint-disable-next-line
    }, [id, animating, location])

    const image = visible
        ? `url(/img/${color}_${wallpaper}_${decoration}.png)`
        : `url(/img/cardback.png)`;

    let style: CSSProperties = {
        backgroundImage: image,
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        zIndex: index,
    };

    return (
        <div
            id={`card${id}`}
            className={`card ${visible ? 'front' : 'back'} ${location} ${owner ? `p${owner}` : ''}`}
            style={style}
            onClick={() => {
                // Only human playable cards
                if (owner === 0) {
                    if (turn.player === 0 && turn.phase === Phase.Play) {
                        // On turn
                        dispatch({ type: Actions.PlayCard, payload: { id, player: 0 }})
                    } else if (turn.player !== 0 && [Phase.Think, Phase.Play].includes(turn.phase)) {
                        // Off turn perfect match
                        dispatch({ type: Actions.PlayCard, payload: { id, player: 0 }})
                    } else if (turn.player === 0 && turn.phase === Phase.Discard) {
                        // Discard
                        dispatch({ type: Actions.DiscardCard, payload: { id, player: 0 }})
                    }
                }
            }}
        />
    )
}

export default Card;

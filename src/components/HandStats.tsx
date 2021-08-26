import React, { FC, Fragment } from 'react';
import { GameState } from '../types/GameState';
import { Location } from '../types/Location';
import { Phase } from '../types/Turn';

import './HandStats.scss';


type HandStatsProps = GameState & {
    seat: number;
};

const HandStats: FC<HandStatsProps> = ({ cards, players, turn, seat, positions }) => {
    if ([Phase.Pregame].includes(turn.phase)) {
        return <Fragment />;
    }

    const handSize = cards.filter((c) => c.owner === seat && c.location === Location.Hand).length;
    const wins = cards.filter((c) => c.owner === seat && c.location === Location.Win).length;
    const isAfterFirstRound = cards.filter((c) => c.location === Location.Deck).length !== cards.length;

    let icon = <Fragment />;
    if (turn.player === seat && turn.phase === Phase.Think) {
        icon = <span className="icon">🤔</span>;
    } else if (turn.phase === Phase.Preround && isAfterFirstRound && seat !== 0) {
        if (turn.player === seat) {
            icon = <span className="icon">😁</span>;
        } else {
            icon = <span className="icon">😒</span>;
        }
    }

    const style = {
        top: `${positions.players[seat].y + 200}px`, 
        left: `${positions.players[seat].x - 100}px`,
    }

    return (
        <div className={`hand-stats ${turn.player === seat ? 'highlight' : ''}`} style={style}>
            <span className="bold">{players[seat].name}</span>
            <span>Hand: {handSize}</span>
            <span>Wins: {wins}</span>
            {icon}
        </div>
    )
};

export default HandStats;

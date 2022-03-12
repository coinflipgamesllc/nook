import React, { FC, Dispatch, Fragment } from "react";
import { GameState, Action, Actions } from "../types/GameState";
import { Phase } from "../types/Turn";

import "./TurnTracker.scss";

type TurnTrackerProps = GameState & {
  dispatch: Dispatch<Action>;
};

const TurnTracker: FC<TurnTrackerProps> = ({
  players,
  turn,
  dispatch,
  positions,
}) => {
  return (
    <div className={`turn-tracker ${turn.phase}`}>
      {turn.phase === Phase.Preround ? (
        <button onClick={() => dispatch({ type: Actions.Deal, payload: null })}>
          Deal
        </button>
      ) : (
        <Fragment />
      )}

      {turn.phase === Phase.Wait ? (
        <button
          onClick={() => dispatch({ type: Actions.StartRound, payload: null })}
        >
          Ready?
        </button>
      ) : (
        <Fragment />
      )}

      {[Phase.Play, Phase.Discard, Phase.Think].includes(turn.phase) ? (
        <Fragment>
          <span>
            {turn.player === 0 ? "Your" : `${players[turn.player].name}'s`} Turn
          </span>
          <span>
            (
            {turn.player === 0
              ? `${turn.phase} ${
                  players[turn.player].toDiscard > 0
                    ? `${players[turn.player].toDiscard} `
                    : "a "
                }card${players[turn.player].toDiscard > 1 ? "s" : ""}`
              : `${turn.phase}ing...`}
            )
          </span>
        </Fragment>
      ) : (
        <Fragment />
      )}
    </div>
  );
};

export default TurnTracker;

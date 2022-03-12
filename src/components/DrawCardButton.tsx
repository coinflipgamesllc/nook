import React, { FC, Dispatch, Fragment, CSSProperties } from "react";
import { GameState, Action, Actions } from "../types/GameState";
import { Position } from "../types/Position";
import { Phase } from "../types/Turn";

type DrawCardButtonProps = GameState & {
  dispatch: Dispatch<Action>;
  pos: Position;
};

const DrawCardButton: FC<DrawCardButtonProps> = ({ turn, dispatch, pos }) => {
  const style: CSSProperties = {
    position: "relative",
    top: `${pos.y + 110}px`,
    left: `${pos.x}px`,
    zIndex: 999,
  };

  return turn.player === 0 && turn.phase === Phase.Play ? (
    <button
      style={style}
      onClick={() => dispatch({ type: Actions.Draw, payload: { player: 0 } })}
    >
      Draw
    </button>
  ) : (
    <Fragment />
  );
};

export default DrawCardButton;

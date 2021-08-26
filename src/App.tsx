import React, { useMemo, Fragment } from 'react';
import { Phase } from './types/Turn';
import { getLocationSortOrder } from './types/Location';
import useGameState from './util/useGameState';

import Card from './components/Card';
import Rules from './components/Rules';
import TurnTracker from './components/TurnTracker';
import HandStats from './components/HandStats';
import HelpButton from './components/HelpButton';
import DrawCardButton from './components/DrawCardButton';
import OffBoarding from './components/OffBoarding';

import './App.scss'


function App() {
  const { state, dispatch, positions } = useGameState();

  const cards = useMemo(() => 
    state.cards.map((c) => ({ c, sort: getLocationSortOrder(c.location) + (c.owner ? c.owner : 0) })),
    [state.cards]
  );

  if (state.turn.phase === Phase.Pregame) {
    return <Rules dispatch={dispatch} resume={false} />
  }

  if (state.turn.phase === Phase.Postgame) {
    return <OffBoarding state={state} dispatch={dispatch} />
  }

  return (
    <div className="App">
      {!state.paused && (
        <Fragment>
          <TurnTracker {...state} dispatch={dispatch} />

          {state.players.map((p, i) => (
            <HandStats key={`hand-${i}`} {...state} seat={p.seat} />
          ))}

          {cards.map(({ c, sort }) => (
            <Card
              key={c.id}
              {...c}
              index={state.center === c.id ? 200 : (state.previousCenter === c.id ? 100 : sort)}
              dispatch={dispatch}
              turn={state.turn}
            />
          ))}

          <DrawCardButton {...state} dispatch={dispatch} pos={positions.deck} />
        </Fragment>
      )}

      <HelpButton dispatch={dispatch} paused={state.paused} />
    </div>
  )
}

export default App

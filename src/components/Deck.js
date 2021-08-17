import Card from './Card'

import './Deck.scss'

const cardStyles = {
    'draw-pile': (i, len) => ({ transform: `translate(-${i / 10}px, -${i / 4}px)` }),
    'center': (i, len) => ({}),
    'discard-pile': (i, len) => ({ transform: `translate(-${i / 10}px, -${i / 4}px)` }),
    'hand': (i, len) => ({ transform: `translateX(${i * 60}%) rotate(${i - 5}deg)` }),
    'cpu-1': (i, len) => ({ transform: `translateX(${i * 12}%) rotate(${i - 5}deg)` }),
    'cpu-2': (i, len) => ({ transform: `translateX(${i * 12}%) rotate(${i - 5}deg)` }),
}

const Deck = ({ cards, location, label, actions = [], cardsVisible = false, state, playCard = () => {}, discardCard = () => {}, playPerfectCard = () => {} }) => {
    return (
        <div className={`deck ${location}`}>
            {cards.map((card, i) => (
                <Card 
                    key={`c${i}`} 
                    {...card} 
                    location={location} 
                    visible={cardsVisible} 
                    playCard={() => playCard(i)}
                    discardCard={() => discardCard(i)}
                    playPerfectCard={() => playPerfectCard(i)}
                    style={cardStyles[location](i, cards.length)} 
                    state={state}
                />
            ))}

            <h1 className="label">{label}</h1>

            <div className="actions">
                {actions.map(({ label, func }) => (
                    <button key={label} onClick={func}>{label}</button>
                ))}
            </div>
        </div>
    )
}

export default Deck
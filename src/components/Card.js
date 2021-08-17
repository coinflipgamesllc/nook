import './Card.scss'
import { perfectMatch } from '../util/card';

const Card = ({ color, wallpaper, decoration, location, style, visible, state, playCard, discardCard, playPerfectCard }) => {
    const image = visible
        ? `url(/img/${color}_${wallpaper}_${decoration}.png)`
        : `url(/img/cardback.png)`

    let playable = false
    let action = () => {}
    
    // Your turn to play a card
    if (state.turn === 0 && state.phase === 'play') {
        action = playCard
        playable = true
    // Your turn to discard a card
    } else if (state.turn === 0 && state.phase === 'discard') {
        action = discardCard
        playable = true
    } else if (state.phase === 'think' && perfectMatch({ color, wallpaper, decoration }, state)) {
        if (location === 'hand') {
            console.log(`${color}/${wallpaper}/${decoration} is a perfect match!`)
            console.log(playPerfectCard)
        }
        action = playPerfectCard
        playable = true
    }

    return (
        <div 
            className={`card ${location} ${playable ? 'playable' : ''}`} 
            style={{
                backgroundImage: image,
                ...style
            }}
            onClick={action}
        />
    )
}

export default Card

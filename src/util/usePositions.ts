import { useState, useEffect } from "react";
import { Position } from '../types/Position';

interface Size {
    width: number;
    height: number;
}

export type DefaultPositions = {
    deck: Position;
    center: Position;
    discard: Position;
    win: Position;
    players: Position[];
};

export function calculatePositions(size: Size): DefaultPositions {
    return {
        deck: {
            x: size.width / 3 - 225, 
            y: size.height / 3 + 50,
        },
        center: {
            x: (size.width / 2) - 100,
            y: size.height / 3 + 25,
        },
        discard: {
            x: (size.width / 3) * 2, 
            y: size.height / 3 + 50,
        },
        win: { x: -1000, y: -1000},
        players: [{
            x: (size.width / 2) - 25,
            y: size.height - 300,
        }, {
            x: (size.width / 3) - (size.width / 5),
            y: 10,
        }, {
            x: (size.width / 3) * 2 - (size.width / 5),
            y: 10,
        }, {
            x: (size.width / 3) * 3 - (size.width / 5),
            y: 10,
        }, {
            x: (size.width / 3) * 4 - (size.width / 5),
            y: 10,
        }],
    };
}

function usePositions(): DefaultPositions {
    const [windowSize, setWindowSize] = useState<Size>({
        width: 0,
        height: 0,
    });
    const [positions, setPositions] = useState<DefaultPositions>(calculatePositions(windowSize));

    // Add resize handle on mount
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Calculate our positions whenever the window size changes
    useEffect(() => {
        setPositions(calculatePositions(windowSize));
    }, [windowSize]);

    return positions;
}

export default usePositions;

import React from "react"
import LineTo from "react-lineto"
import { store } from "./state.js"
import { randomFromSeed, randomRgbFromSeed } from "./random.js"

export type SegmentsProps = {}

const errorRed = "rgb(255, 0, 0)"

export const Segments = ({}: SegmentsProps) => {
    const { path, isValid } = store.useQuery({
        path: true,
        isValid: true,
    })
    const segments = path.reduce((segments, position, index) => {
        if (index === path.length - 1) {
            return segments
        }
        // Deterministically generate a "random" color based on
        // index and positions
        const color = randomRgbFromSeed([index, position, path[index + 1]])
        return [
            ...segments,
            <LineTo
                key={index}
                from={position}
                to={path[index + 1]}
                borderWidth={5}
                borderColor={isValid ? color : errorRed}
            />,
        ]
    }, [] as JSX.Element[])
    return <>{segments}</>
}

import React from "react"
import LineTo from "react-lineto"
import { store } from "./state.js"
import { colorForPosition } from "./LetterGrid.js"
import { Letter } from "./dictionary.js"

export type SegmentsProps = {}

const errorRed = "rgb(255, 0, 0)"

export const Segments = ({}: SegmentsProps) => {
    const { path, isValid, input } = store.useQuery({
        path: true,
        input: true,
        isValid: true,
    })
    const segments = path.reduce((segments, position, index) => {
        if (index === path.length - 1) {
            return segments
        }
        const nextPosition = path[index + 1]
        const { red, green, blue } = colorForPosition(
            position,
            input.at(index) as Letter,
            path
        )
        const {
            red: nextRed,
            green: nextGreen,
            blue: nextBlue,
        } = colorForPosition(nextPosition, input.at(index + 1) as Letter, path)
        const averageColorOfConnectedPositions = `rgb(${(red + nextRed) / 2}, ${
            (green + nextGreen) / 2
        }, ${(blue + nextBlue) / 2})`
        return [
            ...segments,
            <LineTo
                key={index}
                from={position}
                to={nextPosition}
                borderWidth={5}
                borderColor={
                    isValid ? averageColorOfConnectedPositions : errorRed
                }
            />,
        ]
    }, [] as JSX.Element[])
    return <>{segments}</>
}

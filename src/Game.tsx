import React from "react"
import { LetterGrid } from "./LetterGrid"
import { Column } from "@re-do/components"
import { WordInput } from "./WordInput"
import { Segments } from "./Segments.js"

export type GameProps = {}

export const Game = ({}: GameProps) => {
    return (
        <Column justify="center" align="center">
            <LetterGrid />
            <Segments />
            <WordInput />
        </Column>
    )
}

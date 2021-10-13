import React, { useState } from "react"
import { Row, Column, Text, TextInput, ErrorText } from "@re-do/components"
import { isWord, getScore } from "./dictionary.js"
import {
    LetterPosition,
    randomInRange,
    LetterAnalysis,
} from "./generateLetterGrid.js"
import { Segments, store } from "./state"
import LineTo from "react-lineto"
import { transform } from "@re-do/utils"

const getValidPaths = (
    input: string,
    { positions: letterMap, adjacencies: adjacencyMap }: LetterAnalysis
) => {
    const result = {
        isValid: false,
        lastValidPath: undefined as undefined | LetterPosition[],
        validPaths: [] as LetterPosition[][],
    }
    if (!input) {
        return result
    }
    if (!letterMap[input[0]]) {
        return result
    }
    result.validPaths = letterMap[input[0]].map((position) => [position])
    input
        .substring(1)
        .split("")
        .forEach((char) => {
            const nextValidPaths: LetterPosition[][] = []
            result.validPaths.forEach((path) => {
                const nextValidPositions =
                    adjacencyMap[path[path.length - 1]].adjacent[char]
                if (nextValidPositions) {
                    nextValidPositions.forEach((position) =>
                        nextValidPaths.push([...path, position])
                    )
                }
            })
            if (nextValidPaths.length) {
                result.lastValidPath = nextValidPaths[0]
                result.isValid = true
            } else {
                result.isValid = false
            }
            result.validPaths = nextValidPaths
        })
    return result
}

export const getSegments = (
    isValid: boolean,
    lastValidPath: LetterPosition[] | undefined,
    previousSegments: Segments | undefined
) => {
    if (lastValidPath && lastValidPath.length > 1) {
        if (isValid) {
            return lastValidPath!.reduce(
                (colors, position, index, positions) => {
                    if (!index) {
                        return colors
                    }
                    const segmentName = `${
                        positions[index - 1]
                    }:${position}` as const
                    return {
                        ...colors,
                        [segmentName]:
                            previousSegments &&
                            segmentName in previousSegments &&
                            previousSegments[segmentName] !== errorRed
                                ? previousSegments[segmentName]
                                : // Random color that should be dark enough to see
                                  `rgb(${randomInRange(
                                      55,
                                      255
                                  )}, ${randomInRange(
                                      55,
                                      255
                                  )}, ${randomInRange(55, 255)})`,
                    }
                },
                {}
            )
        } else {
            return lastValidPath.reduce(
                (colors, position, index, positions) =>
                    index > 0
                        ? {
                              ...colors,
                              [`${positions[index - 1]}:${position}`]: errorRed,
                          }
                        : colors,
                {}
            )
        }
    }
    return {}
}

const errorRed = "rgb(255, 0, 0)"

export const WordInput = () => {
    const { wordsFound } = store.useQuery({
        wordsFound: true,
    })
    // @ts-ignore
    const [segments] = store.useGet("segments")
    const [analysis] = store.useGet("analysis")
    const [state, setState] = useState({
        error: "",
        input: "",
        isValid: false,
    })
    const { input, error, isValid } = state
    const inputScore = getScore(input)
    const segmentColors = Object.values(segments)
    return (
        <Column align="center">
            <Row justify="center">
                <TextInput
                    value={input}
                    onChange={({ target }) => {
                        const { isValid: isValidAfterChange, lastValidPath } =
                            getValidPaths(target.value, analysis)
                        setState({
                            ...state,
                            isValid: isValidAfterChange,
                            input: target.value,
                        })
                        store.update({
                            segments: [
                                getSegments(
                                    isValidAfterChange,
                                    lastValidPath,
                                    segments
                                ),
                            ],
                        })
                    }}
                    onKeyPress={({ key }) => {
                        if (key === "Enter") {
                            if (!isValid) {
                                setState({
                                    ...state,
                                    error: "You can't spell that!",
                                })
                            } else if (input.length < 3) {
                                setState({
                                    ...state,
                                    error: "3+ letters. I believe in you.",
                                })
                            } else if (wordsFound.includes(input)) {
                                setState({
                                    ...state,
                                    error: "You already found that!",
                                })
                            } else if (!isWord(input)) {
                                setState({
                                    ...state,
                                    error: "I don't think that's a word...",
                                })
                            } else {
                                store.update({
                                    wordsFound: (_) => [..._, input],
                                    score: (_) => _ + inputScore,
                                    segments: [{}],
                                })
                                setState({
                                    ...state,
                                    input: "",
                                    error: "",
                                    isValid: false,
                                })
                            }
                        }
                    }}
                />
                <Text
                    style={{ color: segmentColors[segmentColors.length - 1] }}
                >
                    +{inputScore}
                </Text>
            </Row>
            {error ? <ErrorText>{error}</ErrorText> : null}
            {segments
                ? transform(
                      segments,
                      ([segmentName, color], index) => [
                          index,
                          <LineTo
                              key={index}
                              from={segmentName.split(":")[0]}
                              to={segmentName.split(":")[1]}
                              borderWidth={5}
                              borderColor={color}
                          />,
                      ],
                      { asValueArray: true }
                  )
                : null}
        </Column>
    )
}

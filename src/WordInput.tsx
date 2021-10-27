import React, { useState } from "react"
import {
    Row,
    Column,
    Text,
    TextInput,
    ErrorText,
    Button,
} from "@re-do/components"
import { getScore } from "./dictionary.js"
import { isMobile, store } from "./state"
import BackIcon from "@material-ui/icons/KeyboardBackspace"
import EnterIcon from "@material-ui/icons/Check"
import ClearIcon from "@material-ui/icons/Clear"
import { getValidPaths } from "./getValidPaths.js"
import { randomRgbStringFromSeed } from "./random.js"
import { pathToWord } from "./generateGrid.js"

export const WordInput = () => {
    const { input, error, hintPath } = store.useQuery({
        input: true,
        error: true,
        hintPath: true,
    })
    const inputScore = getScore(input)
    // @ts-ignore
    const analysis = store.useGet("analysis")[0]
    const hintPrefix = pathToWord(hintPath, analysis)
    const revertToHint = () => {
        store.update({
            path: hintPath,
            input: hintPrefix,
            errors: "",
            isValid: true,
        })
    }
    return (
        <Column align="center">
            <Row justify="center">
                <TextInput
                    value={input}
                    onChange={({ target }) => {
                        const updatedInput = target.value.toLowerCase()
                        if (!updatedInput.startsWith(hintPrefix)) {
                            revertToHint()
                        } else {
                            const { isValid, lastValidPath } = getValidPaths(
                                updatedInput,
                                analysis
                            )
                            store.update({
                                path: lastValidPath,
                                input: updatedInput,
                                errors: "",
                                isValid,
                            })
                        }
                    }}
                    kind="underlined"
                    onKeyPress={({ key }) => {
                        if (key === "Enter") {
                            store.$.submitInput(input)
                        }
                    }}
                />
                <Text
                    style={{
                        color: randomRgbStringFromSeed(inputScore),
                    }}
                >
                    +{inputScore}
                </Text>
                {isMobile ? (
                    <>
                        <Button
                            Icon={BackIcon}
                            style={{ marginRight: 8 }}
                            onClick={() => {
                                if (input.length > hintPath.length) {
                                    const updatedInput = input.slice(0, -1)
                                    const { isValid, lastValidPath } =
                                        getValidPaths(updatedInput, analysis)
                                    store.update({
                                        path: lastValidPath,
                                        input: updatedInput,
                                        errors: "",
                                        isValid,
                                    })
                                }
                            }}
                        />

                        <Button Icon={ClearIcon} onClick={revertToHint} />

                        <Button
                            style={{ marginLeft: 8 }}
                            Icon={EnterIcon}
                            onClick={() => store.$.submitInput()}
                        />
                    </>
                ) : null}
            </Row>
            {error ? <ErrorText>{error}</ErrorText> : null}
        </Column>
    )
}

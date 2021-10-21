import React, { useState } from "react"
import {
    Row,
    Column,
    Text,
    TextInput,
    ErrorText,
    Button,
} from "@re-do/components"
import { isWord, getScore } from "./dictionary.js"
import { isMobile, store } from "./state"
import BackIcon from "@material-ui/icons/KeyboardBackspace"
import EnterIcon from "@material-ui/icons/Check"
import ClearIcon from "@material-ui/icons/Clear"
import { isEmpty } from "@re-do/utils"
import { getValidPaths } from "./getValidPaths.js"
import { randomRgbFromSeed } from "./random.js"

export const WordInput = () => {
    const { input, error, hint } = store.useQuery({
        input: true,
        error: true,
        hint: true,
    })
    const inputScore = getScore(input)
    // @ts-ignore
    const analysis = store.useGet("analysis")[0]
    return (
        <Column align="center">
            <Row justify="center">
                <TextInput
                    value={input}
                    onChange={({ target }) => {
                        const updatedInput = target.value.toLowerCase()
                        const validatedInput = updatedInput.startsWith(hint)
                            ? updatedInput
                            : hint

                        const { isValid, lastValidPath } = getValidPaths(
                            validatedInput,
                            analysis
                        )
                        store.update({
                            path: lastValidPath,
                            input: validatedInput,
                            errors: "",
                            isValid,
                        })
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
                        color: randomRgbFromSeed(inputScore),
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
                                if (input.length > hint.length) {
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

                        <Button
                            Icon={ClearIcon}
                            onClick={() => {
                                const { lastValidPath } = getValidPaths(
                                    hint,
                                    analysis
                                )
                                store.update({
                                    path: lastValidPath,
                                    input: hint,
                                    errors: "",
                                    isValid: true,
                                })
                            }}
                        />

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

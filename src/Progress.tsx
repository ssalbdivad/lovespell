import React from "react"
import { FreeSearchProgress } from "./freesearch"
import { PangramProgress } from "./pangram"
import { store } from "./state.js"

export type ProgressProps = {}

export const Progress = ({}: ProgressProps) => {
    const { mode } = store.useQuery({ mode: true })
    if (mode === "freesearch") {
        return <FreeSearchProgress />
    } else if (mode === "pangram") {
        return <PangramProgress />
    }
    throw new Error("Unknown mode.")
}

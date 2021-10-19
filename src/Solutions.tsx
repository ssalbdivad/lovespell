import React from "react"
import { FreeSearchSolutions } from "./freesearch"
import { PangramSolutions } from "./pangram"
import { store } from "./state.js"

export type SolutionsProps = {}

export const Solutions = ({}: SolutionsProps) => {
    const { mode } = store.useQuery({ mode: true })
    if (mode === "freesearch") {
        return <FreeSearchSolutions />
    } else if (mode === "pangram") {
        return <PangramSolutions />
    }
    throw new Error("Unknown mode.")
}

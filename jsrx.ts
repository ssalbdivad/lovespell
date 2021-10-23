import { jsrx, shell } from "jsrx"
import { createServer, build, UserConfig } from "vite"
import { getWebConfig } from "@re-do/configs"
import { fromHere } from "@re-do/node-utils"
import { cpSync, readFileSync, writeFileSync } from "fs"
// import { buildSortedDictionary, buildWordsTrie } from "./src/dictionary"

const pkgRoot = fromHere("src")

type GetConfigArgs = {
    watch?: boolean
}

const getWebsiteConfig = ({ watch = false }: GetConfigArgs = {}) =>
    getWebConfig({
        srcDir: pkgRoot,
        outDir: fromHere("docs"),
        watch,
        options: {
            build: {
                sourcemap: false,
            },
            server: {
                port: Number(process.env.VITE_DEV_SERVER_PORT),
            },
        },
    }) as UserConfig

const start = async () => {
    const viteDevServer = await createServer(getWebsiteConfig({ watch: true }))
    await viteDevServer.listen()
}

jsrx(
    {
        dev: {
            start,
            generateSortedDictionary: async () => {
                // writeFileSync(
                //     fromHere("src", "sortedDictionary.json"),
                //     JSON.stringify(await buildSortedDictionary())
                // )
            },
            generateWordsTrie: async () => {
                // writeFileSync(
                //     fromHere("src", "dictionaryTrie.json"),
                //     JSON.stringify(await buildSortedDictionary())
                // )
            },
        },
        prod: {
            build: async () => {
                shell("tsc --noEmit")
                await build(getWebsiteConfig())
                cpSync("CNAME", "docs/CNAME")
                const indexHtmlWithRelativePaths = readFileSync(
                    "docs/index.html"
                )
                    .toString()
                    .replace(/\/assets/g, "./assets")
                    .replace(/\/index/g, "./index")
                writeFileSync("docs/index.html", indexHtmlWithRelativePaths)
            },
        },
    },
    {
        excludeOthers: true,
    }
)

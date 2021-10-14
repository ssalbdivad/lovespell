import { jsrx, shell } from "jsrx"
import { createServer, build, UserConfig } from "vite"
import { getWebConfig } from "@re-do/configs"
import { fromHere } from "@re-do/node-utils"
import { join } from "path"

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
        },
        prod: {
            build: async () => {
                shell("tsc --noEmit")
                await build(getWebsiteConfig())
            },
        },
    },
    {
        excludeOthers: true,
    }
)

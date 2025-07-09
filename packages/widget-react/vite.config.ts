/* eslint-disable no-console */
import fs from "fs"
import path from "path"
import type { Plugin } from "vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import dts from "vite-plugin-dts"

function emitCssAsJsString(): Plugin {
  return {
    name: "emit-css-as-js-string",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist")
      const cssPath = path.join(outDir, "styles.css")
      const jsPath = path.join(outDir, "styles.js")
      const dtsPath = path.join(outDir, "styles.d.ts")

      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, "utf-8")
        const jsModule = `export default ${JSON.stringify(cssContent)};`
        fs.writeFileSync(jsPath, jsModule)
        console.log("✅ Generated styles.js")
        const dtsContent = "declare const styles: string\nexport default styles\n"
        fs.writeFileSync(dtsPath, dtsContent)
        console.log("✅ Generated styles.d.ts")
      } else {
        console.error("❌ styles.css not found.")
      }
    },
  }
}

function patchPeerDepsImportsPlugin(): Plugin {
  const prefixesToFix = [
    "@cosmjs/amino/build/signdoc",
    "@initia/opinit.proto/opinit/ophost/v1/tx",
    "cosmjs-types",
    "react-use/lib/",
  ]

  return {
    name: "patch-peer-deps-imports",
    renderChunk(code) {
      const importRegex = /(from\s+["'])([^"']+)(["'])/g
      const fixedCode = code.replaceAll(importRegex, (match, p1, p2, p3) => {
        // p1 = from '
        // p2 = the actual path (e.g., cosmjs-types/cosmos/tx/v1beta1/tx)
        // p3 = '

        // Check if the import path starts with one of our prefixes
        // and doesn't already have a file extension.
        if (prefixesToFix.some((prefix) => p2.startsWith(prefix)) && !path.extname(p2)) {
          return `${p1}${p2}.js${p3}`
        }

        // Otherwise, return the original import statement unchanged.
        return match
      })

      return {
        code: fixedCode,
        map: null,
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      dts({ rollupTypes: mode !== "fast" }),
      react(),
      patchPeerDepsImportsPlugin(),
      emitCssAsJsString(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        formats: ["es"],
        fileName: "index",
        cssFileName: "styles",
      },
      rollupOptions: {
        external: (id) => !(id.startsWith(".") || id.startsWith("/") || id.startsWith("@/")),
      },
    },
  }
})

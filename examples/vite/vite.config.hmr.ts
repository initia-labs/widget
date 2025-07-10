import path from "path"
import { mergeConfig } from "vite"
import baseConfig from "./vite.config"

const packagePath = path.resolve(__dirname, "../../packages/interwovenkit-react")

export default mergeConfig(baseConfig, {
  resolve: {
    alias: {
      "@initia/widget-react/styles.css?inline": path.resolve(packagePath, "dist/styles.css?inline"),
      "@initia/widget-react/styles.css": path.resolve(packagePath, "dist/styles.css"),
      "@initia/widget-react": path.resolve(packagePath, "src"),
      "@": path.resolve(packagePath, "src"),
    },
  },
})

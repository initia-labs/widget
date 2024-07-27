import path from "path"
import { mergeConfig } from "vite"
import baseConfig from "./vite.config"

const widgetPath = path.resolve(__dirname, "../../packages/widget-react")

export default mergeConfig(baseConfig, {
  resolve: {
    alias: {
      "@initia/widget-react/styles.css?inline": path.resolve(widgetPath, "dist/styles.css?inline"),
      "@initia/widget-react/styles.css": path.resolve(widgetPath, "dist/styles.css"),
      "@initia/widget-react": path.resolve(widgetPath, "src"),
      "@": path.resolve(widgetPath, "src"),
    },
  },
})

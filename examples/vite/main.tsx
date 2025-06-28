import { createRoot } from "react-dom/client"
import "./index.css"
import Providers from "./src/Providers"
import App from "./src/App"

createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
  </Providers>,
)

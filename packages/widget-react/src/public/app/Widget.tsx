import { MemoryRouter } from "@/lib/router"
import AsyncBoundary from "@/components/AsyncBoundary"
import { fullscreenContext } from "./fullscreen"
import Routes from "./Routes"

const Widget = ({ bridge }: { bridge?: boolean }) => {
  return (
    <MemoryRouter initialEntry={{ path: bridge ? "/bridge" : "/" }}>
      <div className="body">
        <fullscreenContext.Provider value={!!bridge}>
          <AsyncBoundary>
            <Routes />
          </AsyncBoundary>
        </fullscreenContext.Provider>
      </div>
    </MemoryRouter>
  )
}

export default Widget

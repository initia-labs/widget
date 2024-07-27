import type { PropsWithChildren, ReactNode } from "react"
import { Suspense } from "react"
import type { FallbackProps } from "react-error-boundary"
import { ErrorBoundary } from "react-error-boundary"
import Status from "./Status"

interface Props {
  suspenseFallback?: ReactNode
  errorFallbackRender?: (props: FallbackProps) => ReactNode
}

const AsyncBoundary = ({
  suspenseFallback = <Status>Loading...</Status>,
  errorFallbackRender = ({ error }) => <Status error>{error.message}</Status>,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <ErrorBoundary fallbackRender={errorFallbackRender}>
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default AsyncBoundary

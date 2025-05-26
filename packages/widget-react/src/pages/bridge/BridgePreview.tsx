import { useState } from "react"
import type { TxJson } from "@skip-go/client"
import { useNavigate } from "@/lib/router"
import Page from "@/components/Page"
import Scrollable from "@/components/Scrollable"
import Video from "@/components/Video"
import Button from "@/components/Button"
import Footer from "@/components/Footer"
import FormHelp from "@/components/form/FormHelp"
import { useTrackTxQuery, useTxStatusQuery, useBridgePreviewState } from "./data/tx"
import BridgePreviewRoute from "./BridgePreviewRoute"
import FooterWithAddressList from "./FooterWithAddressList"
import FooterWithMsgs from "./FooterWithMsgs"
import FooterWithSignedOpHook from "./FooterWithSignedOpHook"
import FooterWithErc20Approval from "./FooterWithErc20Approval"
import BridgePreviewFooter from "./BridgePreviewFooter"
import styles from "./BridgePreview.module.css"

const BridgePreview = () => {
  const navigate = useNavigate()

  const state = useBridgePreviewState()
  const { values, route } = state

  const [txHash, setTxHash] = useState<string>()
  const { data: trackedTxHash, error: trackTxError } = useTrackTxQuery(txHash)
  const { data: txStatus } = useTxStatusQuery(values.srcChainId, trackedTxHash, route)

  const status = txStatus?.status
  const isCompleted = status === "STATE_COMPLETED"
  const isSuccess = txStatus?.state === "STATE_COMPLETED_SUCCESS"
  const error = txStatus?.error

  if (isCompleted) {
    return (
      <Scrollable>
        {isSuccess ? (
          <>
            <Video name="Success" />
            <h1 className={styles.title}>Transaction completed</h1>
          </>
        ) : (
          <>
            <Video name="Failure" />
            <h1 className={styles.title}>Transaction failed</h1>
          </>
        )}

        <FooterWithAddressList>
          {(addressList) => (
            <>
              <BridgePreviewRoute addressList={addressList} trackedTxHash={trackedTxHash} />

              <Footer extra={<FormHelp level="error">{error?.message}</FormHelp>}>
                <Button.White onClick={() => navigate("/bridge")}>Home</Button.White>
              </Footer>
            </>
          )}
        </FooterWithAddressList>
      </Scrollable>
    )
  }

  const renderFooter = (tx: TxJson) => {
    if (txStatus) {
      return (
        <Footer
          extra={
            <FormHelp level="info">
              It’s safe to leave this page. Your transaction will continue, and you can track its
              status later in History.
            </FormHelp>
          }
        >
          <Button.White loading="Fetching tx status..." />
        </Footer>
      )
    }

    if (txHash) {
      return (
        <Footer extra={<FormHelp level="error">{trackTxError?.message}</FormHelp>}>
          <Button.White loading="Tracking tx..." />
        </Footer>
      )
    }

    return <BridgePreviewFooter tx={tx} onTxCompleted={setTxHash} />
  }

  return (
    <Page title="Route preview">
      <FooterWithAddressList>
        {(addressList) => (
          <>
            <BridgePreviewRoute addressList={addressList} trackedTxHash={trackedTxHash} />

            <FooterWithSignedOpHook>
              {(signedOpHook) => (
                <FooterWithMsgs addressList={addressList} signedOpHook={signedOpHook}>
                  {(tx) => (
                    <FooterWithErc20Approval tx={tx}>{renderFooter(tx)}</FooterWithErc20Approval>
                  )}
                </FooterWithMsgs>
              )}
            </FooterWithSignedOpHook>
          </>
        )}
      </FooterWithAddressList>
    </Page>
  )
}

export default BridgePreview

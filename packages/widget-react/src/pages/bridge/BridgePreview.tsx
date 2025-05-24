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
  const { values, route, tx, txHash: trackingTxHash } = state

  const { data: trackedTxHash, error: trackTxError } = useTrackTxQuery()
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
            <p className={styles.title}>Transaction completed</p>
          </>
        ) : (
          <>
            <Video name="Failure" />
            <p className={styles.title}>Transaction failed</p>
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

    if (trackingTxHash) {
      return (
        <Footer extra={<FormHelp level="error">{trackTxError?.message}</FormHelp>}>
          <Button.White loading="Tracking tx..." />
        </Footer>
      )
    }

    return <BridgePreviewFooter tx={tx} />
  }

  return (
    <Page title="Preview route" onGoBack={trackingTxHash ? () => navigate("/bridge") : undefined}>
      <FooterWithAddressList>
        {(addressList) => (
          <>
            <BridgePreviewRoute addressList={addressList} trackedTxHash={trackedTxHash} />

            {tx ? (
              <FooterWithErc20Approval tx={tx}>{renderFooter(tx)}</FooterWithErc20Approval>
            ) : (
              <FooterWithSignedOpHook>
                {(signedOpHook) => (
                  <FooterWithMsgs addressList={addressList} signedOpHook={signedOpHook}>
                    {(tx) => (
                      <FooterWithErc20Approval tx={tx}>{renderFooter(tx)}</FooterWithErc20Approval>
                    )}
                  </FooterWithMsgs>
                )}
              </FooterWithSignedOpHook>
            )}
          </>
        )}
      </FooterWithAddressList>
    </Page>
  )
}

export default BridgePreview

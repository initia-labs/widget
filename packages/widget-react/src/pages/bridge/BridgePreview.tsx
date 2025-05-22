import type { TxJson } from "@skip-go/client"
import { useNavigate } from "@/lib/router"
import Page from "@/components/Page"
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

  const renderFooter = (tx: TxJson) => {
    if (txStatus) {
      const { status, state, error } = txStatus
      const isCompleted = status === "STATE_COMPLETED"
      const isSuccess = state === "STATE_COMPLETED_SUCCESS"

      return (
        <Footer
          extra={
            <FormHelp.Stack>
              {isSuccess ? null : error ? (
                <FormHelp level="error">{error.message}</FormHelp>
              ) : (
                <FormHelp level="info">
                  It’s safe to leave this page. Your transaction will continue, and you can track
                  its status later in History.
                </FormHelp>
              )}
            </FormHelp.Stack>
          }
        >
          <Button.White
            onClick={() => navigate("/bridge")}
            loading={!isCompleted && "Fetching tx status..."}
          >
            Home
          </Button.White>
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
            {txStatus?.state === "STATE_COMPLETED_SUCCESS" && (
              <>
                <Video name="Success" />
                <p className={styles.title}>Transaction completed</p>
              </>
            )}

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

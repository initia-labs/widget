import styles from "./Video.module.css"

const Video = ({ name, size = 52 }: { name: "Success" | "Failure"; size?: number }) => {
  return (
    <video
      className={styles.video}
      width={size}
      height={size}
      autoPlay
      playsInline
      muted
      preload="auto"
    >
      <source src={`https://assets.initia.xyz/videos/${name}.webm`} type="video/webm" />
    </video>
  )
}

export default Video

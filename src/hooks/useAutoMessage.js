import { useEffect } from "react"

export default function useAutoMessage(message, setMessage) {

  useEffect(() => {

    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
    }, 3000)

    return () => clearTimeout(timer)

  }, [message])

}
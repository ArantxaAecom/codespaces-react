import { useEffect } from "react"

/**
 * 
 * @param message - El texto del mensaje actual
 * @param setMessage - Función de React para actualizar el mensaje
 */
export default function useAutoMessage(message: string, setMessage: (value: string) => void) {

    useEffect(() => {

        if (!message) return

        const timer = setTimeout(() => {
            setMessage("")
        }, 3000)

        return () => clearTimeout(timer)

    }, [message])

}
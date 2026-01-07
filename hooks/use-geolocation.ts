import { useState, useEffect, useCallback } from "react"

interface GeolocationState {
    latitude: number | null
    longitude: number | null
    error: string | null
    loading: boolean
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true,
    })

    const request = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setState((prev) => ({
                ...prev,
                error: "Geolocation is not supported by your browser",
                loading: false,
            }))
            return
        }

        setState(prev => ({ ...prev, loading: true }))

        const handleSuccess = (position: GeolocationPosition) => {
            setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                error: null,
                loading: false,
            })
        }

        const handleError = (error: GeolocationPositionError) => {
            setState((prev) => ({
                ...prev,
                error: error.message,
                loading: false,
            }))
        }

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        })
    }, [])

    useEffect(() => {
        request()
    }, [request])

    return { ...state, request }
}

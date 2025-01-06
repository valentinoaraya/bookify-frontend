import { useState } from "react";
import { API_URL } from "../config.ts";

export const useFetchData = (url: string, method: string) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (body: any) => {
        setIsLoading(true);
        try {
            if (method === "GET") {
                console.log("GET")
                const response = await fetch(`${API_URL}/${url}`);
                const data = await response.json();
                setData(data);
            } else {
                const response = await fetch(`${API_URL}/${url}`, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                const data = await response.json();
                setData(data);
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }

    return { data, isLoading, error, fetchData };
}
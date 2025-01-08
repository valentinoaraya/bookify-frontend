import { useState } from "react";
import { API_URL } from "../config.ts";

export const useFetchData = (url: string, method: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (body: any) => {
        setIsLoading(true);
        try {
            if (method === "GET") {
                const response = await fetch(`${API_URL}/${url}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: "include"
                });
                const data = await response.json();
                return data;
            } else {
                const response = await fetch(`${API_URL}/${url}`, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: "include",
                    body: JSON.stringify(body)
                });
                const data = await response.json();
                return data;
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }

    return { isLoading, error, fetchData };
}
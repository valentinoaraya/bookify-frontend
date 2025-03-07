import { useState } from "react";

export const useFetchData = (url: string, method: string, token?: string | null) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (body: any) => {
        setIsLoading(true);
        try {
            if (method === "GET") {
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                return data;
            } else {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
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
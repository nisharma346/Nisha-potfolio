
// Server-side: use internal URL, Client-side: use public URL
const API_URL =
    typeof window === "undefined"
        ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Reusable API function
export async function apiRequest(endpoint, options = {}) {
    if (!API_URL) {
        throw new Error("API_URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local");
    }

    const url = `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            cache: "no-store",
            signal: options.signal || AbortSignal.timeout(5000),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: Something went wrong`);
        }

        return data;
    } catch (error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
            // Backend not running — silently fail so page renders with empty data
            throw new Error("BACKEND_UNAVAILABLE");
        }
        if (
            error.message === "fetch failed" ||
            error.message === "BACKEND_UNAVAILABLE" ||
            error.cause?.code === "ECONNREFUSED" ||
            error.cause?.code === "ECONNRESET"
        ) {
            throw new Error("BACKEND_UNAVAILABLE");
        }
        throw error;
    }
}

// GET request
export async function getData(endpoint) {
    return apiRequest(endpoint);
}

// POST request
export async function postData(endpoint, body, token = "") {
    return apiRequest(endpoint, {
        method: "POST",
        headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        body: JSON.stringify(body),
    });
}

// PUT request
export async function updateData(endpoint, body, token) {
    return apiRequest(endpoint, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
}

// DELETE request
export async function deleteData(endpoint, token) {
    return apiRequest(endpoint, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
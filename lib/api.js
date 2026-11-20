
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Reusable API function
export async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    } catch (error) {
        console.error("API Error:", error.message);
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
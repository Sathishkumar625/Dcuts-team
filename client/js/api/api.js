const API_BASE = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    return response.json();
}
// Old
fetch("http://localhost:5000/api/expenses")

// New
apiRequest("/expenses")
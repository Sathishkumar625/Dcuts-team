const API_BASE = "http://localhost:5000/api";


async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_BASE}${endpoint}`,
            {
                method: options.method || "GET",

                headers: {
                    "Content-Type": "application/json"
                },

                body:
                options.body
                ?
                JSON.stringify(options.body)
                :
                undefined
            }
        );


        const data = await response.json();


        return data;


    }
    catch(error){

        console.error(
            "API Error:",
            error
        );


        return {

            success:false,

            message:error.message

        };

    }

}
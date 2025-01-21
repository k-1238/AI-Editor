"usr server"

import axios from "axios";

export const getToken = async (email: string) => {
    const response = await axios.get("http://127.0.0.1:8000/api/auth/getToken", {
        params: {
            email
        }
    });
    return response;
};
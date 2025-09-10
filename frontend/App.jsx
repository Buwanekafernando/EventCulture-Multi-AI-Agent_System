import { GoogleOAuthProvider,GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function App(){
    const handleLoginSuccess = async (credentialResponse) => {
        const token = credentialResponse.credential;
        const res = await axios.post("http://localhost:5000/api/auth/google", { token });
        console.log(res.data);
    };
    return(
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log("Login Failed")}
        />
        </GoogleOAuthProvider>
    );
}

export default App;

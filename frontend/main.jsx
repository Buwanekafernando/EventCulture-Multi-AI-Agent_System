import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";


const clientid = '488358784304-d6r1u1rrsj2i56fepvkv223etmeu3b6h.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={clientid}>
        <App />
    </GoogleOAuthProvider>
);


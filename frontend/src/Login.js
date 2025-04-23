import React, { useState } from "react";
const Authentication = ({ username, setUsername, password, setPassword,setUserRole }) => {
const [error, setError] = useState("");

const handleLogin = async (e) => {
    e.preventDefault();
    const response = await
fetch("http://localhost:3000/contact/login", {
method: "POST",
headers: { "Content-Type": "application/json", },
body: JSON.stringify({ username, password }),
});

if (!response.ok) {
    const errorData = await response.json();
    setError(errorData.error);
    return;
    }
    const { role } = await response.json();
    setUserRole(role); 
    };

return ( 
    <div className="container mt-4">
<h2 className="text-center">Login</h2>
<form onSubmit={handleLogin}>
<div className="mb-3">
<label className="form-label">Username</label>
<input type="text" className="form-control" value={username}
onChange={(e) => setUsername(e.target.value)} required />
</div>
<div className="mb-3">
<label className="form-label">Password</label>
<input type="password" className="form-control" value={password}
onChange={(e) => setPassword(e.target.value)} required />
</div>
{error && <p className="text-danger">{error}</p>}
<button type="submit" className="btn btn-primary">Login</button>
</form>
</div>

 );
};
export default Authentication;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ username, userRole }) => {
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        async function fetchProfilePicture() {
            console.log("Read the picture for Sidebar ...")
            try {
                const response = await fetch(`http://localhost:3000/contact/profile_picture/${encodeURIComponent(username)}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setProfilePicture(`http://localhost:3000${data.picture}`);
                } else {
                    console.error("Failed to fetch profile picture: ", response.statusText);
                }
            } catch (err) {
                console.error("Failed to fetch profile picture: ", err);
            }
        }
        fetchProfilePicture();
    }, [username]);  // Add 'username' to the dependency array

    return (
        <div className="d-flex flex-column vh-100 p-3 bg-light" style={{ width: '250px' }}>
            <h2 className="text-center">Navigation</h2>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link to="/" className="nav-link text-dark">Home</Link>
                </li>
                <li className="nav-item">
                    <Link to="/contacts" className="nav-link text-dark">View Cars</Link>
                </li>
                <li className="nav-item">
                    <Link to="/add-contact" className="nav-link text-dark">Add Car</Link>
                </li>
                <li className="nav-item">
                    <Link to="/deletecontact" className="nav-link text-dark">Delete Car</Link>
                </li>
                <li className="nav-item">
                    <Link to="/searchContacts" className="nav-link text-dark">Search Cars</Link>
                </li>
                
                

                {userRole === "admin" && (
                    <>
                       
                        <li className="nav-item">
                            <Link to="/new_message" className="nav-link text-dark">Add New Review</Link>
                        </li>
                    </>
                )}
            </ul>
            {/* Other Sidebar Content */}
            <div className="profile-picture">
                {profilePicture && <img src={profilePicture} style={{ width: "150px", height: "auto" }} alt="User Profile" />}
                <p>{username}</p>
            </div>
        </div>
    );
};

export default Sidebar;

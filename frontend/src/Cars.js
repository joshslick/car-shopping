import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

// Function to fetch contacts data
const fetchContactsData = async () => {
  try {
    const response = await fetch("http://localhost:3000/contact");
    if (!response.ok) {
      throw new Error("Failed to fetch contacts");
    }
    return await response.json();
  } catch (error) {
    throw new Error("There was an Error loading contacts: " + error.message);
  }
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);  // To store any error

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await fetchContactsData();
        setContacts(data);
      } catch (error) {
        setError(error.message);
      }
    };

    loadContacts();
  }, []);

  return (
    <div className="container">
      <h2 className="text-center mt-4">Car List</h2>
      {error && <div className="alert alert-danger">{error}</div>} {/* Display error message if any */}
      <ul className="list-group">
        {contacts.map((contact) => (
          <li key={contact.id} className="list-group-item d-flex align-items-center">
            {contact.image_url && (
              <img
                src={`http://localhost:3000${contact.image_url}`} // Full URL to image
                alt={contact.contact_name}
                style={{ width: '50px', height: '50px', marginRight: '15px', objectFit: 'cover' }}
              />
            )}
            <div>
              <strong>{contact.contact_name}</strong> - {contact.phone_number}
              <p>{contact.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;

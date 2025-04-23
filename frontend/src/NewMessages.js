import React, { useState } from 'react';
const NewMessage = () => {
const [contactName, setContactName] = useState('');
const [contactsQuery, setContactsQuery] = useState([]);
const [sendContactId, setSendContactId] = useState(null); // Track which contact is being edited
const [sendNewMessage, setSendNewMessage] = useState(''); // Track new message input
const [messages, setMessages] = useState({}); // Store messages by contactId

const fetchContacts = async () => {
if (!contactName.trim()) {
alert("Please enter a car name");
return;
}
try {
const response = await fetch(`http://localhost:3000/contact/name?contact_name=${encodeURIComponent(contactName)}`);
if (!response.ok) {
const errorMessage = await response.json();
throw new Error(`Failed to fetch contacts: ${errorMessage.error}`);
}
const data = await response.json();
setContactsQuery(data);
} catch (err) {
alert("Error loading contacts: " + err);
}
};

// Fetch messages for a contact
const fetchMessages = async (contactId) => {
    try {
    const response = await fetch(`http://localhost:3000/contact/messages/${contactId}`);
    if (!response.ok) {
    const errorMessage = await response.json();
    throw new Error(`Failed to fetch messages: ${errorMessage.error}`);
    }
    const data = await response.json();
    // Store messages for this contact
    setMessages((prevMessages) => ({...prevMessages,[contactId]: data,}));
    } catch (err) {
    alert("Error fetching messages: " + err);
    }
    };

    // Add a new message for a contact
const handleUpdateSubmit = async (contactId) => {
    if (!sendNewMessage.trim()) {
    alert("Please enter a review.");
    return;
    }
    try {
    const response = await fetch('http://localhost:3000/contact/messages', {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({ contactId, message: sendNewMessage }),
    });
    if (!response.ok) {
    const errorMessage = await response.json();
    throw new Error(errorMessage.error);
    }
    alert("Message sent successfully!");
    setSendNewMessage(''); // Clear message input
    fetchMessages(contactId); // Refresh messages
    } catch (err) {
    alert("Error sending message: " + err);
    }
    };
    return (
        <div className="container">
          <h2 className="text-center mt-4">Add a Review</h2>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Car name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value.toLowerCase())}
            />
            <button className="btn btn-primary" onClick={fetchContacts}>
              Search
            </button>
          </div>
      
          <ul className="list-group">
            {contactsQuery.map((contact) => (
              <li key={contact.id} className="list-group-item">
                {/* Contact Details */}
                <div className="d-flex align-items-center">
                  {contact.image_url && (
                    <img
                      src={`http://localhost:8081${contact.image_url}`}
                      alt={contact.contact_name}
                      style={{
                        width: "50px",
                        height: "50px",
                        marginRight: "15px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div>
                    <strong>{contact.contact_name}</strong> - {contact.phone_number}
                  </div>
                  {/* Arrow Button to Show Messages */}
                  <button
                    className="btn btn-sm btn-link ms-2"
                    onClick={() => fetchMessages(contact.id)}
                  >
                    {/* Replace this comment with an icon if needed */}
                    Reviews
                  </button>
                  {/* Send Message Button */}
                  <button
                    className="btn btn-outline-secondary btn-sm ms-auto"
                    onClick={() => setSendContactId(contact.id)}
                  >
                    New Review
                  </button>
                </div>
      
                {/* Messages List */}
                {messages[contact.id] && (
                  <ul className="list-group mt-2">
                    {messages[contact.id].map((msg) => (
                      <li key={msg.id} className="list-group-item">
                        {msg.message}{" "}
                        <small className="text-muted">({msg.message_timestamp})</small>
                      </li>
                    ))}
                  </ul>
                )}
      
                {/* Input Form for Adding New Message */}
                {sendContactId === contact.id && (
                  <div className="mt-3">
                    <textarea
                      className="form-control mb-2"
                      value={sendNewMessage}
                      onChange={(e) => setSendNewMessage(e.target.value)}
                      placeholder="New Message"
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdateSubmit(contact.id)}
                    >
                      Submit
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
};
export default NewMessage;
import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import "../styles/ChatPage.css";

function ChatPage() {
  const [username, setUsername] = useState("Utilisateur");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  // مؤقتاً: الرسائل كتمشي لهاد اليوزر
  const FIXED_RECEIVER = "student1";

  const getCurrentUsername = () => {
    const storedUsername = localStorage.getItem("username");
    const storedUser = localStorage.getItem("user");

    let finalUsername = "Utilisateur";

    if (storedUsername && storedUsername.trim() !== "") {
      finalUsername = storedUsername;
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser.username && parsedUser.username.trim() !== "") {
          finalUsername = parsedUser.username;
        } else if (parsedUser.email && parsedUser.email.includes("@")) {
          finalUsername = parsedUser.email.split("@")[0];
        }
      } catch (error) {
        console.error("Erreur lecture localStorage user:", error);
      }
    }

    return finalUsername;
  };

  useEffect(() => {
    const finalUsername = getCurrentUsername();
    setUsername(finalUsername);
  }, []);

  const loadMessages = async (currentUsername) => {
    try {
      const res = await fetch(`http://127.0.0.1:8004/messages/${currentUsername}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
      setMessages([]);
    }
  };

  const connectSocket = () => {
    console.log("Connecting WebSocket...");

    const socket = new WebSocket("ws://127.0.0.1:8004/ws/chat");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to chat server");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("Invalid message format:", error);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from chat server");

      setTimeout(() => {
        connectSocket();
      }, 2000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      socket.close();
    };
  };

  useEffect(() => {
    const finalUsername = getCurrentUsername();

    loadMessages(finalUsername);
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: username,
      receiver: FIXED_RECEIVER,
      content: input.trim(),
    };

    console.log("Sending message:", messageData);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messageData));
      setInput("");

      setTimeout(() => {
        loadMessages(username);
      }, 500);
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const filteredMessages = messages.filter((msg) => {
    return (
      msg.sender === username ||
      msg.receiver === username ||
      msg.receiver === FIXED_RECEIVER
    );
  });

  return (
    <Layout>
      <div className="chat-content">
        <div className="main-content-titre">
          <p>Bienvenue sur la page de chat. Vous pouvez discuter en temps réel.</p>
        </div>

        <div className="chat-box">
          <div className="messages-container">
            {filteredMessages.length === 0 ? (
              <div className="message-bubble bot">
                Aucun message pour le moment.
              </div>
            ) : (
              filteredMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble ${
                    msg.sender === username ? "user" : "bot"
                  }`}
                >
                  <strong>{msg.sender}:</strong> {msg.content}
                </div>
              ))
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Écrire un message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage}>Envoyer</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChatPage;
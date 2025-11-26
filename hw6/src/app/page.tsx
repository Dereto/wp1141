"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  lineUserId: string;
  displayName?: string;
  pictureUrl?: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.lineUserId);
      const interval = setInterval(() => fetchMessages(selectedUser.lineUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMessages = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?userId=${userId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Conversations</h1>
        </div>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === user._id ? "bg-blue-50" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="font-medium">
                {user.displayName || user.lineUserId.slice(0, 10) + "..."}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(user.updatedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b shadow-sm">
              <h2 className="text-lg font-semibold">
                Chat with {selectedUser.displayName || selectedUser.lineUserId}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border shadow-sm text-gray-800"
                      }`}
                    >
                      <div className="text-sm mb-1 opacity-75 capitalize">
                        {msg.role}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={`text-xs mt-2 ${
                          msg.role === "user" ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view details
          </div>
        )}
      </div>
    </div>
  );
}

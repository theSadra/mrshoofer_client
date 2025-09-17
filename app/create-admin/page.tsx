"use client";

import { useState } from "react";

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminSecret: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ Admin created successfully! User ID: ${result.user.id}`);
        setFormData({ name: "", email: "", password: "", adminSecret: "" });
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create Admin User
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <input
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="name"
              placeholder="Admin User"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="email"
              placeholder="admin@mrshoofer.com"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="password"
              placeholder="Secure password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="adminSecret"
            >
              Admin Secret
            </label>
            <input
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="adminSecret"
              placeholder="Admin creation secret"
              type="password"
              value={formData.adminSecret}
              onChange={(e) =>
                setFormData({ ...formData, adminSecret: e.target.value })
              }
            />
          </div>

          <button
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded-md bg-gray-50 border">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>
            <strong>Note:</strong> You need the ADMIN_SECRET environment
            variable set in your Liara app.
          </p>
          <p>After creating the admin, you can login at /api/auth/signin</p>
        </div>
      </div>
    </div>
  );
}

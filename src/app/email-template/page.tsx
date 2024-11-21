"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { useSession } from "next-auth/react";

type Template = {
  id: number;
  title: string;
  subject: string;
  content: string;
  visibility: "private" | "public";
  userId?: number; // User ID to determine ownership
};

export default function TemplateManager() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTab, setCurrentTab] = useState<"private" | "public">("private");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    subject: "",
    content: "",
    visibility: "private",
  });
  const [loading, setLoading] = useState(false);

  // Fetch Templates and Current User Info
  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/email-templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [session]);

  const handleSaveTemplate = async () => {
    if (!newTemplate.title || !newTemplate.subject || !newTemplate.content) {
      alert("Title, Subject, and Content are required.");
      return;
    }

    setLoading(true);
    try {
      if (selectedTemplate) {
        // Edit Template
        await axios.put("/api/email-templates", {
          id: selectedTemplate.id,
          ...newTemplate,
        });
      } else {
        // Add Template
        await axios.post("/api/email-templates", newTemplate);
      }

      setNewTemplate({ title: "", subject: "", content: "", visibility: "private" });
      setSelectedTemplate(null);
      setShowTemplateModal(false);
      await fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    setLoading(true);
    try {
      await axios.delete("/api/email-templates", { data: { id } });
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (template) => template.visibility === currentTab || currentTab === "private"
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Email Templates</h2>

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 rounded-lg mr-2 ${
            currentTab === "private" ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
          onClick={() => setCurrentTab("private")}
        >
          Private Templates
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "public" ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
          onClick={() => setCurrentTab("public")}
        >
          Public Templates
        </button>
      </div>

      {/* Add Template Button */}
      {currentTab === "private" && (
        <button
          className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 mb-4"
          onClick={() => {
            setSelectedTemplate(null);
            setNewTemplate({ title: "", subject: "", content: "", visibility: "private" });
            setShowTemplateModal(true);
          }}
        >
          Add New Template
        </button>
      )}

      {/* Templates List */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-lg w-full max-h-[70vh] overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {filteredTemplates.map((template) => (
          <li key={template.id} className="flex justify-between items-center py-2">
            <div className="w-full p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium text-lg">{template.title}</h3>
              <p className="text-gray-700 mt-2">
                <strong>Subject:</strong> {template.subject}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Content:</strong> {template.content.slice(0,50)}...
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {currentTab === "private" || template.userId === session?.user?.id ? (
                <>
                  <button
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setNewTemplate({
                        title: template.title,
                        subject: template.subject,
                        content: template.content,
                        visibility: template.visibility,
                      });
                      setShowTemplateModal(true);
                    }}
                  >
                    <AiFillEdit className="h-5 w-5" />
                  </button>
                  <button
                    className="hover:text-red-700"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <AiFillDelete className="h-5 w-5" />
                  </button>
                </>
              ) : (<p></p>)}
            </div>
          </li>
        ))}
      </ul>
      </div>

      {/* Add/Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {selectedTemplate ? "Edit Template" : "Add New Template"}
            </h3>
            <input
              type="text"
              placeholder="Template Title"
              className="w-full p-3 mb-4 border rounded-lg"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Template Subject"
              className="w-full p-3 mb-4 border rounded-lg"
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))}
            />
            <textarea
              placeholder="Template Content"
              className="w-full p-3 mb-4 border rounded-lg"
              rows={6}
              value={newTemplate.content}
              onChange={(e) => setNewTemplate((prev) => ({ ...prev, content: e.target.value }))}
            />
            <div className="flex items-center mb-4">
              <label className="mr-3">Public:</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={newTemplate.visibility === "public"}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      visibility: e.target.checked ? "public" : "private",
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded-lg ${
                  loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={handleSaveTemplate}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

type Template = {
  id: number;
  title: string;
  subject: string;
  content: string;
};

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ title: '', subject: '', content: '' });
  const [loading, setLoading] = useState(false);

  // Fetch Templates from Backend
  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/email-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Save (Add/Edit) Template
  const handleSaveTemplate = async () => {
    if (!newTemplate.title || !newTemplate.subject || !newTemplate.content) {
      alert('Title, Subject and Content are required.');
      return;
    }

    setLoading(true);
    try {
      if (selectedTemplate) {
        // Edit Template
        await axios.put('/api/email-templates', {
          id: selectedTemplate.id,
          title: newTemplate.title,
          subject: newTemplate.subject,
          content: newTemplate.content,
        });
      } else {
        // Add Template
        await axios.post('/api/email-templates', newTemplate);
      }

      setNewTemplate({ title: '',subject: '', content: '' });
      setSelectedTemplate(null);
      setShowTemplateModal(false);
      await fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);
    try {
      await axios.delete('/api/email-templates', { data: { id } });
      await fetchTemplates(); // Refresh templates
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Email Templates</h2>
      {/* Add Template Button */}
      <button
        className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 mb-4"
        onClick={() => {
          setSelectedTemplate(null);
          setNewTemplate({ title: '', subject: '', content: '' });
          setShowTemplateModal(true);
        }}
      >
        Add New Template
      </button>

      {/* Templates List */}
      <ul className="divide-y divide-gray-200 mb-4">
        {templates.map((template) => (
          <li key={template.id} className="flex justify-between items-center py-2">
            <div className="w-full p-4 border rounded-lg mr-2 bg-gray-50">
              <h2 className="font-medium text-lg text-gray-800">{template.title}</h2>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Subject:</strong> {template.subject.slice(0, 30)}...
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Content:</strong> {template.content.slice(0, 50)}...
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="text-white-500 hover:text-gray-700"
                onClick={() => {
                  setSelectedTemplate(template);
                  setNewTemplate(template);
                  setShowTemplateModal(true);
                }}
              >
                <AiFillEdit className="h-5 w-5" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteTemplate(template.id)}
              >
                <AiFillDelete className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      

      {/* Add/Edit Modal */}
      {showTemplateModal && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {selectedTemplate ? 'Edit Template' : 'Add New Template'}
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

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={handleSaveTemplate}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

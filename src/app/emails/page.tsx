'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AiFillDelete } from 'react-icons/ai'; // Trash Icon
import { BiMessageRoundedDetail } from 'react-icons/bi'; // Thread Icon
import { HiOutlineLightBulb } from 'react-icons/hi'; // Suggestion Icon

type Email = {
  id: number;
  recipient: string;
  subject: string;
  content: string;
  sent_at: string;
  thread_id?: string; 
};

type ThreadMessage = {
  subject: string;
  from: string;
  date: string;
  snippet: string;
};

// Email Combination Generator Function
function generateEmailCombinations(firstName: string, lastName: string, domain: string): string[] {
  const first = firstName.toLowerCase();
  const last = lastName.toLowerCase();
  const f = first[0];
  const l = last[0];

  // Ensure the domain has no leading or trailing spaces and ends with `.com`
  const sanitizedDomain = domain.trim().toLowerCase();
  const validDomain = sanitizedDomain.endsWith('.com') ? sanitizedDomain : `${sanitizedDomain}.com`;

  // Generate combinations
  return [
    `${first}.${last}@${validDomain}`,
    `${first}_${last}@${validDomain}`,
    `${first}${last}@${validDomain}`,
    `${first}${l}@${validDomain}`,
    `${f}${last}@${validDomain}`,
    `${f}.${last}@${validDomain}`,
    `${first}@${validDomain}`,
    `${last}@${validDomain}`,
    `${f}${l}@${validDomain}`,
    `${last}.${first}@${validDomain}`,
    `${last}_${first}@${validDomain}`,
    `${last}${first}@${validDomain}`,
    `${last}${f}@${validDomain}`,
    `${first}-${last}@${validDomain}`,
    `${last}-${first}@${validDomain}`,
  ];
}

export default function EmailsPage() {
  const [recipient, setRecipient] = useState<string>(''); // Recipient Field
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false); // Modal Visibility
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]); // Email Combinations
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]); // Selected Emails to Add
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');

  const fetchEmails = async () => {
    try {
      const response = await axios.get('/api/get-emails');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };
  const fetchThread = async (threadId: string) => {
    setIsLoadingThread(true);
    setThreadError(null);
    setThread(null);
    try {
      const response = await axios.get(`/api/get-thread?threadId=${threadId}`);
      setThread(response.data.thread);
      setActiveThreadId(threadId);
      setShowThreadModal(true);
    } catch (error) {
      console.error('Error fetching thread:', error);
      setThreadError('Unable to load thread. Please try again later.');
      setShowThreadModal(true); // Show modal with error message
    } finally {
      setIsLoadingThread(false);
    }
  };

  const closeThreadModal = () => {
    setShowThreadModal(false);
    setActiveThreadId(null);
    setThread(null);
    setThreadError(null);
  };

  const handleSendEmail = async () => {
    if (!recipient || !subject || !content) {
      alert('Please fill in all required fields: Recipient, Subject, and Content.');
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post('/api/send-email', {
        recipient,
        subject,
        content,
      });
  
      if (response.data.status === 'completed') {
        const failedEmails = response.data.results.filter((res: any) => !res.emailSent);
  
        if (failedEmails.length > 0) {
          alert(
            `The following emails could not be sent:\n${failedEmails
              .map((res: any) => `${res.recipient}: ${res.errorMessage}`)
              .join('\n')}`
          );
        }
  
        // Refresh emails
        await fetchEmails();
  
        // Reset fields
        setRecipient('');
        setSubject('');
        setContent('');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An error occurred while sending the email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateEmail = async () => {
    if (!jobDescription || !resumeSummary) {
      setGenerateError('Please provide both job description and resume summary.');
      return;
    }

    setGenerateError(null);
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/generate-email', {
        jobDescription,
        resumeSummary,
      });

      if (response.data.email) {
        setContent(response.data.email);
        setShowModal(false);
      } else {
        setGenerateError('Failed to generate email. Try again.');
      }
    } catch (error) {
      setGenerateError('Failed to generate email. Please check the server.');
      console.error('Error generating email:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleDeleteEmail = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this email?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete('/api/delete-email', {
        data: { id },
      });

      if (response.data.status === 'success') {
        await fetchEmails(); // Refresh the email list
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const handleGenerateEmails = () => {
    if (!firstName || !lastName || !companyDomain) {
      alert('Please fill in all fields: First Name, Last Name, and Company Domain.');
      return;
    }
    const suggestions = generateEmailCombinations(firstName, lastName, companyDomain);
    setEmailSuggestions(suggestions);
  };

  const handleAddRecipients = () => {
    setRecipient((prev) => `${prev}${prev ? ', ' : ''}${selectedEmails.join(', ')}`);
    setShowSuggestionModal(false); // Close Modal
    setEmailSuggestions([]);
    setSelectedEmails([]);
    setFirstName('');
    setLastName('');
    setCompanyDomain('');
  };

  const handleCancelSuggestion = () => {
    setShowSuggestionModal(false); // Close Modal
    setEmailSuggestions([]);
    setSelectedEmails([]);
    setFirstName('');
    setLastName('');
    setCompanyDomain('');
  };

  

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="relative bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Emails</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Compose Email Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Compose Email</h3>

          {/* Modal for Email Suggestions */}
          {/* Modal for Email Suggestions */}
          {showSuggestionModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Generate Email Suggestions</h3>

                {/* Input Fields */}
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full p-3 mb-4 border rounded-lg"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full p-3 mb-4 border rounded-lg"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Company Domain (e.g., example.com)"
                  className="w-full p-3 mb-4 border rounded-lg"
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                />

                {/* Generate Button */}
                <button
                  className="w-full p-3 rounded-lg text-white bg-green-600 hover:bg-green-700 mb-4"
                  onClick={handleGenerateEmails}
                >
                  Generate Suggestions
                </button>

                {/* Email Suggestions */}
                {emailSuggestions.length > 0 && (
                  <div className="mb-4">
                    {/* Title */}
                    <h4 className="font-medium mb-2">Suggested Emails:</h4>

                    {/* Email Suggestions List */}
                    <ul className="space-y-2">
                      {emailSuggestions.map((email, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-start space-x-4"
                        >
                          {/* Checkbox for selecting emails */}
                          <input
                            type="checkbox"
                            value={email}
                            className="w-5 h-5"
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedEmails((prev) =>
                                checked ? [...prev, email] : prev.filter((em) => em !== email)
                              );
                            }}
                          />
                          {/* Display Email */}
                          <label className="text-gray-700">{email}</label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                    onClick={() => handleCancelSuggestion()}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-white ${
                      selectedEmails.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleAddRecipients}
                    disabled={selectedEmails.length === 0}>
                    Add to Recipients
                  </button>
                </div>
              </div>
            </div>
          )}

             <div className="mb-2 flex space-x-2">
              {/* Recipient Input Field */}
              <input
                type="email"
                placeholder="Recipient Email"
                className="w-full p-3 border rounded-lg"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              
              {/* Email Suggestion Button */}
              <button
                className="flex-1 text-black-600 hover:text-yellow-300 rounded-lg"
                onClick={() => setShowSuggestionModal(true)}
                title="Email Suggestions"
              >
                <HiOutlineLightBulb className="h-6 w-6" />
              </button>
            </div>
     
          <input
            type="text"
            placeholder="Subject"
            className="w-full p-3 mb-4 border rounded-lg"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            placeholder="Email Content"
            className="w-full p-3 mb-4 border rounded-lg"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex space-x-4">
            <button
              className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowModal(true)}
            >
              Generate Email
            </button>
            <button
              className={`w-full p-3 rounded-lg text-white ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={handleSendEmail}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>

        {/* Sent Emails Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Sent Emails</h3>
        {emails.length === 0 ? (
          <p className="text-gray-500">No emails sent yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {emails.map((email) => (
              <li key={email.id} className="flex justify-between items-center py-4">
                <div>
                  <p>
                    <strong>To:</strong> {email.recipient}
                  </p>
                  
                  <p>
                    <strong>Subject:</strong> {email.subject}
                  </p>
                  <p>
                    <strong>Content:</strong> {email.content}
                  </p>
                  <p>
                    <strong>Sent At:</strong> {new Date(email.sent_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                <button
                    className="hover:text-red-800"
                    onClick={() => handleDeleteEmail(email.id)}>
                    <AiFillDelete className="h-6 w-6" aria-hidden="true" />
                </button>
                  {email.thread_id && (
                    <button
                      className={`hover:text-blue-800 ${
                        isLoadingThread && activeThreadId === email.thread_id ? 'cursor-wait' : ''
                      }`}
                      onClick={() => fetchThread(email.thread_id!)}
                      disabled={isLoadingThread && activeThreadId === email.thread_id}
                    >
                      <BiMessageRoundedDetail className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for Viewing Threads */}
      {showThreadModal && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Thread Messages</h3>
            {isLoadingThread ? (
              <p className="text-gray-500">Loading thread...</p>
            ) : threadError ? (
              <p className="text-red-500">{threadError}</p>
            ) : thread && thread.length > 0 ? (
              <ul className="space-y-4">
                {thread.map((message, index) => (
                  <li key={index} className="border-b pb-2">
                    <p>
                      <strong>From:</strong> {message.from}
                    </p>
                    <p>
                      <strong>Date:</strong> {message.date}
                    </p>
                    <p>
                      <strong>Snippet:</strong> {message.snippet}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No messages in this thread.</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={closeThreadModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Modal for Generating Email */}
      {showModal && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Generate Email</h3>
            <input
              type="text"
              placeholder="Job Description"
              className="w-full p-3 mb-4 border rounded-lg"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Resume Summary"
              className="w-full p-3 mb-4 border rounded-lg"
              value={resumeSummary}
              onChange={(e) => setResumeSummary(e.target.value)}
            />
            {generateError && <p className="text-red-600 mb-4">{generateError}</p>}
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={handleGenerateEmail}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="loader mb-4"></div>
          <div className="text-white text-lg font-semibold">Generating email...</div>
        </div>
      )}
    </div>
  );
}

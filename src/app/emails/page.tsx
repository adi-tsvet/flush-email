'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // For navigation to Add Email Format page
import { AiFillDelete } from 'react-icons/ai'; // Trash Icon
import { HiOutlineLightBulb } from 'react-icons/hi'; // Suggestion Icon
import TiptapEditor from "../components/TiptapEditor"; // Ensure the path matches where your TiptapEditor component is located


type Email = {
  id: number;
  recipient: string;
  subject: string;
  content: string;
  sent_at: string;
};
type Template = {
  id: number;
  title: string;
  subject: string;
  content: string;
  visibility: "private" | "public";
};

export default function EmailsPage() {
  const { data: session } = useSession();
  const [recipient, setRecipient] = useState<string>(''); // Recipient Field
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false); // Modal Visibility
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]); // Email Combinations
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]); // Selected Emails to Add
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [emailFormat, setEmailformat] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false); // Template Modal
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter(); // For navigating to the Add Email Format page
  const [users, setUsers] = useState<{ firstName: string; lastName: string }[]>([]);
  const [step, setStep] = useState<"company" | "users">("company"); // Modal steps
  const [companyName, setCompanyName] = useState<string>(""); // Company name


  const fetchEmails = async () => {
    try {
      const response = await axios.get('/api/get-emails');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleSendEmail = async () => {
    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear success message
  
    if (!recipient || !subject || !content) {
      setErrorMessage("Please fill in all required fields: Recipient, Subject, and Content.");
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post("/api/send-email", {
        recipient,
        subject,
        content,
      });
  
      if (response.data.status === "completed") {
        const failedEmails = response.data.results.filter((res: any) => !res.emailSent);
  
        if (failedEmails.length > 0) {
          const errorDetails = failedEmails
            .map((res: any) => `${res.recipient}: ${res.errorMessage}`)
            .join("\n");
  
          setErrorMessage(
            `The following emails could not be sent:\n${errorDetails}`
          );
        } else {
          setSuccessMessage("Emails sent successfully!");
          // Clear the form after success
          setRecipient("");
          setSubject("");
          setContent("");
        }
  
        // Refresh the email list
        await fetchEmails();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage("An unexpected error occurred while sending the email.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateEmailBody = async () => {
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

  const handleValidateCompany = async () => {
    if (!companyName) {
      alert("Please enter a company name.");
      return;
    }
    console.log("Before try")

    try {
      const response = await axios.get(`/api/company-format?companyName=${companyName}`);
      const { domain, email_format } = response.data;
      console.log("Company log : ", response)

      if (domain) {
        setCompanyDomain(domain);
        setEmailformat(email_format);
        setStep("users");
      } else {
        alert(`No format found for ${companyName}. Redirecting to Add Email Format page.`);
        router.push('/email-address-format');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        alert(`No format found for ${companyName}. Redirecting to Add Email Format page.`);
        router.push('/email-address-format');
      } else {
        console.error("Error validating company:", error);
        alert("An unexpected error occurred while validating the company.");
      }
    }
  };

  const handleAddUser = () => {
    setUsers((prev) => [...prev, { firstName: "", lastName: "" }]);
  };

  const handleUserChange = (index: number, key: "firstName" | "lastName", value: string) => {
    setUsers((prev) =>
      prev.map((user, idx) =>
        idx === index ? { ...user, [key]: value } : user
      )
    );
  };

  const handleRemoveUser = (index: number) => {
    setUsers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleGenerateEmails = () => {
    if (!companyDomain || users.some((user) => !user.firstName || !user.lastName)) {
      alert("Please fill in all fields for all users.");
      return;
    }
  
    const emails = users.map((user) => {
      const { firstName, lastName } = user;
  
      // Validate that firstName and lastName are non-empty
      if (!firstName || !lastName) {
        throw new Error("Both first name and last name are required for all users.");
      }
  
      // Replace placeholders in the emailFormat
      return emailFormat
        .replace("{firstname}", firstName.toLowerCase())
        .replace("{lastname}", lastName.toLowerCase())
        .replace("{f}", firstName[0].toLowerCase())
        .replace("{l}", lastName[0].toLowerCase())
        .replace("{domain}", companyDomain.toLowerCase());
    });
  
    setEmailSuggestions(emails); // Add the generated emails to suggestions
  };
  
 
  const handleAddRecipients = () => {
    setRecipient((prev) => `${prev}${prev ? ', ' : ''}${selectedEmails.join(', ')}`);
    setShowSuggestionModal(false); // Close Modal
    resetSuggestionModal();
  };
  
  const handleCancelSuggestion = () => {
    setShowSuggestionModal(false); // Close Modal
    resetSuggestionModal();
  };
  
  const resetSuggestionModal = () => {
    setEmailSuggestions([]);
    setSelectedEmails([]);
    setFirstName('');
    setLastName('');
    setCompanyDomain('');
    setCompanyName(''); // Reset company name
    setUsers([]);
    setStep("company"); // Reset step to "company"
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/email-templates'); // Fetch templates
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSubject(template.subject);
    setContent(template.content);
    setShowTemplatesModal(false); // Close modal after selection
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm) ||
      email.content.toLowerCase().includes(searchTerm)
  );
  

  useEffect(() => {
    fetchEmails();
    fetchTemplates();
  }, [session]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Emails</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Compose Email Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Compose Email</h3>
          {/* Display Error Message */}
          {errorMessage && (
            <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">
              {errorMessage.includes("BadCredentials")
                ? "Invalid Gmail ID or Gmail App Password. Please check your credentials in Profile Tab."
                : errorMessage}
            </div>
          )}

          {/* Display Success Message */}
          {successMessage && (
            <div className="bg-green-100 text-green-800 p-3 mb-4 rounded">
              {successMessage}
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
            <div className="relative group">
              <button
                className="flex-1 text-black-600 hover:text-yellow-300 rounded-lg"
                onClick={() => setShowSuggestionModal(true)}
              >
                <HiOutlineLightBulb className="h-6 w-6" />
              </button>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                Email Suggestions
              </span>
            </div>
          </div>

          <div className="mb-2 flex justify-between items-center">
            <button
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowTemplatesModal(true)}
            >
              Use Template
            </button>
          </div>
          <input
            type="text"
            placeholder="Subject"
            className="w-full p-3 mb-4 border rounded-lg"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          {/* <textarea
            placeholder="Email Content"
            className="w-full p-3 mb-4 border rounded-lg"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          /> */}
          {/* TiptapEditor for Email Content */}
          <TiptapEditor value={content} onChange={setContent} />
  
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
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Sent Emails</h3>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search emails by subject or content..."
            className="w-full p-3 mb-4 border rounded-lg"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />

          {/* Scrollable Email List */}
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-h-[60vh] overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <p className="text-gray-500">No emails match your search.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredEmails.map((email) => (
                  <li
                    key={email.id}
                    className= "rounded-lg bg-gray-50 mb-4 last:mb-0 shadow-sm"
                  >
                    {/* Email Details */}
                    <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center shadow-sm">
                    <div>
                      <p>
                        <strong>To:</strong> {email.recipient}
                      </p>
                      <p>
                        <strong>Subject:</strong> {email.subject}
                      </p>
                      <p>
                        <strong>Content:</strong> {email.content.slice(0, 100)}...
                      </p>
                      <p>
                        <strong>Sent At:</strong>{" "}
                        {new Date(email.sent_at).toLocaleString()}
                      </p>
                    </div>
                    {/* Delete Button */}
                    <div>
                      <button
                        className="text-white-500 hover:text-red-700 transition"
                        onClick={() => handleDeleteEmail(email.id)}
                        title="Delete Email"
                      >
                        <AiFillDelete className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

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
                onClick={handleGenerateEmailBody}
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

      {/* Templates Modal */}
      {showTemplatesModal && (
       <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
         <h3 className="text-xl font-semibold mb-4">Select a Template</h3>
     
         {/* Scrollable List Container */}
         <div className="max-h-[50vh] overflow-y-auto">
           <ul className="divide-y divide-gray-200">
              {templates.map((template) => (
                <li
                  key={template.id}
                  className="py-2 cursor-pointer hover:bg-gray-100 rounded-lg"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <h4 className="font-semibold">{template.title}</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Visibility:</strong> {template.visibility}
                  </p>
                </li>
              ))}
            </ul>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-gray-800"
                onClick={() => setShowTemplatesModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Email Suggestions */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {step === "company" ? "Enter Company Name" : "Generate Email Suggestions"}
            </h3>

            {/* Step 1: Enter Company Name*/}
            {step === "company" && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Company Name"
                  className="w-full p-3 mb-4 border rounded-lg"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <button
                  onClick={handleValidateCompany}
                  className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2: Add Users */}
            {step === "users" && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-4">Add Users</h3>
                  {users.map((user, index) => (
                    <div key={index} className="flex items-center space-x-4 mb-2">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-3 border rounded-lg"
                        value={user.firstName}
                        onChange={(e) =>
                          handleUserChange(index, "firstName", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-3 border rounded-lg"
                        value={user.lastName}
                        onChange={(e) =>
                          handleUserChange(index, "lastName", e.target.value)
                        }
                      />
                      <button
                        onClick={() => handleRemoveUser(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove User"
                      >
                        <AiFillDelete className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddUser}
                    className="w-full p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {`Enter ${users.length + 1} person name`}
                  </button>
                </div>

                <button
                  onClick={handleGenerateEmails}
                  className="w-full p-3 mb-4 rounded-lg text-white bg-green-600 hover:bg-green-700"
                >
                  Generate Emails
                </button>
              </div>
            )}

            {/* Email Suggestions */}
            {emailSuggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Suggested Emails:</h4>
                <button
                  onClick={
                    selectedEmails.length === emailSuggestions.length
                      ? () => setSelectedEmails([])
                      : () => setSelectedEmails([...emailSuggestions])
                  }
                  className="p-2 mb-2 text-sm rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  {selectedEmails.length === emailSuggestions.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <ul className="space-y-2">
                  {emailSuggestions.map((email, index) => (
                    <li key={index} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        value={email}
                        className="w-5 h-5"
                        checked={selectedEmails.includes(email)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedEmails((prev) =>
                            checked
                              ? [...prev, email]
                              : prev.filter((em) => em !== email)
                          );
                        }}
                      />
                      <label className="text-gray-700">{email}</label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => handleCancelSuggestion()}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedEmails.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={handleAddRecipients}
                disabled={selectedEmails.length === 0}
              >
                Add to Recipients
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


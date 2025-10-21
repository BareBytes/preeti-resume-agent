import React, { useState } from 'react';
import { FileText, Sparkles, Download, CheckCircle, XCircle, Loader } from 'lucide-react';

const CONFIG = {
  name: "Preeti",
  tagline: "Financial Analyst",
  welcomeMessage: "Create a tailored resume for your next opportunity"
};

const ResumeAgent = () => {
  const [step, setStep] = useState('welcome');
  const [jobDescription, setJobDescription] = useState('');
  const [changes, setChanges] = useState([]);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [resumeId, setResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJobSubmit = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const response = await fetch('https://vinayrathul-resume-agent-api.hf.space/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          userId: 'preeti'
        })
      });

      if (!response.ok) throw new Error('Failed to generate resume');

      const data = await response.json();
      setChanges(data.changes);
      setResumeId(data.resumeId);
      setTailoredResume(data.tailoredResume);
      setStep('review');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate resume. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://vinayrathul-resume-agent-api.hf.space/api/download-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resumeId,
          approved: true,
          userId: 'preeti',
          tailoredResume: tailoredResume
        })
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${CONFIG.name}_Resume_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStep('download');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to download resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setStep('input');
    setChanges([]);
  };

  const resetFlow = () => {
    setStep('welcome');
    setJobDescription('');
    setChanges([]);
    setResumeId('');
    setTailoredResume(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-3 tracking-tight">
            {CONFIG.name}
          </h1>
          <p className="text-lg text-gray-500 font-light">{CONFIG.tagline}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center space-y-8 py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                <Sparkles className="w-9 h-9 text-gray-800" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-light text-gray-900 max-w-xl mx-auto leading-tight">
                {CONFIG.welcomeMessage}
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto leading-relaxed font-light">
                Simply paste a job description, and I'll customize your resume to match 
                the requirements while maintaining a professional, ATS-friendly format.
              </p>
              <button
                onClick={() => setStep('input')}
                className="mt-8 px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Input Step */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                <h2 className="text-xl font-light text-gray-900">Job Description</h2>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-72 px-4 py-4 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none text-sm font-light leading-relaxed transition-all"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleJobSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Generate Resume'}
                </button>
                <button
                  onClick={resetFlow}
                  className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center space-y-8 py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full">
                <Loader className="w-9 h-9 text-gray-800 animate-spin" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-light text-gray-900">Analyzing</h2>
              <p className="text-gray-500 font-light">
                Matching your experience with job requirements...
              </p>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                <h2 className="text-xl font-light text-gray-900">Review Changes</h2>
              </div>

              <div className="bg-gray-50 border border-gray-100 px-5 py-4 rounded-lg">
                <p className="text-gray-600 text-sm font-light">
                  Review the proposed changes below. Approve to download your customized resume.
                </p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {changes.map((change, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-5 bg-white hover:border-gray-200 transition-colors">
                    <div className="font-medium text-gray-900 text-sm mb-3">{change.section}</div>
                    <div className="text-sm text-gray-600 space-y-2 font-light">
                      <div className="flex gap-3">
                        <span className="text-red-500 flex-shrink-0 font-normal">−</span>
                        <span className="line-through">{change.original}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-green-600 flex-shrink-0 font-normal">+</span>
                        <span>{change.modified}</span>
                      </div>
                    </div>
                    {change.reason && (
                      <div className="mt-3 text-xs text-gray-500 font-light italic border-t border-gray-100 pt-3">
                        {change.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  Approve & Download
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  <XCircle className="w-4 h-4" strokeWidth={2} />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Download Success Step */}
          {step === 'download' && (
            <div className="text-center space-y-8 py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full">
                <Download className="w-9 h-9 text-gray-800" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-light text-gray-900">Download Complete</h2>
              <p className="text-gray-500 max-w-md mx-auto font-light">
                Your customized resume has been downloaded. Good luck with your application.
              </p>
              <button
                onClick={resetFlow}
                className="mt-8 px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all"
              >
                Create Another
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-20 text-xs text-gray-400 font-light">
          Powered by Claude AI
        </div>
      </div>
    </div>
  );
};

export default ResumeAgent;
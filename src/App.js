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
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
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
      console.log('API Response:', data); // Debug log
      
      setChanges(data.changes || []);
      setResumeId(data.resumeId);
      setTailoredResume(data.tailoredResume);
      
      // Set keyword analysis with fallbacks
      setKeywordAnalysis({
        keywords_found: data.keywords_found || [],
        keywords_addressed: data.keywords_addressed || [],
        keywords_missing: data.keywords_missing || [],
        estimated_pages: data.estimated_pages || 2
      });
      
      console.log('Keyword Analysis:', {
        found: data.keywords_found?.length || 0,
        addressed: data.keywords_addressed?.length || 0,
        missing: data.keywords_missing?.length || 0
      });
      
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
      a.download = `${CONFIG.name}_Resume_${new Date().toISOString().split('T')[0]}.docx`;
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
    setKeywordAnalysis(null);
    setValidationResult(null);
  };

  const resetFlow = () => {
    setStep('welcome');
    setJobDescription('');
    setChanges([]);
    setResumeId('');
    setTailoredResume(null);
    setKeywordAnalysis(null);
    setValidationResult(null);
    setError('');
  };

  const handleValidate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://vinayrathul-resume-agent-api.hf.space/api/validate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tailoredResume: tailoredResume,
          missing_keywords: keywordAnalysis?.keywords_missing || []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Validation error response:', errorText);
        throw new Error('Validation failed');
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate resume. You can still download without validation.');
    } finally {
      setLoading(false);
    }
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
                <FileText className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <label className="text-sm font-medium text-gray-900">Job Description</label>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full h-80 p-5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none font-light"
              />

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800 font-light">{error}</p>
                </div>
              )}

              <button
                onClick={handleJobSubmit}
                disabled={loading || !jobDescription.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Generate Resume
              </button>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center space-y-8 py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full">
                <Loader className="w-9 h-9 text-gray-800 animate-spin" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-light text-gray-900">Analyzing & Tailoring</h2>
              <p className="text-gray-500 max-w-md mx-auto font-light">
                Optimizing your resume with keywords and ATS-friendly formatting...
              </p>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800 font-light">{error}</p>
                </div>
              )}

              {keywordAnalysis && (
                <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Keyword Coverage Analysis</h3>
                  <div className="space-y-2 text-sm font-light">
                    <div className="flex items-center gap-2 text-green-700">
                      <span className="font-medium">✓</span>
                      <span>
                        <b>{keywordAnalysis.keywords_addressed?.length || 0}</b> of{' '}
                        <b>{keywordAnalysis.keywords_found?.length || 0}</b> keywords addressed
                      </span>
                    </div>
                    
                    {keywordAnalysis.keywords_missing && keywordAnalysis.keywords_missing.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-amber-600">
                          <span className="font-medium">⚠</span>
                          <span>
                            {keywordAnalysis.keywords_missing.length} keyword(s) could not be naturally included
                          </span>
                        </div>
                        <div className="ml-6 text-amber-700 text-xs">
                          Missing: {keywordAnalysis.keywords_missing.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📄</span>
                      <span>Format: <b>{keywordAnalysis.estimated_pages || 2} pages</b></span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-100 px-5 py-4 rounded-lg">
                <p className="text-gray-600 text-sm font-light">
                  Review the proposed changes below. Approve to download your customized resume.
                </p>
              </div>

              {/* Validation Results Section */}
              {validationResult && (
                <div className={`border rounded-lg p-5 ${
                  validationResult.ats_score >= 95 ? 'bg-green-50 border-green-200' :
                  validationResult.ats_score >= 85 ? 'bg-blue-50 border-blue-200' :
                  validationResult.ats_score >= 70 ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 text-sm">ATS Validation Score</h3>
                    <div className={`text-2xl font-bold ${
                      validationResult.ats_score >= 95 ? 'text-green-600' :
                      validationResult.ats_score >= 85 ? 'text-blue-600' :
                      validationResult.ats_score >= 70 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {validationResult.ats_score}/100
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 font-light mb-4">
                    {validationResult.overall_assessment}
                  </p>

                  {validationResult.strengths && validationResult.strengths.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Strengths:</div>
                      <ul className="text-xs text-gray-600 space-y-1 font-light">
                        {validationResult.strengths.map((strength, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-green-600">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.issues && validationResult.issues.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Issues Found ({validationResult.issues.length}):
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {validationResult.issues.map((issue, idx) => (
                          <div key={idx} className="bg-white rounded p-3 text-xs">
                            <div className="flex items-start gap-2 mb-1">
                              <span className={`font-medium ${
                                issue.severity === 'high' ? 'text-red-600' :
                                issue.severity === 'medium' ? 'text-amber-600' :
                                'text-gray-600'
                              }`}>
                                {issue.severity === 'high' ? '⚠' : issue.severity === 'medium' ? '⚡' : 'ℹ'}
                              </span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{issue.category}</div>
                                <div className="text-gray-600 font-light mt-1">{issue.issue}</div>
                                {issue.location && (
                                  <div className="text-gray-500 font-light mt-1">
                                    Location: {issue.location}
                                  </div>
                                )}
                                {issue.suggestion && (
                                  <div className="text-gray-700 font-light mt-2 border-t border-gray-100 pt-2">
                                    💡 {issue.suggestion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.ready_to_submit && (
                    <div className="mt-4 text-sm font-medium text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Ready to submit!
                    </div>
                  )}
                </div>
              )}

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
                {!validationResult && (
                  <button
                    onClick={handleValidate}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                    {loading ? 'Validating...' : 'Validate with AI'}
                  </button>
                )}
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  {validationResult ? 'Download Resume' : 'Skip & Download'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                >
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
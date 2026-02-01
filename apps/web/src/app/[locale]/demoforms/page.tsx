'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import Checkbox from '@/components/ui/Checkbox';
import {
  CheckCircle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Calendar,
  DollarSign,
  Target,
  Users,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

/**
 * Forms & Workflows Demo Page
 * 
 * Comprehensive forms showcase with multi-step wizard, advanced form fields,
 * file upload with drag & drop, and validation.
 */
export default function DemoFormsPage() {
  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  const steps = [
    { id: 1, name: 'Basic Info', icon: FileText },
    { id: 2, name: 'Details', icon: Target },
    { id: 3, name: 'Media', icon: ImageIcon },
    { id: 4, name: 'Review', icon: CheckCircle },
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#13131A]">
        <Container>
          <div className="py-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Forms & Workflows</h1>
            <p className="text-gray-400">
              Multi-step wizards, advanced form fields, file uploads, and validation
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="space-y-12">
          
          {/* Multi-Step Campaign Wizard */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Multi-Step Campaign Wizard</h2>
              <p className="text-gray-400">
                Create a new fundraising campaign with our guided step-by-step process
              </p>
            </div>

            <Card className="p-8 bg-[#13131A] border border-gray-800">
              {/* Stepper */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                              isCompleted
                                ? 'bg-gradient-to-r from-green-500 to-cyan-500'
                                : isActive
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 ring-4 ring-primary-500/30'
                                : 'bg-[#1C1C26] border-2 border-gray-700'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-white" />
                            ) : (
                              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'
                            }`}
                          >
                            {step.name}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-4 transition-colors ${
                              currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-cyan-500' : 'bg-gray-700'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold mb-4">Campaign Basic Information</h3>
                    
                    <div className="form-input-glow">
                      <Input
                        label="Campaign Name"
                        type="text"
                        placeholder="Enter a compelling campaign name"
                        value={campaignName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignName(e.target.value)}
                        className="bg-[#1C1C26] border-gray-700"
                      />
                    </div>

                    <div className="form-input-glow">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Campaign Goal ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="50000"
                          value={campaignGoal}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignGoal(e.target.value)}
                          className="bg-[#1C1C26] border-gray-700 pl-10"
                        />
                      </div>
                    </div>

                    <div className="form-input-glow">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Campaign Description
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe your campaign and its impact..."
                        value={campaignDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCampaignDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1C1C26] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-input-glow">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-[#1C1C26] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select a category</option>
                          <option value="education">Education</option>
                          <option value="health">Health</option>
                          <option value="environment">Environment</option>
                          <option value="community">Community</option>
                          <option value="emergency">Emergency Relief</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#1C1C26] rounded-lg border border-gray-700">
                        <div>
                          <span className="block text-sm font-medium text-gray-300 mb-1">
                            Public Campaign
                          </span>
                          <span className="text-xs text-gray-500">
                            Visible to all donors
                          </span>
                        </div>
                        <Switch checked={isPublic} onChange={setIsPublic} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold mb-4">Campaign Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-input-glow">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Start Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                            className="bg-[#1C1C26] border-gray-700 pl-10"
                          />
                        </div>
                      </div>

                      <div className="form-input-glow">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          End Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                            className="bg-[#1C1C26] border-gray-700 pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[#1C1C26] rounded-lg border border-gray-700">
                      <h4 className="text-lg font-semibold mb-4">Campaign Features</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={true} onChange={() => {}} />
                          <span className="text-sm text-gray-300">Enable recurring donations</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={true} onChange={() => {}} />
                          <span className="text-sm text-gray-300">Allow anonymous donations</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={false} onChange={() => {}} />
                          <span className="text-sm text-gray-300">Enable donation matching</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={true} onChange={() => {}} />
                          <span className="text-sm text-gray-300">Send thank you emails automatically</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#1C1C26] rounded-lg border border-gray-700 text-center">
                        <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-1">$50,000</div>
                        <div className="text-xs text-gray-400">Target Goal</div>
                      </div>
                      <div className="p-4 bg-[#1C1C26] rounded-lg border border-gray-700 text-center">
                        <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-1">500+</div>
                        <div className="text-xs text-gray-400">Expected Donors</div>
                      </div>
                      <div className="p-4 bg-[#1C1C26] rounded-lg border border-gray-700 text-center">
                        <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-1">60 days</div>
                        <div className="text-xs text-gray-400">Campaign Duration</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Media */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold mb-4">Campaign Media</h3>

                    {/* File Upload Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                        isDragging
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700 bg-[#1C1C26] hover:border-gray-600'
                      }`}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Drop files here or click to upload</h4>
                      <p className="text-sm text-gray-400 mb-4">
                        Support for images, videos, and documents (Max 10MB each)
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm">
                        Browse Files
                      </Button>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold">Uploaded Files ({uploadedFiles.length})</h4>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-[#1C1C26] rounded-lg border border-gray-700"
                          >
                            {getFileIcon(file)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{file.name}</div>
                              <div className="text-sm text-gray-400">{formatFileSize(file.size)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                              <Badge variant="success" className="text-xs">Complete</Badge>
                              <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <X className="w-5 h-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold mb-4">Review & Submit</h3>

                    <div className="glass-effect p-6 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4">Campaign Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-400">Campaign Name</span>
                          <div className="font-medium">{campaignName || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Goal Amount</span>
                          <div className="font-medium">${campaignGoal || '0'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Category</span>
                          <div className="font-medium capitalize">{category || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Duration</span>
                          <div className="font-medium">
                            {startDate && endDate ? `${startDate} to ${endDate}` : 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Visibility</span>
                          <div className="font-medium">{isPublic ? 'Public' : 'Private'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Media Files</span>
                          <div className="font-medium">{uploadedFiles.length} file(s)</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#1C1C26] rounded-lg border border-gray-700">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={acceptTerms} onChange={setAcceptTerms} />
                        <div className="text-sm text-gray-300">
                          I agree to the <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and{' '}
                          <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>. I confirm that all information provided is accurate.
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold mb-1">Ready to Launch!</h5>
                          <p className="text-sm text-gray-300">
                            Your campaign is ready to be published. Click the submit button below to make it live.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentStep === step.id
                          ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                          : currentStep > step.id
                          ? 'bg-green-500'
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < totalSteps ? (
                  <Button
                    variant="primary"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={!acceptTerms}
                    className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Campaign
                  </Button>
                )}
              </div>
            </Card>
          </section>

        </div>
      </Container>
    </div>
  );
}

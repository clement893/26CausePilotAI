'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import Checkbox from '@/components/ui/Checkbox';
import { 
  Sparkles, 
  Rocket, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Info,
  XCircle,
  Download,
  Upload,
  Search,
  Mail,
  Phone,
  Zap,
  Shield,
  Award
} from 'lucide-react';

/**
 * Components Showcase Demo Page
 * 
 * A comprehensive showcase of all modernized UI components with the new design system.
 * Features dark UI, gradients, glassmorphism, and micro-interactions.
 */
export default function DemoComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#13131A]">
        <Container>
          <div className="py-12">
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              Components Showcase
            </h1>
            <p className="text-xl text-[#A0A0B0] max-w-3xl">
              A comprehensive showcase of all modernized UI components with dark theme, 
              vibrant gradients, glassmorphism effects, and smooth micro-interactions.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="space-y-16">
          
          {/* Section: Buttons & Actions */}
          <section id="buttons" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Buttons & Actions</h2>
              <p className="text-[#A0A0B0]">
                Modern button components with multiple variants, sizes, and interactive states.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Buttons */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  Primary Buttons
                </h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Primary Button
                  </Button>
                  <Button variant="primary" className="w-full" disabled>
                    Disabled State
                  </Button>
                </div>
              </Card>

              {/* Gradient Buttons */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Gradient Buttons
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Gradient Primary
                  </button>
                  <button className="w-full px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Gradient Success
                  </button>
                </div>
              </Card>

              {/* Outline Buttons */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Outline Buttons
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    Outline Button
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Ghost Button
                  </Button>
                </div>
              </Card>

              {/* Icon Buttons */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-500" />
                  With Icons
                </h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="primary" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </Card>

              {/* Button Sizes */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
                <div className="space-y-3">
                  <Button variant="primary" size="sm" className="w-full">
                    Small Button
                  </Button>
                  <Button variant="primary" size="md" className="w-full">
                    Medium Button
                  </Button>
                  <Button variant="primary" size="lg" className="w-full">
                    Large Button
                  </Button>
                </div>
              </Card>

              {/* Loading State */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Loading States</h3>
                <div className="space-y-3">
                  <Button variant="primary" loading className="w-full">
                    Loading...
                  </Button>
                  <Button variant="outline" loading className="w-full">
                    Processing...
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Section: Form Elements */}
          <section id="forms" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Form Elements</h2>
              <p className="text-[#A0A0B0]">
                Modern form inputs with floating labels, neon focus states, and validation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Text Inputs */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  Text Inputs
                </h3>
                <div className="space-y-4">
                  <div className="form-input-glow">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-[#1C1C26] border-gray-700"
                    />
                  </div>
                  <div className="form-input-glow">
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-[#1C1C26] border-gray-700"
                    />
                  </div>
                </div>
              </Card>

              {/* Input with Icons */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-500" />
                  With Icons
                </h3>
                <div className="space-y-4">
                  <div className="form-input-glow relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="bg-[#1C1C26] border-gray-700 pl-10"
                    />
                  </div>
                  <div className="form-input-glow relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="bg-[#1C1C26] border-gray-700 pl-10"
                    />
                  </div>
                </div>
              </Card>

              {/* Toggles */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Switches & Toggles</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Enable notifications</span>
                    <Switch checked={switchValue} onChange={setSwitchValue} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Dark mode</span>
                    <Switch checked={true} onChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Auto-save</span>
                    <Switch checked={false} onChange={() => {}} />
                  </div>
                </div>
              </Card>

              {/* Checkboxes */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Checkboxes</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={checkboxValue} onChange={setCheckboxValue} />
                    <span className="text-sm text-gray-300">I agree to the terms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={true} onChange={() => {}} />
                    <span className="text-sm text-gray-300">Subscribe to newsletter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={false} onChange={() => {}} />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section: Cards & Containers */}
          <section id="cards" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Cards & Containers</h2>
              <p className="text-[#A0A0B0]">
                Versatile card components with glassmorphism, gradient borders, and hover effects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Default Card */}
              <Card className="p-6 bg-[#13131A] border border-gray-800 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Default Card</h3>
                    <p className="text-sm text-gray-400">Standard style</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  A standard card with subtle shadow and hover lift effect.
                </p>
              </Card>

              {/* Glass Card */}
              <div className="glass-effect p-6 rounded-lg hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Glass Card</h3>
                    <p className="text-sm text-gray-400">Glassmorphism</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  Card with glassmorphism effect using backdrop blur.
                </p>
              </div>

              {/* Gradient Border Card */}
              <div className="relative p-[1px] rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover-lift">
                <div className="bg-[#13131A] rounded-[7px] p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Gradient Border</h3>
                      <p className="text-sm text-gray-400">Premium style</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    Card with animated gradient border for premium content.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Badges & Labels */}
          <section id="badges" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Badges & Labels</h2>
              <p className="text-[#A0A0B0]">
                Status badges with colors, gradients, and icons for various use cases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Colored Badges */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Colored Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge>Default</Badge>
                </div>
              </Card>

              {/* Gradient Badges */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Gradient Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500">
                    Premium
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-green-500 to-cyan-500">
                    Active
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500">
                    Hot
                  </span>
                </div>
              </Card>

              {/* Badges with Icons */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">With Icons</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                  <Badge variant="warning">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                  <Badge variant="error">
                    <XCircle className="w-3 h-3 mr-1" />
                    Failed
                  </Badge>
                </div>
              </Card>
            </div>
          </section>

          {/* Section: Feedback Components */}
          <section id="feedback" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Feedback Components</h2>
              <p className="text-[#A0A0B0]">
                Alerts, progress bars, and notifications to provide user feedback.
              </p>
            </div>

            <div className="space-y-6">
              {/* Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Alert variant="success" className="bg-[#13131A] border-l-4 border-l-green-500">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Success!</h4>
                    <p className="text-sm text-gray-300">Your changes have been saved successfully.</p>
                  </div>
                </Alert>

                <Alert variant="warning" className="bg-[#13131A] border-l-4 border-l-yellow-500">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h4 className="font-semibold">Warning</h4>
                    <p className="text-sm text-gray-300">Please review your input before submitting.</p>
                  </div>
                </Alert>

                <Alert variant="error" className="bg-[#13131A] border-l-4 border-l-red-500">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-semibold">Error</h4>
                    <p className="text-sm text-gray-300">An error occurred while processing your request.</p>
                  </div>
                </Alert>

                <Alert variant="info" className="bg-[#13131A] border-l-4 border-l-blue-500">
                  <Info className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Information</h4>
                    <p className="text-sm text-gray-300">New features are now available in your dashboard.</p>
                  </div>
                </Alert>
              </div>

              {/* Progress Bars */}
              <Card className="p-6 bg-[#13131A] border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Progress Bars</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Upload Progress</span>
                      <span className="text-gray-400">75%</span>
                    </div>
                    <div className="w-full bg-[#1C1C26] rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Campaign Goal</span>
                      <span className="text-gray-400">90%</span>
                    </div>
                    <div className="w-full bg-[#1C1C26] rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-green-500 to-cyan-500 h-2.5 rounded-full animate-pulse" style={{ width: '90%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Storage Used</span>
                      <span className="text-gray-400">45%</span>
                    </div>
                    <div className="w-full bg-[#1C1C26] rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section: Overlays */}
          <section id="overlays" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Overlays & Modals</h2>
              <p className="text-[#A0A0B0]">
                Modal dialogs with glassmorphism backdrop and smooth animations.
              </p>
            </div>

            <Card className="p-6 bg-[#13131A] border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Modal Example</h3>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>

              <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
                <div className="space-y-4">
                  <p className="text-gray-300">
                    This is a modern modal with glassmorphism backdrop and smooth animations.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                      Confirm
                    </Button>
                  </div>
                </div>
              </Modal>
            </Card>
          </section>

        </div>
      </Container>
    </div>
  );
}

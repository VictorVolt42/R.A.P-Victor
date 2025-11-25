import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, Image as ImageIcon, ArrowRight, Check, X, Smartphone } from 'lucide-react';
import Button from '../components/Button';
import { db } from '../db';
import { QRCodeSVG } from 'qrcode.react';

// Steps definition
const STEPS = [
  { id: 'target', title: 'Target Image', icon: ImageIcon, desc: 'Upload the image to be tracked' },
  { id: 'content', title: 'Video Overlay', icon: Film, desc: 'Upload the video to play' },
  { id: 'preview', title: 'Finish', icon: Smartphone, desc: 'Generate your QR code' },
];

const CreateExperience: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [contentVideo, setContentVideo] = useState<File | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  // Preview URLs
  const [targetPreview, setTargetPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTargetImage(file);
      setTargetPreview(URL.createObjectURL(file));
      if (!name) setName(file.name.split('.')[0]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContentVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!targetImage || !contentVideo || !name) return;

    setIsProcessing(true);
    try {
      // In a real app, we would send files to backend and wait for the compiled .mind file.
      // Here we just save the blobs to IndexedDB. The "compilation" happens in the viewer for this demo.
      const id = await db.projects.add({
        name,
        targetImageBlob: targetImage,
        contentVideoBlob: contentVideo,
        createdAt: new Date(),
      });
      setCreatedId(id as number);
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to save project", error);
      alert("Failed to save project. Ensure your browser supports IndexedDB and you have enough space.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full" />
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center bg-slate-900 px-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isActive || isCompleted 
                      ? 'bg-brand-600 border-brand-600 text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-brand-400' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        {/* Step 1: Target Image */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Target Image</h2>
              <p className="text-slate-400">This is the image your camera will recognize in the real world (e.g., a poster, a card).</p>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-brand-500 rounded-xl p-8 transition-colors bg-slate-900/50">
              {targetPreview ? (
                <div className="relative w-full max-w-sm aspect-[3/4] md:aspect-video rounded-lg overflow-hidden shadow-lg group">
                  <img src={targetPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setTargetImage(null); setTargetPreview(''); }}
                    className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer w-full h-full">
                  <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:bg-slate-700">
                    <Upload className="w-8 h-8 text-brand-500" />
                  </div>
                  <span className="text-lg font-medium text-white mb-1">Click to upload image</span>
                  <span className="text-sm text-slate-500">JPG or PNG (Max 5MB)</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png"
                    onChange={handleTargetUpload}
                  />
                </label>
              )}
            </div>

            {targetImage && (
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      placeholder="My AR Experience"
                    />
                 </div>
                 <div className="flex justify-end">
                    <Button onClick={() => setCurrentStep(1)} disabled={!name}>
                      Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Content Video */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Overlay Video</h2>
              <p className="text-slate-400">This video will play on top of the image when detected.</p>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-brand-500 rounded-xl p-8 transition-colors bg-slate-900/50">
               {videoPreview ? (
                <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
                  <video src={videoPreview} controls className="w-full h-full" />
                  <button 
                    onClick={() => { setContentVideo(null); setVideoPreview(''); }}
                    className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer w-full h-full">
                  <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:bg-slate-700">
                    <Film className="w-8 h-8 text-purple-500" />
                  </div>
                  <span className="text-lg font-medium text-white mb-1">Click to upload video</span>
                  <span className="text-sm text-slate-500">MP4 or WebM (Max 20MB recommended)</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="video/mp4, video/webm"
                    onChange={handleVideoUpload}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(0)}>
                Back
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!contentVideo || isProcessing}
                className={isProcessing ? 'opacity-80' : ''}
              >
                {isProcessing ? 'Processing...' : 'Create Experience'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && createdId && (
           <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white">Experience Created!</h2>
              <p className="text-slate-400 max-w-md">
                Your WebAR experience is ready. Scan the QR code below with your mobile device to test it.
              </p>
              
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG 
                    value={`${window.location.origin}${window.location.pathname}#/view/${createdId}`}
                    size={200}
                    level="H"
                />
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm max-w-md">
                 <strong>Important:</strong> Because this is a client-side demo without a server, this QR code will likely only work on <em>this device</em> or if you sync the IndexedDB data. In a production app, this link would work globally.
              </div>

              <div className="flex gap-4 pt-4">
                 <Button variant="outline" onClick={() => navigate('/')}>
                    Back to Dashboard
                 </Button>
                 <Button onClick={() => window.open(`#/view/${createdId}`, '_blank')}>
                    Test in New Tab
                 </Button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default CreateExperience;
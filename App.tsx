
import React, { useState, useCallback } from 'react';
import { GenerationType, AspectRatio } from './types';
import { generateImage } from './services/geminiService';
import Spinner from './components/Spinner';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.Thumbnail);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    const aspectRatio: AspectRatio = generationType === GenerationType.Thumbnail ? '16:9' : '1:1';
    
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, generationType, isLoading]);
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${generationType}-${prompt.slice(0, 20).replace(/\s/g, '_')}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGenerationTypeButtonClass = (type: GenerationType) => {
    const baseClasses = 'relative flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold transition-colors duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
    return generationType === type
      ? `${baseClasses} bg-violet-600 text-white shadow-lg`
      : `${baseClasses} bg-slate-800 text-slate-300 hover:bg-slate-700`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Controls */}
        <div className="lg:w-1/3 w-full flex flex-col gap-6">
          <header className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
              AI Thumbnail & Logo Hub
            </h1>
            <p className="text-slate-400 mt-2">
              Craft stunning visuals in seconds.
            </p>
          </header>

          <div className="flex flex-col gap-4 p-5 bg-slate-800/50 rounded-xl border border-slate-700">
            <label htmlFor="prompt" className="font-semibold text-slate-300">
              1. Describe your vision
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A vibrant synthwave sunset over a futuristic city"
              className="w-full h-32 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none transition resize-none"
            />
          </div>
          
          <div className="flex flex-col gap-4 p-5 bg-slate-800/50 rounded-xl border border-slate-700">
             <label className="font-semibold text-slate-300">
              2. Choose your format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setGenerationType(GenerationType.Thumbnail)} className={getGenerationTypeButtonClass(GenerationType.Thumbnail)}>
                <Icon icon="thumbnail" className="w-5 h-5" />
                Thumbnail
              </button>
              <button onClick={() => setGenerationType(GenerationType.Logo)} className={getGenerationTypeButtonClass(GenerationType.Logo)}>
                <Icon icon="logo" className="w-5 h-5" />
                Logo
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner /> Generating...
              </>
            ) : (
              <>
                <Icon icon="sparkles" className="w-6 h-6" />
                Generate
              </>
            )}
          </button>
          
          {error && <p className="text-red-400 text-sm text-center bg-red-900/50 p-3 rounded-md">{error}</p>}
        </div>

        {/* Right Panel: Image Display */}
        <div className="lg:w-2/3 w-full flex-grow flex items-center justify-center bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-700 p-4 min-h-[400px] lg:min-h-0">
          <div className={`w-full h-full flex items-center justify-center ${generationType === GenerationType.Thumbnail ? 'aspect-video' : 'aspect-square'}`}>
            {isLoading ? (
               <div className="flex flex-col items-center gap-4 text-slate-400">
                <Spinner />
                <span className="animate-pulse">Conjuring pixels...</span>
              </div>
            ) : generatedImage ? (
                <div className="relative w-full h-full group">
                  <img src={generatedImage} alt={prompt} className="object-contain w-full h-full rounded-lg shadow-2xl" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all transform hover:scale-110">
                          <Icon icon="download" className="w-5 h-5" />
                          Download
                      </button>
                   </div>
                </div>
            ) : (
              <div className="text-center text-slate-500">
                <Icon icon="sparkles" className="w-16 h-16 mx-auto opacity-20"/>
                <p className="mt-4">Your generated masterpiece will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

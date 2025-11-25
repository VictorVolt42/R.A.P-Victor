import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../db';
import MindARViewer from '../components/MindARViewer';
import { Loader2, ArrowLeft } from 'lucide-react';

const ViewExperience: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ target: string, video: string } | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const project = await db.projects.get(parseInt(id));
        if (project) {
          // Create object URLs for the viewer
          // Note: In production, these would be CDN URLs
          const targetUrl = URL.createObjectURL(project.targetImageBlob);
          const videoUrl = URL.createObjectURL(project.contentVideoBlob);
          setData({ target: targetUrl, video: videoUrl });
        }
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        setLoading(false);
      }
    };

    loadProject();

    return () => {
        // Cleanup object URLs to avoid memory leaks
        if(data) {
            URL.revokeObjectURL(data.target);
            URL.revokeObjectURL(data.video);
        }
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Experience Not Found</h2>
        <p className="text-slate-400 mb-8">This experience might have been deleted or does not exist on this device.</p>
        <Link to="/" className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center">
             <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative">
       {/* Back Button Overlay */}
       <Link to="/" className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-black/60 transition-colors">
          <ArrowLeft className="w-6 h-6" />
       </Link>
       
       <MindARViewer targetImageSrc={data.target} videoSrc={data.video} />
    </div>
  );
};

export default ViewExperience;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Smartphone, Loader2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import Button from '../components/Button';
import { ARProject } from '../types';

const Dashboard: React.FC = () => {
  const projects = useLiveQuery(() => db.projects.toArray());
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await db.projects.delete(id);
    setDeletingId(null);
  };

  if (!projects) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Experiences</h1>
          <p className="text-slate-400">Manage your AR projects and scan QR codes.</p>
        </div>
        <Link to="/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Create New AR
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="bg-slate-700/50 p-4 rounded-full mb-6">
            <Smartphone className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No experiences yet</h3>
          <p className="text-slate-400 max-w-md mb-8">
            Start by uploading a target image and a video to create your first WebAR experience.
          </p>
          <Link to="/create">
            <Button variant="outline">Create your first experience</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} isDeleting={deletingId === project.id} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ 
  project: ARProject; 
  onDelete: (id: number) => void; 
  isDeleting: boolean 
}> = ({ project, onDelete, isDeleting }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Create an object URL for the preview image
    const url = URL.createObjectURL(project.targetImageBlob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [project.targetImageBlob]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-brand-500/50 transition-colors group">
      <div className="relative aspect-video bg-slate-900">
        {imageUrl ? (
          <img src={imageUrl} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
            <button 
                onClick={() => project.id && onDelete(project.id)}
                className="p-2 bg-slate-900/80 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg mb-1 truncate">{project.name}</h3>
        <p className="text-xs text-slate-400 mb-4">Created {project.createdAt.toLocaleDateString()}</p>
        
        <Link to={`/view/${project.id}`} className="block">
            <Button variant="secondary" fullWidth>
                <Smartphone className="w-4 h-4 mr-2" />
                Launch AR
            </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
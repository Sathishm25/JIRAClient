import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { generateProjectCode } from '../../utils/ProjectCode';
import { API_END_POINT } from '../../settings';

interface ProjectOption {
  id: string;
  name: string;
}

const issueTypeOptions = ['Bug', 'Task', 'Story'];
const priorityTypeOptions = ['Low', 'Medium', 'High'];

const CreateIssue = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Fetch all projects for dropdown, but select current by default
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_END_POINT}/api/projects`,);
        setProjects(res.data.projects || res.data);
      } catch {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    setValue('projectId', projectId);
  }, [projectId, setValue]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: any) => {
    try {
      const userDetails = sessionStorage.getItem('userdetails');
      if (!userDetails) {
        showToast('error', 'User details not found. Please log in again.');
        return;
      }
      const user = JSON.parse(userDetails);
      if (!user.id) {
        showToast('error', 'User ID not found. Please log in again.');
        return;
      }
      if (!data.projectId) {
        showToast('error', 'Project ID is required');
        return;
      }
      await axios.post(`${API_END_POINT}/api/issues`, { ...data, description, code: generateProjectCode(data.title), projectId, reporterId: user.id, status: 'To Do' });
      showToast('success', 'Issue created successfully!');
      setTimeout(() => navigate(-1), 1200);
    } catch (error: any) {
      showToast('error', 'Failed to create issue' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0098EB] to-blue-200 pt-24 px-4 md:px-8" style={{paddingTop: '80px'}}>
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-10 w-full max-w-4xl flex flex-col items-center mt-4 mb-8">
        <h2 className="text-2xl font-bold text-[#0098EB] mb-6 text-center">Create Issue</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Project</label>
            <select {...register('projectId', { required: true })} className="w-full px-4 py-2 rounded bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#0098EB]" disabled>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} selected={proj.id === projectId}>{proj.name}</option>
              ))}
            </select>
            {errors.projectId && <span className="text-red-500 text-xs">Project is required</span>}
          </div>
             <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Title</label>
            <input {...register('title', { required: true })} type="text" placeholder="Issue title" className="w-full px-4 py-2 rounded bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#0098EB]" />
            {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
          </div>
          <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Issue</label>
            <select {...register('type', { required: true })} className="w-full px-4 py-2 rounded bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#0098EB]">
              <option value="">Select Type</option>
              {issueTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.type && <span className="text-red-500 text-xs">Type is required</span>}
          </div>
          <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Priority</label>
            <select {...register('priority', { required: true })} className="w-full px-4 py-2 rounded bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#0098EB]">
              <option value="">Select Priority</option>
              {priorityTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.priority && <span className="text-red-500 text-xs">Priority is required</span>}
          </div>
          <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Description</label>
            <div className="bg-white rounded border border-blue-200">
              <MDEditor
                value={description}
                onChange={value => setDescription(value || '')}
                height={200}
                preview="edit"
              />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 rounded bg-[#0098EB] text-white font-bold hover:bg-[#007fc2] transition disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? 'Creating...' : 'Create Issue'}
          </button>
          <button
            type="button"
            className="w-full py-2 rounded bg-[#0098EB] text-white font-bold hover:bg-[#007fc2] transition mt-2"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
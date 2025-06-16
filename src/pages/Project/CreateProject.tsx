import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { generateProjectCode } from '../../utils/ProjectCode';
import { API_END_POINT } from '../../settings';

export default function CreateProject() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: any) => {
    try {
      await axios.post(`${API_END_POINT}/api/projects`, {...data, code: generateProjectCode(data.name)});
      showToast('success', 'Project created successfully!');
      setTimeout(() => navigate('/project'), 1200);
    } catch (error: any) {
      showToast('error', 'Failed to create project' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0098EB] to-blue-200">
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-10 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#0098EB] mb-6 text-center">Create New Project</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Name</label>
            <input {...register('name', { required: true })} type="text" placeholder="Project Name" className="w-full px-4 py-2 rounded bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#0098EB]" />
            {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
          </div>
          <div>
            <label className="block text-[#0098EB] font-semibold mb-1">Description</label>
            <textarea {...register('description')} placeholder="Project Description" className="w-full px-4 py-2 rounded bg-blue-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#0098EB] resize-none" rows={4} />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2 rounded bg-[#0098EB] text-white font-bold hover:bg-[#007fc2] transition disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate('/project')}
          className="mt-6 w-full py-2 rounded bg-[#0098EB] text-white font-bold hover:bg-[#007fc2] transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

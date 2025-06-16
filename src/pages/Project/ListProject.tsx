import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { API_END_POINT } from '../../settings';
 
interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
 
const PAGE_SIZE = 10;
 
const ListProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();
 
   const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_END_POINT}/api/projects`);
        const allProjects = res.data.projects || res.data;
        setTotal(allProjects.length || 0);
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        setProjects(allProjects.slice(start, end));
      } catch (err) {
        setProjects([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
 
  useEffect(() => {
    fetchProjects();
  }, [page]);
 
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
 
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };
 
  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_END_POINT}/api/projects/${id}`);
      showToast('success', 'Project deleted successfully!');
      setShowDeleteModal(null);
      fetchProjects();
    } catch (error: any) {
      showToast('error', 'Failed to delete project' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    } finally {
      setDeleteLoading(false);
    }
  };
 
  return (
    <div style={{ width: '95%', marginTop: '48px' }} className="mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#0098EB]">Projects</h1>
        <button
          className="bg-[#0098EB] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#007fc2] transition"
          onClick={() => navigate('/project/create')}
          type="button"
        >
          Create New Project  
        </button>
      </div>
      <div className="overflow-x-auto bg-white bg-opacity-90 rounded-lg shadow">
        <table className="min-w-full w-full text-left">
          <thead>
            <tr className="bg-[#0098EB] text-white">
              {/* <th className="py-3 px-4">ID</th> */}
              <th className="py-3 px-4">Name</th>
               <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Summary</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-4">Updated At</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No projects found.</td></tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-b hover:bg-blue-50">
                  {/* <td className="py-2 px-4">{project.id}</td> */}
                  <td className="py-2 px-4 font-semibold">
                    <Link to={`/project/${project.id}/issue/list`} className="text-[#0098EB] hover:underline">
                      {project?.name}
                    </Link>
                  </td>
                   <td className="py-2 px-4 font-semibold">
                    <Link to={`/project/${project.id}/issue/list`} className="text-[#0098EB] hover:underline">
                      {project?.code}
                    </Link>
                  </td>
                  <td className="py-2 px-4">{project?.description || '-'}</td>
                  <td className="py-2 px-4">{new Date(project?.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{new Date(project?.updatedAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-center">
                    <span
                      onClick={() => navigate(`/project/${project.id}/edit`)}
                      className="inline-flex items-center justify-center p-2 rounded cursor-pointer hover:bg-blue-100 transition group mr-2"
                      title="Edit Project"
                    >
                      <FaRegEdit className="h-5 w-5 text-[#0098EB] group-hover:text-[#007fc2]" />
                    </span>
                    <span
                      onClick={() => setShowDeleteModal(project.id)}
                      className="inline-flex items-center justify-center p-2 rounded cursor-pointer hover:bg-red-100 transition group"
                      title="Delete Project"
                    >
                      <FaRegTrashAlt className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                    </span>
                  </td>
                </tr>
              ))    
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="font-semibold text-[#0098EB]">Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">Delete Project</h2>
            <p className="mb-6 text-center text-gray-700">Are you sure you want to delete this project? This action cannot be undone.</p>
            <button
              onClick={() => handleDelete(showDeleteModal)}
              disabled={deleteLoading}
              className="w-full py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed mb-2"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Project'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(null)}
              className="w-full py-2 rounded bg-gray-200 text-[#0098EB] font-bold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};
 
export default ListProject;
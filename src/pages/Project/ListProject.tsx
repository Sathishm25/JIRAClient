import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaRegEdit, FaRegTrashAlt, FaPlus, FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from 'react-icons/fa';
import { FiSearch, FiClock, FiFilter, FiGrid, FiList, FiInfo, FiClipboard, FiBarChart2, FiAlertCircle } from 'react-icons/fi';
 
interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  starred?: boolean; // Added for star functionality
  issueCount?: number; // Adding mock data for visualization
  status?: 'active' | 'inactive'; // Adding status for filtering
}
 
const PAGE_SIZE = 10;

// Sample project statuses for filtering
const PROJECT_STATUSES = ['All', 'Active', 'Inactive'];

// Sample view types
const VIEW_TYPES = [
  { id: 'grid', icon: FiGrid, label: 'Card view' },
  { id: 'list', icon: FiList, label: 'List view' }
];
 
const ListProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Project[]>([]);
  const navigate = useNavigate();
 
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/api/projects');
      let allProjects = res.data.projects || res.data;
      
      // Enhance projects with mock data for better UI
      allProjects = allProjects.map((p: Project, index: number) => ({
        ...p,
        starred: localStorage.getItem(`starred-${p.id}`) === 'true',
        issueCount: Math.floor(Math.random() * 30), // Mock issue count
        status: index % 5 === 0 ? 'inactive' : 'active' // Some inactive projects for filtering
      }));
      
      // Filter projects based on search term and status
      let filteredProjects = allProjects;
      
      if (searchTerm) {
        filteredProjects = filteredProjects.filter((p: Project) => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (filterStatus !== 'All') {
        filteredProjects = filteredProjects.filter((p: Project) => 
          p.status === filterStatus.toLowerCase()
        );
      }
      
      setTotal(filteredProjects.length || 0);
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setProjects(filteredProjects.slice(start, end));
      
      // Set recently viewed (mock data based on real projects)
      if (allProjects.length > 0) {
        setRecentlyViewed(allProjects.slice(0, 3));
      }
    } catch (err) {
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchProjects();
  }, [page, searchTerm, filterStatus]);
 
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
 
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };
 
  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/projects/${id}`);
      showToast('success', 'Project deleted successfully!');
      setShowDeleteModal(null);
      fetchProjects();
    } catch (error: any) {
      showToast('error', 'Failed to delete project' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const toggleStar = (id: string) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const newStarred = !p.starred;
        localStorage.setItem(`starred-${id}`, newStarred.toString());
        return { ...p, starred: newStarred };
      }
      return p;
    }));
  };
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects Dashboard</h1>
            <p className="text-blue-100">Manage and track all your projects in one place</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/project/create')}
              className="bg-white text-blue-700 font-medium px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <FaPlus size={14} />
              <span>Create Project</span>
            </button>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <FiClipboard className="mr-2 h-5 w-5" />
              <span className="font-medium">Total Projects</span>
            </div>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <FiBarChart2 className="mr-2 h-5 w-5" />
              <span className="font-medium">Active Projects</span>
            </div>
            <p className="text-2xl font-bold">
              {!loading ? projects.filter(p => p.status === 'active').length : '...'}
            </p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <FiAlertCircle className="mr-2 h-5 w-5" />
              <span className="font-medium">Issues Total</span>
            </div>
            <p className="text-2xl font-bold">
              {!loading ? projects.reduce((sum, p) => sum + (p.issueCount || 0), 0) : '...'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Recently viewed section */}
      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiClock className="mr-2" /> Recently Viewed
          </h2>
          <div className="flex flex-wrap gap-3">
            {recentlyViewed.map(project => (
              <Link 
                key={`recent-${project.id}`} 
                to={`/project/${project.id}/issue/list`}
                className="flex items-center bg-white px-3 py-2 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm"
              >
                <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                  {project.code.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <div className="relative flex-1 sm:min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0098EB] focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <FiFilter className="h-5 w-5" />
              <span className="hidden sm:inline">Filter</span>
              {filterStatus !== 'All' && <span className="inline-flex items-center justify-center h-5 w-5 text-xs bg-blue-500 text-white rounded-full">1</span>}
            </button>
            
            {showFilters && (
              <div className="absolute top-full mt-2 left-0 bg-white shadow-lg rounded-lg border border-gray-200 z-10 w-48 p-2">
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="space-y-1">
                    {PROJECT_STATUSES.map(status => (
                      <div 
                        key={status} 
                        onClick={() => {
                          setFilterStatus(status);
                          setPage(1);
                        }}
                        className={`px-2 py-1 text-sm rounded-md cursor-pointer ${filterStatus === status ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View type toggle */}
          <div className="bg-gray-100 p-1 rounded-md flex">
            {VIEW_TYPES.map((viewOption) => {
              const Icon = viewOption.icon;
              return (
                <button
                  key={viewOption.id}
                  onClick={() => setViewType(viewOption.id as 'grid' | 'list')}
                  title={viewOption.label}
                  className={`p-2 rounded-md ${viewType === viewOption.id ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
          
          {filterStatus !== 'All' && (
            <button
              onClick={() => {
                setFilterStatus('All');
                setPage(1);
              }}
              className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Project notification */}
      {filterStatus !== 'All' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center mb-6">
          <FiInfo className="text-blue-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Showing {filterStatus.toLowerCase()} projects. <button onClick={() => setFilterStatus('All')} className="font-medium hover:underline">View all projects</button>
          </p>
        </div>
      )}

      {/* Grid view */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="bg-white rounded-xl shadow-md p-5 animate-pulse border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center bg-white rounded-xl shadow-md py-16 border border-gray-200">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h2>
              <p className="text-gray-500 mb-6">Get started by creating your first project</p>
              <button
                onClick={() => navigate('/project/create')}
                className="bg-[#0098EB] text-white font-medium px-5 py-2 rounded-lg shadow-md hover:bg-[#007fc2] transition flex items-center gap-2"
              >
                <FaPlus size={14} />
                <span>Create Project</span>
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col border border-gray-200">
                <div className="flex items-center justify-between px-5 pt-4">
                  {project.status === 'inactive' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Inactive
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                  
                  <button
                    onClick={() => toggleStar(project.id)}
                    className={`p-1 rounded-full ${project.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title={project.starred ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {project.starred ? <FaStar size={18} /> : <FaRegStar size={18} />}
                  </button>
                </div>
                
                <Link to={`/project/${project.id}/issue/list`} className="block flex-grow p-5 pt-2">
                  <h2 className="text-xl font-bold text-[#0098EB] mb-2 hover:underline line-clamp-1">{project.name}</h2>
                  <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md mb-3">
                    {project.code}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description || 'No description provided'}</p>
                  
                  <div className="flex justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="mr-1" />
                      <span>Created on {formatDate(project.createdAt)}</span>
                    </div>
                    
                    {project.issueCount !== undefined && (
                      <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {project.issueCount} {project.issueCount === 1 ? 'issue' : 'issues'}
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="border-t px-5 py-3 flex justify-end gap-3">
                  <button
                    onClick={() => navigate(`/project/${project.id}/edit`)}
                    title="Edit Project"
                    className="p-2 text-[#0098EB] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaRegEdit size={18} />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(project.id)}
                    title="Delete Project"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaRegTrashAlt size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* List view */}
      {viewType === 'list' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
          <table className="min-w-full w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Favorite</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-row-${idx}`} className="animate-pulse border-b border-gray-100">
                    <td className="py-3 px-4"><div className="h-5 w-5 bg-gray-200 rounded-full mx-auto"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-700">No projects found</h2>
                      <p className="text-gray-500 mt-1 mb-4">Try adjusting your filters or create a new project</p>
                      <button
                        onClick={() => navigate('/project/create')}
                        className="bg-[#0098EB] text-white font-medium px-5 py-2 rounded-lg shadow-md hover:bg-[#007fc2] transition flex items-center gap-2"
                      >
                        <FaPlus size={14} />
                        <span>Create Project</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleStar(project.id)}
                        className={`p-1 ${project.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {project.starred ? <FaStar size={16} /> : <FaRegStar size={16} />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <Link 
                        to={`/project/${project.id}/issue/list`} 
                        className="text-[#0098EB] hover:underline flex items-center"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        {project.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                      {project.description || 'No description'}
                    </td>
                    <td className="py-3 px-4">
                      {project.status === 'inactive' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/project/${project.id}/edit`)}
                          title="Edit Project"
                          className="p-2 text-[#0098EB] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaRegEdit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(project.id)}
                          title="Delete Project"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaRegTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && projects.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((page - 1) * PAGE_SIZE) + 1}</span> to <span className="font-medium">{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-medium">{total}</span> projects
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors disabled:hover:bg-transparent"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <FaChevronLeft size={14} />
              <span>Previous</span>
            </button>
            
            <div className="px-4 py-2 text-sm font-medium">
              Page <span className="font-bold text-[#0098EB]">{page}</span> of <span className="font-bold">{totalPages}</span>
            </div>
            
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors disabled:hover:bg-transparent"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <span>Next</span>
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <FaRegTrashAlt size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Delete Project</h2>
            <p className="mb-6 text-center text-gray-600">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleteLoading}
                className="py-2 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div 
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all flex items-center ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <span className="mr-2">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
};
 
export default ListProject;
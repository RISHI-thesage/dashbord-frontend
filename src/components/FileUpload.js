import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const FileUpload = ({ onUploadSuccess, onUploadError, mentorId, category = 'assignment', type = 'assignment' }) => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      default:
        break;
    }
  };

  const validateFiles = () => {
    if (files.length === 0) {
      onUploadError('Please select at least one file');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3'
    ];

    for (const fileObj of files) {
      if (fileObj.size > maxSize) {
        onUploadError(`File ${fileObj.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      if (!allowedTypes.includes(fileObj.type)) {
        onUploadError(`File ${fileObj.name} has an unsupported type.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFiles()) {
      return;
    }

    if (type === 'assignment' && (!title || !mentorId)) {
      onUploadError('Please provide a title and select a mentor');
      return;
    }

    setUploading(true);

    try {
      if (type === 'task') {
        // Upload as task (single file)
        const formData = new FormData();
        formData.append('taskFile', files[0].file);
        
        const response = await uploadAPI.uploadTask(formData);
        onUploadSuccess(response.data.data);
      } else {
        // Upload as assignment
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('mentorId', mentorId);
        if (dueDate) {
          formData.append('dueDate', dueDate);
        }

        if (files.length === 1) {
          formData.append('file', files[0].file);
          const response = await uploadAPI.uploadFile(formData, 'assignment');
          onUploadSuccess(response.data.data);
        } else {
          // Multiple files
          files.forEach((fileObj, index) => {
            formData.append('files', fileObj.file);
          });
          const response = await uploadAPI.uploadMultipleFiles(formData, 'assignment');
          onUploadSuccess(response.data.data);
        }
      }

      // Reset form
      setFiles([]);
      setTitle('');
      setDescription('');
      setDueDate('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    return '📎';
  };

  return (
    <div className="file-upload-container">
      <form onSubmit={handleSubmit}>
        {type === 'assignment' && (
          <>
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={title}
                onChange={handleInputChange}
                required
                placeholder="Enter assignment title"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter assignment description"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Due Date</label>
              <input
                type="datetime-local"
                className="form-control"
                name="dueDate"
                value={dueDate}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        <div className="mb-3">
          <label className="form-label">
            {type === 'task' ? 'Upload Task File' : 'Upload Files'} *
          </label>
          
          <div 
            className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <i className="bi bi-cloud-upload fs-1 text-muted"></i>
              <p className="mt-2 mb-0">
                {dragActive 
                  ? 'Drop files here' 
                  : 'Drag and drop files here or click to browse'
                }
              </p>
              <small className="text-muted">
                Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images, Videos, Audio (Max 10MB each)
              </small>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            multiple={type !== 'task'}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv,.mp3,.wav"
          />
        </div>

        {files.length > 0 && (
          <div className="mb-3">
            <h6>Selected Files:</h6>
            <div className="selected-files">
              {files.map((fileObj) => (
                <div key={fileObj.id} className="selected-file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2">{getFileIcon(fileObj.type)}</span>
                    <div>
                      <div className="fw-medium">{fileObj.name}</div>
                      <small className="text-muted">{formatFileSize(fileObj.size)}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFile(fileObj.id)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={uploading || files.length === 0}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            `Upload ${type === 'task' ? 'Task' : 'Assignment'}`
          )}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;

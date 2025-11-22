// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Base URL
    BASE_URL: API_BASE_URL,
    
    // Admin
    ADMIN_REGISTER: `${API_BASE_URL}/AdminReg`,
    ADMIN_LOGIN: `${API_BASE_URL}/AdminLogin`,
    
    // Student
    STUDENT_REGISTER: `${API_BASE_URL}/StudentReg`,
    STUDENT_LOGIN: `${API_BASE_URL}/StudentLogin`,
    STUDENTS_ALL: `${API_BASE_URL}/Students/all`,
    STUDENT_DETAIL: (id) => `${API_BASE_URL}/Student/${id}`,
    STUDENT_UPDATE: (id) => `${API_BASE_URL}/Student/${id}`,
    STUDENT_DELETE: (id) => `${API_BASE_URL}/Student/${id}`,
    
    // Teacher
    TEACHER_REGISTER: `${API_BASE_URL}/TeacherReg`,
    TEACHER_LOGIN: `${API_BASE_URL}/TeacherLogin`,
    TEACHERS_ALL: `${API_BASE_URL}/AllTeachers`,
    TEACHER_DETAIL: (id) => `${API_BASE_URL}/Teacher/${id}`,
    TEACHER_UPDATE: (id) => `${API_BASE_URL}/Teacher/${id}`,
    TEACHER_DELETE: (id) => `${API_BASE_URL}/Teacher/${id}`,
    TEACHER_SUBJECT_UPDATE: `${API_BASE_URL}/TeacherSubject`,
    
    // Class
    CLASSES_ALL: `${API_BASE_URL}/Sclasses`,
    CLASS_CREATE: `${API_BASE_URL}/SclassCreate`,
    CLASS_DETAIL: (id) => `${API_BASE_URL}/Sclass/${id}`,
    CLASS_DELETE: (id) => `${API_BASE_URL}/Sclass/${id}`,
    
    // Subject
    SUBJECTS_ALL: (adminId) => `${API_BASE_URL}/AllSubjects/${adminId}`,
    SUBJECT_CREATE: `${API_BASE_URL}/SubjectCreate`,
    SUBJECT_DETAIL: (id) => `${API_BASE_URL}/Subject/${id}`,
    SUBJECT_DELETE: (id) => `${API_BASE_URL}/Subject/${id}`,
    CLASS_SUBJECTS: (classId) => `${API_BASE_URL}/ClassSubjects/${classId}`,
    
    // Health Check
    HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;

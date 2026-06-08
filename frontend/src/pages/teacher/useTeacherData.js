import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

/**
 * Shared hook for fetching and caching teacher data across all portal pages.
 * Returns: { teacher, students, subjects, classInfo, loading, error, refetch }
 */
const useTeacherData = () => {
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classInfo, setClassInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const teacherId = localStorage.getItem('teacherId');

    const fetchAll = useCallback(async () => {
        if (!teacherId) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch teacher details
            const teacherRes = await axios.get(`${API_BASE}/Teacher/${teacherId}`);
            const t = teacherRes.data;
            if (!t || t.message) {
                setError(t?.message || 'Teacher not found');
                setLoading(false);
                return;
            }
            setTeacher(t);

            // Update localStorage with fresh data
            localStorage.setItem('teacherData', JSON.stringify(t));
            localStorage.setItem('teacherName', t.name);
            localStorage.setItem('teacherEmail', t.email);

            // 2. Determine class ID
            const classId = t.teachSclass?._id || t.homeroomClass?._id;
            const className = t.teachSclass?.sclassName || t.homeroomClass?.sclassName || 'No Class';
            setClassInfo({ _id: classId, sclassName: className });

            // 3. Fetch class students & subjects in parallel
            if (classId) {
                const [studentsRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_BASE}/Sclass/Students/${classId}`).catch(() => ({ data: [] })),
                    axios.get(`${API_BASE}/ClassSubjects/${classId}`).catch(() => ({ data: [] }))
                ]);

                setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
                setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
            }
        } catch (err) {
            console.error('useTeacherData error:', err);
            setError('Failed to load teacher data');
        } finally {
            setLoading(false);
        }
    }, [teacherId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { teacher, students, subjects, classInfo, loading, error, refetch: fetchAll };
};

export default useTeacherData;

'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type CurriculumContextType = {
  academicLevels: any[];
  careers: any[];
  subjects: any[];
  groups: any[];
  templates: any[];
  academicYears: any[];
  bimestres: any[];
  cuatrimestres: any[];
  classrooms: any[];
  refreshData: () => void;
};

const CurriculumContext = createContext<CurriculumContextType>({
  academicLevels: [],
  careers: [],
  subjects: [],
  groups: [],
  templates: [],
  refreshData: () => {},
});

export const CurriculumProvider = ({ children }: { children: React.ReactNode }) => {
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [bimestres, setBimestres] = useState<any[]>([]);
  const [cuatrimestres, setCuatrimestres] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshData = () => setRefreshTick(t => t + 1);

  useEffect(() => {
    Promise.all([
      fetch(`/api/academic-levels?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/careers?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/subjects?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/groups?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/templates?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/academic-years?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/bimestres?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/cuatrimestres?t=${refreshTick}`).then(res => res.json()),
      fetch(`/api/classrooms?t=${refreshTick}`).then(res => res.json())
    ]).then(([alData, cData, sData, gData, tData, yData, bData, cuData, clData]) => {
      setAcademicLevels(Array.isArray(alData) ? alData : []);
      setCareers(Array.isArray(cData) ? cData : []);
      setSubjects(Array.isArray(sData) ? sData : []);
      setGroups(Array.isArray(gData) ? gData : []);
      setTemplates(Array.isArray(tData) ? tData : []);
      setAcademicYears(Array.isArray(yData) ? yData : []);
      setBimestres(Array.isArray(bData) ? bData : []);
      setCuatrimestres(Array.isArray(cuData) ? cuData : []);
      setClassrooms(Array.isArray(clData) ? clData : []);
    }).catch(console.error);
  }, [refreshTick]);

  return (
    <CurriculumContext.Provider value={{ academicLevels, careers, subjects, groups, templates, academicYears, bimestres, cuatrimestres, classrooms, refreshData }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => useContext(CurriculumContext);

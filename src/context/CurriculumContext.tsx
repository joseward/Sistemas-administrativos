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
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshData = () => setRefreshTick(t => t + 1);

  useEffect(() => {
    Promise.all([
      fetch('/api/academic-levels').then(res => res.json()),
      fetch('/api/careers').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json()),
      fetch('/api/groups').then(res => res.json()),
      fetch('/api/templates').then(res => res.json()),
      fetch('/api/academic-years').then(res => res.json()),
      fetch('/api/bimestres').then(res => res.json()),
      fetch('/api/cuatrimestres').then(res => res.json())
    ]).then(([alData, cData, sData, gData, tData, yData, bData, cuData]) => {
      setAcademicLevels(Array.isArray(alData) ? alData : []);
      setCareers(Array.isArray(cData) ? cData : []);
      setSubjects(Array.isArray(sData) ? sData : []);
      setGroups(Array.isArray(gData) ? gData : []);
      setTemplates(Array.isArray(tData) ? tData : []);
      setAcademicYears(Array.isArray(yData) ? yData : []);
      setBimestres(Array.isArray(bData) ? bData : []);
      setCuatrimestres(Array.isArray(cuData) ? cuData : []);
    }).catch(console.error);
  }, [refreshTick]);

  return (
    <CurriculumContext.Provider value={{ academicLevels, careers, subjects, groups, templates, academicYears, bimestres, cuatrimestres, refreshData }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => useContext(CurriculumContext);

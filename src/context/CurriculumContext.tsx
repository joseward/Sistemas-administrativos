'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type CurriculumContextType = {
  academicLevels: any[];
  careers: any[];
  subjects: any[];
  groups: any[];
  templates: any[];
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
  const [tick, setTick] = useState(0);

  const refreshData = () => setTick(t => t + 1);

  useEffect(() => {
    Promise.all([
      fetch('/api/academic-levels').then(res => res.json()),
      fetch('/api/careers').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json()),
      fetch('/api/groups').then(res => res.json()),
      fetch('/api/templates').then(res => res.json())
    ]).then(([alData, cData, sData, gData, tData]) => {
      setAcademicLevels(Array.isArray(alData) ? alData : []);
      setCareers(Array.isArray(cData) ? cData : []);
      setSubjects(Array.isArray(sData) ? sData : []);
      setGroups(Array.isArray(gData) ? gData : []);
      setTemplates(Array.isArray(tData) ? tData : []);
    }).catch(console.error);
  }, [tick]);

  return (
    <CurriculumContext.Provider value={{ academicLevels, careers, subjects, groups, templates, refreshData }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => useContext(CurriculumContext);

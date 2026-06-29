'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { MOCK_USERS, type MockUser } from '@/lib/mockData';
import { UserForm } from '@/components/usuarios/UserForm';
import { ChangePasswordModal } from '@/components/usuarios/ChangePasswordModal';
import { TeacherForm } from '@/components/teachers/TeacherForm';

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'docente'>('admin');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<any | null>(null);
  
  // Para Docentes
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => u.role === activeTab);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        const formattedUsers = data.data.map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Administrador',
          email: u.email,
          role: u.role,
          status: u.status,
          blockReason: u.blockReason,
          // If the backend returns teacherId or if we link by email
          teacherId: u.teacherId || null,
        }));
        setUsers(formattedUsers);
      } else if (Array.isArray(data)) {
        const formattedUsers = data.map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Administrador',
          email: u.email,
          role: u.role,
          status: u.status,
          blockReason: u.blockReason,
          teacherId: u.teacherId || null,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const loadTeachers = useCallback(async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadTeachers();
  }, [loadUsers, loadTeachers]);

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleRemove = async (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          loadUsers();
        } else {
          alert('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleUnblock = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas desbloquear a este usuario para permitirle el acceso nuevamente?')) {
      try {
        const response = await fetch(`/api/users/${id}/unblock`, { method: 'PUT' });
        if (response.ok) {
          loadUsers();
          alert('Usuario desbloqueado exitosamente.');
        } else {
          alert('Error al desbloquear usuario');
        }
      } catch (error) {
        console.error('Error al desbloquear:', error);
      }
    }
  };

  const handleSuccess = () => {
    loadUsers();
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          Regresar al inicio
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#061266]">🔐 Gestión de Accesos y Usuarios</h1>
            <p className="text-gray-600 mt-2">
              Administra las cuentas del personal administrativo y verifica el acceso de los docentes.
            </p>
          </div>
          {activeTab === 'admin' ? (
            <Button size="lg" onClick={handleCreate} className="shadow-lg">
              + Nuevo Administrador
            </Button>
          ) : (
            <Link href="/dashboard/teachers">
              <Button size="lg" className="shadow-lg bg-emerald-600 hover:bg-emerald-700">
                + Nuevo Docente
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-colors ${
                activeTab === 'admin'
                  ? 'border-b-4 border-[#061266] text-[#061266] bg-blue-50/50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              🛠️ Administradores (Backend)
            </button>
            <button
              onClick={() => setActiveTab('docente')}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-colors ${
                activeTab === 'docente'
                  ? 'border-b-4 border-[#061266] text-[#061266] bg-blue-50/50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              👨‍🏫 Docentes (Frontend)
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'docente' && (
              <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-200">
                ℹ️ <strong>Nota:</strong> Los usuarios docentes se crean y eliminan automáticamente desde la sección de <strong>Gestión de Maestros</strong> para mantener la sincronización.
              </div>
            )}

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Correo / Usuario</th>
                    <th className="px-6 py-4 font-semibold text-center">Estado</th>
                    <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No hay usuarios {activeTab === 'admin' ? 'administradores' : 'docentes'} registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={user.status === 'active' ? 'success' : user.status === 'blocked' ? 'danger' : 'warning'}>
                            {user.status === 'active' ? 'Activo' : user.status === 'blocked' ? 'Bloqueado' : 'Inactivo'}
                          </Badge>
                          {user.status === 'blocked' && (
                            <p className="text-[10px] text-red-500 mt-1 max-w-[150px] mx-auto leading-tight">{user.blockReason}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {user.status === 'blocked' && (
                              <Button size="sm" onClick={() => handleUnblock(user.id)} className="bg-orange-500 hover:bg-orange-600 text-white">
                                🔓 Desbloquear
                              </Button>
                            )}
                            {user.role === 'admin' ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>Editar</Button>
                                <Button size="sm" variant="secondary" onClick={() => setChangingPasswordUser(user)}>Contraseña</Button>
                                <Button size="sm" variant="danger" onClick={() => handleRemove(user.id)}>Eliminar</Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => {
                                  // Find the teacher by email
                                  const teacher = teachers.find(t => t.email === user.email);
                                  setEditingTeacherId(teacher ? teacher.id : null);
                                  setIsTeacherFormOpen(true);
                                }}>
                                  Editar Docente
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setChangingPasswordUser(user)}>
                                  Contraseña
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
        editingUser={editingUser}
      />
      
      <ChangePasswordModal
        isOpen={!!changingPasswordUser}
        onClose={() => setChangingPasswordUser(null)}
        user={changingPasswordUser}
        onSuccess={handleSuccess}
      />

      <TeacherForm
        isOpen={isTeacherFormOpen}
        onClose={() => setIsTeacherFormOpen(false)}
        onSuccess={() => {
          handleSuccess();
          loadTeachers();
        }}
        schoolId="main-school"
        editingTeacher={editingTeacherId ? teachers.find(t => t.id === editingTeacherId) : null}
      />
    </div>
  );
}

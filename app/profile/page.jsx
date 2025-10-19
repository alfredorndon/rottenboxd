/**
 * Profile Page
 * Solo para editar y eliminar perfil de usuario
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchUser() {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        
        if (res.ok) {
          setUser(data.user);
          setFormData(prev => ({
            ...prev,
            name: data.user.name,
          }));
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updateData = {
        name: formData.name,
      };

      // Solo incluir contraseña si se proporciona
      if (formData.newPassword.trim()) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setSaving(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Perfil actualizado exitosamente');
        setUser(data.user);
        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setError(data.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      setError('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    if (!confirm('ÚLTIMA CONFIRMACIÓN: Se eliminarán todos tus datos, ratings y la cuenta permanentemente. ¿Continuar?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (res.ok) {
        // Cerrar sesión y redirigir
        await signOut({ callbackUrl: '/' });
      } else {
        const data = await res.json();
        setError(data.error || 'Error al eliminar cuenta');
        setDeleting(false);
      }
    } catch (error) {
      setError('Error al eliminar cuenta');
      setDeleting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Mi Perfil
        </h1>
        <p className="text-gray-400">
          Edita tu información personal o elimina tu cuenta
        </p>
      </div>

      {/* Navegación */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="text-emerald-500 hover:text-emerald-400"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 mb-6">
          <p className="text-emerald-400">{success}</p>
        </div>
      )}

      {/* Formulario de Edición */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Editar Perfil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre"
          />

          <Input
            label="Email"
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-gray-800 text-gray-500"
          />
          <p className="text-sm text-gray-500">
            El email no se puede cambiar
          </p>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cambiar Contraseña
            </h3>
            
            <div className="mb-6">
              <Input
                label="Contraseña Actual"
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="mb-6">
              <Input
                label="Nueva Contraseña"
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="mb-6">
              <Input
                label="Confirmar Nueva Contraseña"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la nueva contraseña"
              />
            </div>

            <p className="text-sm text-gray-500">
              Deja en blanco si no quieres cambiar la contraseña
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </div>

      {/* Zona de Peligro - Eliminar Cuenta */}
      <div className="bg-red-900/10 border border-red-800 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Zona de Peligro
        </h2>
        
        <p className="text-gray-400 mb-4">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Se eliminarán:
        </p>
        
        <ul className="text-gray-400 mb-6 list-disc list-inside space-y-1">
          <li>Tu perfil de usuario</li>
          <li>Todas tus calificaciones de películas</li>
          <li>Tu historial de actividad</li>
          <li>Acceso a la aplicación</li>
        </ul>

        <Button
          onClick={handleDeleteAccount}
          disabled={deleting}
          variant="outline"
          className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
        >
          {deleting ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
        </Button>
      </div>
    </div>
  );
}


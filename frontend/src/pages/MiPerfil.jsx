import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, User as UserIcon, Mail, Phone, Lock, UserCheck, Edit2, X } from 'lucide-react';

// ✅ IMPORTAMOS TU NUEVA INSTANCIA DE API
// Asegúrate de que la ruta sea correcta según donde hayas guardado api.js
// Quítale la palabra 'config'
import api from '../api';

const MiPerfil = () => {
  // Ya no necesitamos sacar el 'token' del context, el api.js se encarga de eso
  const { user } = useAuth(); 
  
  // Controla si el formulario está bloqueado o en modo edición
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Iniciamos el formulario con los datos actuales del usuario en sesión
  const [formData, setFormData] = useState({
    strNombreUsuario: user?.strnombreusuario || user?.strNombreUsuario || '',
    strCorreo: user?.strcorreo || user?.strCorreo || '',
    strNumeroCelular: user?.strnumerocelular || user?.strNumeroCelular || '',
    strPwd: '', // Siempre vacío por seguridad
    imgURL: user?.imgurl || user?.imgURL || ''
  });
  
  const [preview, setPreview] = useState(user?.imgurl || user?.imgURL || null);

  // Lógica para previsualizar y convertir la imagen a Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, imgURL: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar los cambios
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // ✅ USAMOS LA INSTANCIA DE API
      // Mira lo limpia que quedó la petición, sin configs ni localhost
      await api.put('/usuarios/perfil/update', formData);
      
      alert("¡Tu perfil ha sido actualizado exitosamente! Cierra sesión y vuelve a entrar para ver los cambios en todo el sistema.");
      
      // Limpiar la contraseña y bloquear el formulario nuevamente
      setFormData({ ...formData, strPwd: '' });
      setIsEditing(false);

    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  // Restaurar los valores si el usuario se arrepiente de editar
  const handleCancel = () => {
    setFormData({
      strNombreUsuario: user?.strnombreusuario || user?.strNombreUsuario || '',
      strCorreo: user?.strcorreo || user?.strCorreo || '',
      strNumeroCelular: user?.strnumerocelular || user?.strNumeroCelular || '',
      strPwd: '',
      imgURL: user?.imgurl || user?.imgURL || ''
    });
    setPreview(user?.imgurl || user?.imgURL || null);
    setIsEditing(false);
  };

  return (
    <div className="container py-4 animate__animated animate__fadeIn">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            
            {/* BOTÓN EDITAR (Aparece solo si NO estamos editando) */}
            {!isEditing && (
              <button 
                className="btn btn-light position-absolute top-0 end-0 mt-3 me-3 text-primary shadow-sm rounded-pill fw-bold d-flex align-items-center"
                onClick={() => setIsEditing(true)}
                style={{ zIndex: 10 }}
              >
                <Edit2 size={16} className="me-2" /> Editar
              </button>
            )}

            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 text-center">
              <h4 className="fw-bold mb-0" style={{ color: 'var(--btn-pastel-blue)' }}>Mi Configuración</h4>
              <p className="text-muted small">Actualiza tus datos personales y credenciales de acceso</p>
            </div>
            
            <div className="card-body p-4 p-md-5 pt-3">
              <form onSubmit={handleSave}>
                
                {/* SECCIÓN DE FOTO DE PERFIL */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <div 
                      className={`rounded-circle border border-4 border-white shadow bg-light overflow-hidden d-flex align-items-center justify-content-center ${isEditing ? 'cursor-pointer' : ''}`}
                      style={{ width: '130px', height: '130px' }}
                      onClick={() => isEditing && fileInputRef.current.click()}
                    >
                      {preview ? (
                        <img src={preview} className="w-100 h-100 object-fit-cover" alt="Perfil" />
                      ) : (
                        <UserIcon size={60} className="text-muted opacity-50" />
                      )}
                    </div>
                    
                    {/* Solo mostramos la cámara en modo edición */}
                    {isEditing && (
                      <div 
                        className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-2 border" 
                        style={{ cursor: 'pointer', transform: 'translate(-10px, -10px)' }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Camera size={18} className="text-primary" />
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="d-none" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                </div>

                {/* EL FIELDSET BLOQUEA LOS INPUTS AUTOMÁTICAMENTE SI NO ESTÁ EN EDICIÓN */}
                <fieldset disabled={!isEditing}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Nombre de Usuario</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><UserCheck size={16} className="text-muted"/></span>
                      <input 
                        type="text" 
                        className="form-control bg-light border-start-0 shadow-none px-0" 
                        required
                        value={formData.strNombreUsuario} 
                        onChange={e => setFormData({...formData, strNombreUsuario: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><Mail size={16} className="text-muted"/></span>
                      <input 
                        type="email" 
                        className="form-control bg-light border-start-0 shadow-none px-0" 
                        required
                        value={formData.strCorreo} 
                        onChange={e => setFormData({...formData, strCorreo: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Teléfono Celular</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><Phone size={16} className="text-muted"/></span>
                      <input 
                        type="text" 
                        className="form-control bg-light border-start-0 shadow-none px-0" 
                        placeholder="Ej. 773..."
                        value={formData.strNumeroCelular} 
                        onChange={e => setFormData({...formData, strNumeroCelular: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Campo de contraseña solo visible al editar */}
                  {isEditing && (
                    <div className="mb-4 animate__animated animate__fadeIn">
                      <label className="form-label small fw-bold text-muted">Nueva Contraseña</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><Lock size={16} className="text-muted"/></span>
                        <input 
                          type="password" 
                          className="form-control bg-light border-start-0 shadow-none px-0" 
                          placeholder="Dejar vacío para mantener la actual"
                          value={formData.strPwd} 
                          onChange={e => setFormData({...formData, strPwd: e.target.value})} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Botones de Guardar y Cancelar (Solo en edición) */}
                  {isEditing && (
                    <div className="d-flex gap-2 mt-4 animate__animated animate__fadeInUp">
                      <button 
                        type="button" 
                        className="btn btn-light w-50 fw-bold rounded-pill shadow-sm" 
                        onClick={handleCancel}
                      >
                        <X size={18} className="me-2"/> Cancelar
                      </button>
                      
                      <button 
                        type="submit" 
                        className="btn btn-pastel-blue text-white w-50 fw-bold rounded-pill shadow-sm d-flex justify-content-center align-items-center"
                        disabled={loading}
                      >
                        {loading ? 'Guardando...' : <><Save size={18} className="me-2"/> Guardar</>}
                      </button>
                    </div>
                  )}
                </fieldset>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
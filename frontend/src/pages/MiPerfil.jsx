import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, User as UserIcon, Mail, Phone, Lock, UserCheck, Edit2, X } from 'lucide-react';

// ✅ IMPORTAMOS TU NUEVA INSTANCIA DE API
import api from '../api';

const MiPerfil = () => {
  const { user } = useAuth(); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    strNombreUsuario: user?.strnombreusuario || user?.strNombreUsuario || '',
    strCorreo: user?.strcorreo || user?.strCorreo || '',
    strNumeroCelular: user?.strnumerocelular || user?.strNumeroCelular || '',
    strPwd: '', 
    imgURL: user?.imgurl || user?.imgURL || ''
  });
  
  const [preview, setPreview] = useState(user?.imgurl || user?.imgURL || null);

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

  const handleSave = async (e) => {
    e.preventDefault();

    // 🛡️ INICIO DE VALIDACIONES FRONTEND
    const nombreLimpio = formData.strNombreUsuario.trim();
    if (nombreLimpio.length < 3) {
      return alert("⚠️ El nombre de usuario debe tener al menos 3 caracteres.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.strCorreo)) {
      return alert("⚠️ Por favor, ingresa un correo electrónico válido.");
    }

    if (formData.strNumeroCelular && formData.strNumeroCelular.length !== 10) {
      return alert("⚠️ El número celular debe tener exactamente 10 dígitos.");
    }

    if (formData.strPwd && formData.strPwd.length < 6) {
      return alert("⚠️ Por seguridad, la nueva contraseña debe tener al menos 6 caracteres.");
    }
    // 🛡️ FIN DE VALIDACIONES

    try {
      setLoading(true);
      
      // Enviamos el nombre limpio de espacios extra
      const dataToSend = { ...formData, strNombreUsuario: nombreLimpio };
      
      await api.put('/usuarios/perfil/update', dataToSend);
      
      alert("¡Tu perfil ha sido actualizado exitosamente! Cierra sesión y vuelve a entrar para ver los cambios en todo el sistema.");
      
      setFormData({ ...formData, strPwd: '' });
      setIsEditing(false);

    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar tu perfil.");
    } finally {
      setLoading(false);
    }
  };

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
                        onChange={e => {
                          // 🛡️ VALIDACIÓN EN TIEMPO REAL: Solo permite números y máximo 10 dígitos
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) {
                            setFormData({...formData, strNumeroCelular: val});
                          }
                        }} 
                      />
                    </div>
                  </div>

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
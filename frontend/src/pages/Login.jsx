import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha"; // <-- Importamos Google reCAPTCHA

const Login = () => {
  const [formData, setFormData] = useState({ user: '', password: '' });
  const [captchaToken, setCaptchaToken] = useState(null); // Estado para el token de Google
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef(); // Referencia para reiniciar el captcha si hay error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validar Captcha (Front)
    if (!captchaToken) {
      setError("Por favor, verifica que no eres un robot.");
      return;
    }

    try {
      // 2. Llamada al Backend (Enviamos el captchaToken)
      const response = await axios.post('/api/auth/login', {
        strNombreUsuario: formData.user,
        strPwd: formData.password,
        captchaToken: captchaToken 
      });

      // 3. Si es exitoso, guardamos en el contexto y navegamos
      login(response.data.user, response.data.token);
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || "Error al conectar con el servidor");
      // Reiniciamos el captcha si falla el login
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
  };

  // Guardamos la llave en una constante para que el código quede más limpio
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow border-0 rounded-4 p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: 'var(--btn-pastel-blue)' }}>Panel Corporativo</h2>
          <p className="text-muted small">UTTT - Desarrollo Web Profesional</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Usuario</label>
            <input 
              type="text" className="form-control" 
              onChange={(e) => setFormData({...formData, user: e.target.value})} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Contraseña</label>
            <input 
              type="password" className="form-control" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          {/* WIDGET DE GOOGLE RECAPTCHA CON VALIDACIÓN ANTI-CRASH */}
          <div className="mb-3 d-flex justify-content-center text-center">
            {siteKey ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(token) => setCaptchaToken(token)}
              />
            ) : (
              <div className="alert alert-warning small w-100 mb-0">
                ⚠️ Falta configurar <b>VITE_RECAPTCHA_SITE_KEY</b> en el archivo .env
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-pastel-blue w-100 py-2 fw-bold text-white shadow-sm">
            INICIAR SESIÓN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
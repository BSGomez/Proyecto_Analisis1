import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const manejarLogin = (e) => {
    e.preventDefault();
    console.log('Usuario:', usuario);
    console.log('Contraseña:', contrasena);
  };

  return (
    <div style={styles.fondo}>
      <Card title="Acceso al Sistema Contable" style={styles.card}>
        <form onSubmit={manejarLogin} className="p-fluid">
          <div className="field">
            <label htmlFor="usuario" className="block mb-2">Usuario</label>
            <InputText
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div className="field" style={{ marginTop: '1rem' }}>
            <label htmlFor="contrasena" className="block mb-2">Contraseña</label>
            <Password
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Ingrese su contraseña"
              toggleMask
              feedback={false}
              required
              style={{ width: '100%' }}
              inputClassName="w-full"
            />
          </div>

          <Button
            type="submit"
            label="Ingresar"
            icon="pi pi-sign-in"
            className="p-button-primary"
            style={{ marginTop: '2rem' }}
          />
        </form>
      </Card>
    </div>
  );
};

const styles = {
  fondo: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
  }
};

export default LoginPage;


import { poolPromise } from '../db.js';
import mssql from 'mssql'; // Importar la librería mssql

// POST /routes/polizas
export const crearPoliza = async (req, res) => {
  const { Numero_Poliza, Fecha, Tipo_Poliza, Descripcion, ID_Usuario_Creacion = null } = req.body;
  if (!Numero_Poliza || !Fecha || !Tipo_Poliza) {
    return res.status(400).json({ error: 'Numero_Poliza, Fecha y Tipo_Poliza son requeridos.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Numero_Poliza',      mssql.VarChar(20),    Numero_Poliza)
      .input('Fecha',              mssql.Date,           Fecha)
      .input('Tipo_Poliza',        mssql.VarChar(10),    Tipo_Poliza)
      .input('Descripcion',        mssql.VarChar(255),   Descripcion || null)
      .input('ID_Usuario_Creacion',mssql.Int,            ID_Usuario_Creacion)
      .query(`
        INSERT INTO Polizas
          (Numero_Poliza, Fecha, Tipo_Poliza, Descripcion, ID_Usuario_Creacion)
        OUTPUT INSERTED.ID_Poliza
        VALUES
          (@Numero_Poliza, @Fecha, @Tipo_Poliza, @Descripcion, @ID_Usuario_Creacion);
      `);

    const ID_Poliza = result.recordset[0].ID_Poliza;
    res.status(201).json({ ID_Poliza });
  } catch (err) {
    console.error('Error al crear póliza:', err);
    res.status(500).json({ error: 'Error al crear póliza', details: err.message });
  }
};

// GET /routes/polizas
export const listarPolizas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        ID_Poliza   AS id,
        Numero_Poliza,
        Fecha,
        Tipo_Poliza,
        Descripcion
      FROM Polizas
      ORDER BY Fecha DESC, Numero_Poliza;
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al listar pólizas:', err);
    res.status(500).json({ error: 'Error al obtener pólizas', details: err.message });
  }
};

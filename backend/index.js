// index.js
import express from "express";
import cors from 'cors';
import mssql from "mssql";

const app = express();



// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',  // Asegúrate de que esta URL coincida con tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],  // Encabezados permitidos
}));

const dbConfig = {
    user: "sa",
    password: "1234",
    database: "testAnalisis",
    server: "127.0.0.1",
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};


let pool;
async function connectDB() {
    try {
        pool = await mssql.connect(dbConfig);
        console.log("Conexión exitosa a SQL Server");
    } catch (err) {
        console.error("Error al conectar a SQL Server:", err);
    }
}

// Conectar a la base de datos
connectDB();

// Ruta de prueba para asegurarse de que el servidor está corriendo
app.get("/routes", (req, res) => {
    res.json("Hola, este es el backend");
});

//metodo get balance de saldos para obtener todos los registros
app.get("/balanceSaldos", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        const result = await pool.request().query("SELECT * FROM CON_BALANCE_SALDOS;");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).json({ error: "Error en la consulta a la base de datos" });
    }
});

//metodo post balance de saldos para insertar registros
app.post("/balanceSaldos", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        // Obtener datos desde el body
        const { BAL_id_balance, BAL_cuenta, BAL_periodo, BAL_saldo_inicial, BAL_debito, BAL_credito, BAL_saldo_final } = req.body;

        let result = await pool.request()
            .input("BAL_id_balance", mssql.Int, BAL_id_balance)
            .input("BAL_cuenta", mssql.Int, BAL_cuenta)
            .input("BAL_periodo", mssql.VarChar, BAL_periodo)
            .input("BAL_saldo_inicial", mssql.Float, BAL_saldo_inicial)    
            .input("BAL_debito", mssql.Float, BAL_debito) 
            .input("BAL_credito", mssql.Float, BAL_credito)
            .input("BAL_saldo_final", mssql.Float, BAL_saldo_final) 
            .query(`
                INSERT INTO CON_BALANCE_SALDOS (BAL_id_balance, BAL_cuenta, BAL_periodo, BAL_saldo_inicial, BAL_debito, BAL_credito, BAL_saldo_final) 
                VALUES (@BAL_id_balance, @BAL_cuenta, @BAL_periodo, @BAL_saldo_inicial, @BAL_debito, @BAL_credito, @BAL_saldo_final);
            `);

        res.status(201).json({ message: "Registro insertado correctamente", data: result });
    } catch (err) {
        console.error("Error en la consulta INSERT:", err);
        res.status(500).json({ error: "Error en la consulta INSERT en la base de datos", details: err.message });
    }
});

// Método PUT para actualizar registros en balance de saldos
app.put("/balanceSaldos/:id", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        const { id } = req.params;
        const { BAL_cuenta, BAL_periodo, BAL_saldo_inicial, BAL_debito, BAL_credito, BAL_saldo_final } = req.body;

        let result = await pool.request()
            .input("BAL_id_balance", mssql.Int, id)
            .input("BAL_cuenta", mssql.Int, BAL_cuenta)
            .input("BAL_periodo", mssql.VarChar, BAL_periodo)
            .input("BAL_saldo_inicial", mssql.Float, BAL_saldo_inicial)
            .input("BAL_debito", mssql.Float, BAL_debito)
            .input("BAL_credito", mssql.Float, BAL_credito)
            .input("BAL_saldo_final", mssql.Float, BAL_saldo_final)
            .query(`
                UPDATE CON_BALANCE_SALDOS
                SET BAL_cuenta = @BAL_cuenta, BAL_periodo = @BAL_periodo, BAL_saldo_inicial = @BAL_saldo_inicial,
                    BAL_debito = @BAL_debito, BAL_credito = @BAL_credito, BAL_saldo_final = @BAL_saldo_final
                WHERE BAL_id_balance = @BAL_id_balance;
            `);

        res.json({ message: "Registro actualizado correctamente", data: result });
    } catch (err) {
        console.error("Error en la consulta UPDATE:", err);
        res.status(500).json({ error: "Error en la consulta UPDATE en la base de datos", details: err.message });
    }
});

// Método DELETE para eliminar registros en balance de saldos
app.delete("/balanceSaldos/:id", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        const { id } = req.params;

        let result = await pool.request()
            .input("BAL_id_balance", mssql.Int, id)
            .query(`
                DELETE FROM CON_BALANCE_SALDOS
                WHERE BAL_id_balance = @BAL_id_balance;
            `);

        res.json({ message: "Registro eliminado correctamente", data: result });
    } catch (err) {
        console.error("Error en la consulta DELETE:", err);
        res.status(500).json({ error: "Error en la consulta DELETE en la base de datos", details: err.message });
    }
});

//get cuenta contable

app.get("/cuentaContable", async (req, res)=>{
    try{
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }        

        const result = await pool.request().query("SELECT * FROM CON_CUENTA_CONTABLE;");
        res.json(result.recordset);
    }catch(err){
        console.error("Error al realizar la consulta: ", err);
        res.status(500).json({error: "Error en la consulta a la base de datos"});
    }
});

app.post("/cuentaContable", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        // Obtener datos desde el body
        const { CNT_id_cuenta, CNT_codigo, CNT_nombre, CNT_tipo, CNT_nivel, CNT_id_padre } = req.body;

        let result = await pool.request()
            .input("CNT_id_cuenta", mssql.Int, CNT_id_cuenta)
            .input("CNT_codigo", mssql.VarChar, CNT_codigo)
            .input("CNT_nombre", mssql.VarChar, CNT_nombre)
            .input("CNT_tipo", mssql.VarChar, CNT_tipo)    
            .input("CNT_nivel", mssql.Decimal, CNT_nivel) 
            .input("CNT_id_padre", mssql.VarChar, CNT_id_padre) 
            .query(`
                INSERT INTO CON_CUENTA_CONTABLE (CNT_id_cuenta, CNT_codigo, CNT_nombre, CNT_tipo, CNT_nivel, CNT_id_padre) 
                VALUES (@CNT_id_cuenta, @CNT_codigo, @CNT_nombre, @CNT_tipo, @CNT_nivel, @CNT_id_padre);
            `);

        res.status(201).json({ message: "Registro insertado correctamente", data: result });
    } catch (err) {
        console.error("Error en la consulta INSERT:", err);
        res.status(500).json({ error: "Error en la consulta INSERT en la base de datos", details: err.message });
    }
});

// Método PUT para actualizar registros en cuenta contable
app.put("/cuentaContable/:id", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        const { id } = req.params;
        const { CNT_codigo, CNT_nombre, CNT_tipo, CNT_nivel, CNT_id_padre } = req.body;

        let result = await pool.request()
            .input("CNT_id_cuenta", mssql.Int, id)
            .input("CNT_codigo", mssql.VarChar, CNT_codigo)
            .input("CNT_nombre", mssql.VarChar, CNT_nombre)
            .input("CNT_tipo", mssql.VarChar, CNT_tipo)
            .input("CNT_nivel", mssql.Decimal, CNT_nivel)
            .input("CNT_id_padre", mssql.VarChar, CNT_id_padre)
            .query(`
                UPDATE CON_CUENTA_CONTABLE
                SET CNT_codigo = @CNT_codigo, CNT_nombre = @CNT_nombre, CNT_tipo = @CNT_tipo,
                    CNT_nivel = @CNT_nivel, CNT_id_padre = @CNT_id_padre
                WHERE CNT_id_cuenta = @CNT_id_cuenta;
            `);

        res.json({ message: "Registro actualizado correctamente", data: result });
    } catch (err) {
        console.error("Error en la consulta UPDATE:", err);
        res.status(500).json({ error: "Error en la consulta UPDATE en la base de datos", details: err.message });
    }
});

// Método DELETE para eliminar registros en cuenta contable
app.delete("/cuentaContable/:id", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        const { id } = req.params;

        let result = await pool.request()
            .input("CNT_id_cuenta", mssql.Int, id)
            .query(`
                DELETE FROM CON_CUENTA_CONTABLE
                WHERE CNT_id_cuenta = @CNT_id_cuenta;
            `);

        res.json({ message: "Registro eliminado correctamente", data: result });
    } catch (err) {
        console.error("Error en la consulta DELETE:", err);
        res.status(500).json({ error: "Error en la consulta DELETE en la base de datos", details: err.message });
    }
});


//CATALOGO DE CUENTAS   
// Obtener todas las cuentas del catálogo
app.get("/CatalogoCuentas", async (req, res) => {
    try {
        const result = await pool.request().query("SELECT * FROM Catalogo_Cuentas;");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error GET Catalogo de Cuentas:", err);
        res.status(500).json({ error: "Error al obtener datos del Catalogo de Cuentas" });
    }
});

// Método POST para insertar una nueva cuenta en el catálogo
app.post("/CatalogoCuentas", async (req, res) => {
    try {
        const {
            Codigo_Cuenta,
            Nombre_Cuenta,
            Nivel,
            Cuenta_Padre,
            Tipo_Cuenta,
            Naturaleza_Cuenta
        } = req.body;

        const result = await pool.request()
            .input("Codigo_Cuenta", mssql.VarChar(50), Codigo_Cuenta)
            .input("Nombre_Cuenta", mssql.VarChar(250), Nombre_Cuenta)
            .input("Nivel", mssql.Int, Nivel)
            .input("Cuenta_Padre", mssql.VarChar(50), Cuenta_Padre)
            .input("Tipo_Cuenta", mssql.VarChar(10), Tipo_Cuenta)
            .input(" Naturaleza_Cuenta", mssql.VarChar(10), Naturaleza_Cuenta)
            .query(`
                INSERT INTO Catalogo_Cuenta
                (Codigo_Cuenta, Nombre_Cuenta, Nivel, Cuenta_Padre, Tipo_Cuenta, Naturaleza_Cuenta)
                VALUES (@Codigo_Cuenta, @Nombre_Cuenta, @Nivel, @Cuenta_Padre, @Tipo_Cuenta, @Naturaleza_Cuenta);
            `);

        res.status(201).json({ message: "Registro agregado correctamente" });
    } catch (err) {
        console.error("Error POST Catalogo de Cuentas:", err);
        res.status(500).json({ error: "Error al insertar en Catalogo de Cuentas" });
    }
});

// Método PUT para actualizar un registro en el catálogo de cuentas
app.put("/CatalogoCuentas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Codigo_Cuenta,
            Nombre_Cuenta,
            Nivel,
            Cuenta_Padre,
            Tipo_Cuenta,
            Naturaleza_Cuenta
        } = req.body;

        const result = await pool.request()
            .input("Codigo_Cuenta", mssql.VarChar(50), Codigo_Cuenta)
            .input("Nombre_Cuenta", mssql.VarChar(255), Nombre_Cuenta)
            .input("Nivel", mssql.Int, Nivel)
            .input("Cuenta_Padre", mssql.VarChar(50), Cuenta_Padre)
            .input("Tipo_Cuenta", mssql.VarChar(10), Tipo_Cuenta)
            .input("Naturaleza_Cuenta", mssql.VarChar(10), Naturaleza_Cuenta) // Eliminé el espacio extra en " Naturaleza_Cuenta"
            .input("Id", mssql.VarChar(50), id) // Asigné el id al parámetro para la cláusula WHERE
            .query(`
                UPDATE Catalogo_Cuentas
                SET 
                    Codigo_Cuenta = @Codigo_Cuenta,
                    Nombre_Cuenta = @Nombre_Cuenta,
                    Nivel = @Nivel,
                    Cuenta_Padre = @Cuenta_Padre,
                    Tipo_Cuenta = @Tipo_Cuenta,
                    Naturaleza_Cuenta = @Naturaleza_Cuenta
                WHERE Codigo_Cuenta = @Id;  
            `);

        res.json({ message: "Registro actualizado correctamente", result });
    } catch (err) {
        console.error("Error actualizando el registro en el Catálogo de Cuentas:", err);
        res.status(500).json({ error: "Error al actualizar el registro" });
    }
});

// Método DELETE para eliminar un registro en el catálogo de cuentas
app.delete("/CatalogoCuentas/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.request()
            .input("Codigo_Cuenta", mssql.VarChar(50), id) 
            .query("DELETE FROM Catalogo_Cuentas WHERE Codigo_Cuenta = @Codigo_Cuenta;"); 

        res.json({ message: "Registro eliminado correctamente", result });
    } catch (err) {
        console.error("Error DELETE Catálogo de Cuentas:", err);
        res.status(500).json({ error: "Error al eliminar el registro en el Catálogo de Cuentas" });
    }
});


// Método POST para insertar una nueva partida y sus detalles
app.post("/partidas", async (req, res) => {
    const transaction = new mssql.Transaction(pool);

    try {
        const {
            Fecha,
            Numero_Asiento,
            Descripcion,
            ID_Usuario_Creacion = null, // Valor por defecto
            ID_Tipo_Asiento = null,     // Valor por defecto
            ID_Poliza = null,           // Valor por defecto
            Detalles
        } = req.body;

        console.log("Datos recibidos del frontend:", req.body); // Log para depuración

        // Validar que los datos principales no estén vacíos
        if (!Fecha || !Numero_Asiento || !Descripcion || !Detalles || Detalles.length === 0) {
            return res.status(400).json({ error: "Todos los campos principales son obligatorios y debe haber al menos un detalle." });
        }

        console.log("Datos recibidos para insertar partida:", req.body); // Log para depuración

        await transaction.begin();

        const request = new mssql.Request(transaction);

        // Insertar la partida
        const resultPartida = await request
            .input("Fecha", mssql.Date, Fecha)
            .input("Numero_Asiento", mssql.Int, Numero_Asiento)
            .input("Descripcion", mssql.VarChar(255), Descripcion)
            .input("ID_Usuario_Creacion", mssql.Int, ID_Usuario_Creacion)
            .input("ID_Tipo_Asiento", mssql.Int, ID_Tipo_Asiento)
            .input("ID_Poliza", mssql.Int, ID_Poliza)
            .query(`
                INSERT INTO Partidas (Fecha, Numero_Asiento, Descripcion, ID_Usuario_Creacion, ID_Tipo_Asiento, ID_Poliza)
                OUTPUT INSERTED.ID_Partida
                VALUES (@Fecha, @Numero_Asiento, @Descripcion, @ID_Usuario_Creacion, @ID_Tipo_Asiento, @ID_Poliza);
            `);

        const ID_Partida = resultPartida.recordset[0].ID_Partida;

        console.log("ID de la partida insertada:", ID_Partida); // Log para depuración

        // Insertar detalles de partida
        for (const detalle of Detalles) {
            const { Cuenta, Debe, Haber, Descripcion: DetalleDescripcion, ID_Impuesto = null } = detalle;

            if (!Cuenta || (Debe === undefined && Haber === undefined)) {
                throw new Error(`El detalle debe tener una cuenta y al menos un valor en Debe o Haber. Detalle: ${JSON.stringify(detalle)}`);
            }

            console.log("Insertando detalle:", detalle); // Log para depuración

            const detalleRequest = new mssql.Request(transaction);
            await detalleRequest
                .input("ID_Partida", mssql.Int, ID_Partida)
                .input("Cuenta", mssql.VarChar(50), Cuenta)
                .input("Debe", mssql.Decimal(15, 2), Debe)
                .input("Haber", mssql.Decimal(15, 2), Haber)
                .input("Descripcion", mssql.VarChar(255), DetalleDescripcion || null)
                .input("ID_Impuesto", mssql.Int, ID_Impuesto)
                .query(`
                    INSERT INTO Detalles_Partida (ID_Partida, Cuenta, Debe, Haber, Descripcion, ID_Impuesto)
                    VALUES (@ID_Partida, @Cuenta, @Debe, @Haber, @Descripcion, @ID_Impuesto);
                `);
        }

        await transaction.commit();

        console.log("Partida y detalles insertados correctamente."); // Log para depuración
        res.status(201).json({ message: "Partida y detalles insertados correctamente", ID_Partida });
    } catch (err) {
        await transaction.rollback();
        console.error("Error al insertar la partida:", err); // Log del error
        res.status(500).json({ error: "Error al insertar la partida", details: err.message });
    }
});


// Método GET para obtener todas las partidas tomando en cuenta que estan relacionadas las tablas partidas y detalles de partida
app.get("/libro-diario", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT 
                p.ID_Partida, 
                p.Fecha, 
                p.Numero_Asiento, 
                p.Descripcion AS Descripcion_Partida,
                d.ID_Detalle,
                d.Cuenta,
                d.Debe,
                d.Haber,
                d.Descripcion AS Descripcion_Detalle
            FROM Partidas p
            LEFT JOIN Detalles_Partida d ON p.ID_Partida = d.ID_Partida
            ORDER BY p.Fecha, p.Numero_Asiento;
        `);

        // Agrupar los detalles por partida
        const partidas = {};
        result.recordset.forEach(record => {
            if (!partidas[record.ID_Partida]) {
                partidas[record.ID_Partida] = {
                    ID_Partida: record.ID_Partida,
                    Fecha: record.Fecha,
                    Numero_Asiento: record.Numero_Asiento,
                    Descripcion_Partida: record.Descripcion_Partida,
                    Detalles: []
                };
            }
            if (record.ID_Detalle) {
                partidas[record.ID_Partida].Detalles.push({
                    ID_Detalle: record.ID_Detalle,
                    Cuenta: record.Cuenta,
                    Debe: record.Debe,
                    Haber: record.Haber,
                    Descripcion: record.Descripcion_Detalle
                });
            }
        });

        res.json(Object.values(partidas));
    } catch (err) {
        console.error("Error al obtener el libro diario:", err);
        res.status(500).json({ error: "Error al obtener el libro diario", details: err.message });
    }
});

// Método DELETE para eliminar una partida y sus detalles
app.delete("/partidas/:id", async (req, res) => {
    const transaction = new mssql.Transaction(pool);

    try {
        const { id } = req.params;  // Obtenemos el ID de la partida desde los parámetros

        await transaction.begin();

        // Crear un nuevo request para eliminar los detalles de la partida
        const requestDetalles = new mssql.Request(transaction);
        await requestDetalles
            .input("ID_Partida", mssql.Int, id)  // Declaramos el parámetro solo para esta consulta
            .query(`
                DELETE FROM Detalles_Partida WHERE ID_Partida = @ID_Partida;
            `);

        // Crear un nuevo request para eliminar la partida principal
        const requestPartida = new mssql.Request(transaction);
        await requestPartida
            .input("ID_Partida", mssql.Int, id)  // Declaramos el parámetro solo para esta consulta
            .query(`
                DELETE FROM Partidas WHERE ID_Partida = @ID_Partida;
            `);

        await transaction.commit();

        res.status(200).json({ message: "Partida y detalles eliminados correctamente." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error al eliminar la partida:", err);
        res.status(500).json({ error: "Error al eliminar la partida", details: err.message });
    }
});



// Método UPDATE para actualizar una partida y sus detalles
app.put("/partidas/:id", async (req, res) => {
    const transaction = new mssql.Transaction(pool);

    try {
        const { id } = req.params;
        const { Fecha, Numero_Asiento, Descripcion, Detalles } = req.body;

        await transaction.begin();

        // Crear un nuevo request para actualizar la partida
        const requestPartida = new mssql.Request(transaction);
        await requestPartida
            .input("ID_Partida", mssql.Int, id)
            .input("Fecha", mssql.Date, Fecha)
            .input("Numero_Asiento", mssql.Int, Numero_Asiento)
            .input("Descripcion", mssql.VarChar(255), Descripcion)
            .query(`
                UPDATE Partidas
                SET Fecha = @Fecha, Numero_Asiento = @Numero_Asiento, Descripcion = @Descripcion
                WHERE ID_Partida = @ID_Partida;
            `);

        // Crear un nuevo request para eliminar los detalles actuales
        const requestEliminarDetalles = new mssql.Request(transaction);
        await requestEliminarDetalles
            .input("ID_Partida", mssql.Int, id)
            .query(`
                DELETE FROM Detalles_Partida
                WHERE ID_Partida = @ID_Partida;
            `);

        // Validar e insertar los nuevos detalles
        for (const detalle of Detalles) {
            // Validar que la cuenta exista en Catalogo_Cuentas
            const requestValidarCuenta = new mssql.Request(transaction);
            const resultValidacion = await requestValidarCuenta
                .input("Cuenta", mssql.VarChar(50), detalle.Cuenta)
                .query(`
                    SELECT Codigo_Cuenta FROM Catalogo_Cuentas WHERE Codigo_Cuenta = @Cuenta;
                `);

            if (resultValidacion.recordset.length === 0) {
                throw new Error(`La cuenta '${detalle.Cuenta}' no existe en el catálogo de cuentas.`);
            }

            // Insertar el detalle
            const requestDetalle = new mssql.Request(transaction); // Crear un nuevo request para cada detalle
            await requestDetalle
                .input("ID_Partida", mssql.Int, id)
                .input("Cuenta", mssql.VarChar(50), detalle.Cuenta)
                .input("Debe", mssql.Decimal(15, 2), detalle.Debe || 0)
                .input("Haber", mssql.Decimal(15, 2), detalle.Haber || 0)
                .input("Descripcion", mssql.VarChar(255), detalle.Descripcion || null)
                .input("ID_Impuesto", mssql.Int, detalle.ID_Impuesto || null)
                .query(`
                    INSERT INTO Detalles_Partida (ID_Partida, Cuenta, Debe, Haber, Descripcion, ID_Impuesto)
                    VALUES (@ID_Partida, @Cuenta, @Debe, @Haber, @Descripcion, @ID_Impuesto);
                `);
        }

        await transaction.commit();
        res.status(200).json({ message: "Partida y detalles actualizados correctamente." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error al actualizar la partida:", err);
        res.status(500).json({ error: "Error al actualizar la partida", details: err.message });
    }
});



const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

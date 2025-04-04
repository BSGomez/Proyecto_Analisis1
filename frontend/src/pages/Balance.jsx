import React, { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'

const Balance = () => {
    
    const [balance, setBalance] = useState([])

    useEffect(() => {
        const fetchBalance = async () => {
            try{
                const response = await axios.get('http://localhost:8800/balanceSaldos');
                console.log(response.data);
                setBalance(response.data);
            }catch (error) {
                console.error('Error fetching balance:', error)
            }
        }
        fetchBalance()
    }
    , [])
  return (
    <div><h1><center>Balance de saldos</center></h1>
    
    <div className="Balance">
        <table className="table table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cuenta</th>
                    <th>Periodo</th>
                    <th>Saldo Inicial</th>
                    <th>Debito</th>
                    <th>Credito</th>
                    <th>Saldo Final</th>
                </tr>
            </thead>
            <tbody>
                {balance.map((item) => (
                    <tr key={item.BAL_id_balance}>
                        <td>{item.BAL_id_balance}</td>
                        <td>{item.BAL_cuenta}</td>
                        <td>{item.BAL_periodo}</td>
                        <td>{item.BAL_saldo_inicial}</td>
                        <td>{item.BAL_debito}</td>
                        <td>{item.BAL_credito}</td>
                        <td>{item.BAL_saldo_final}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    
    <div className="buttons">
        <button className="btn btn-primary">Agregar</button>
        <button className="btn btn-secondary">Modificar</button>
        <button className="btn btn-danger">Eliminar</button>
    </div>

    </div>
    
  )
}

export default Balance
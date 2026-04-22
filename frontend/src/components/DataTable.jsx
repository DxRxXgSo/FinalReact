import React, { useState } from 'react';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';

const DataTable = ({ data, columns, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Lógica de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="card border-0 shadow-sm rounded-4 mt-3">
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold" style={{ color: 'var(--btn-pastel-blue)' }}>{title}</h5>
        <button className="btn btn-pastel-green btn-sm fw-bold">
          <Plus size={16} /> Agregar Nuevo
        </button>
      </div>
      <div className="table-responsive p-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              {columns.map((col) => <th key={col.field}>{col.label}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => <td key={col.field}>{row[col.field]}</td>)}
                <td>
                  <div className="btn-group">
                    <button className="btn btn-outline-info btn-sm border-0"><Eye size={16} /></button>
                    <button className="btn btn-outline-warning btn-sm border-0"><Edit size={16} /></button>
                    <button className="btn btn-outline-danger btn-sm border-0"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginador */}
      <div className="card-footer bg-white border-0 d-flex justify-content-center">
        <nav>
          <ul className="pagination pagination-sm">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default DataTable;
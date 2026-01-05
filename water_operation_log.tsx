import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Save, FileText } from 'lucide-react';

const WaterOperationLog = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState({});
  const [currentLog, setCurrentLog] = useState(null);

  // Load logs from storage on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const result = await window.storage.list('log:');
      const loadedLogs = {};
      
      for (const key of result.keys) {
        const data = await window.storage.get(key);
        if (data) {
          const logData = JSON.parse(data.value);
          loadedLogs[logData.date] = logData;
        }
      }
      
      setLogs(loadedLogs);
      
      // Load current date's log if it exists
      if (loadedLogs[date]) {
        setCurrentLog(loadedLogs[date]);
      } else {
        initializeNewLog(date);
      }
    } catch (error) {
      console.log('No existing logs found, starting fresh');
      initializeNewLog(date);
    }
  };

  const initializeNewLog = (selectedDate) => {
    setCurrentLog({
      date: selectedDate,
      sales: {
        kia: { bags: '', salesMade: '', fuelPrice: '' },
        bongo: { bags: '', salesMade: '', fuelPrice: '' },
        meterKing: { bags: '', salesMade: '', fuelPrice: '' },
        office: { bags: '', salesMade: '', fuelPrice: '' }
      },
      wages: [],
      expenses: [],
      production: []
    });
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (logs[newDate]) {
      setCurrentLog(logs[newDate]);
    } else {
      initializeNewLog(newDate);
    }
  };

  const handleSalesChange = (product, field, value) => {
    setCurrentLog(prev => ({
      ...prev,
      sales: {
        ...prev.sales,
        [product]: {
          ...prev.sales[product],
          [field]: value
        }
      }
    }));
  };

  const addWage = () => {
    setCurrentLog(prev => ({
      ...prev,
      wages: [...prev.wages, { name: '', amount: '' }]
    }));
  };

  const updateWage = (index, field, value) => {
    setCurrentLog(prev => ({
      ...prev,
      wages: prev.wages.map((wage, i) => 
        i === index ? { ...wage, [field]: value } : wage
      )
    }));
  };

  const removeWage = (index) => {
    setCurrentLog(prev => ({
      ...prev,
      wages: prev.wages.filter((_, i) => i !== index)
    }));
  };

  const addExpense = () => {
    setCurrentLog(prev => ({
      ...prev,
      expenses: [...prev.expenses, { description: '', amount: '' }]
    }));
  };

  const updateExpense = (index, field, value) => {
    setCurrentLog(prev => ({
      ...prev,
      expenses: prev.expenses.map((expense, i) => 
        i === index ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const removeExpense = (index) => {
    setCurrentLog(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  const addProduction = () => {
    setCurrentLog(prev => ({
      ...prev,
      production: [...prev.production, { ballWeight: '', sachetBags: '' }]
    }));
  };

  const updateProduction = (index, field, value) => {
    setCurrentLog(prev => ({
      ...prev,
      production: prev.production.map((prod, i) => 
        i === index ? { ...prod, [field]: value } : prod
      )
    }));
  };

  const removeProduction = (index) => {
    setCurrentLog(prev => ({
      ...prev,
      production: prev.production.filter((_, i) => i !== index)
    }));
  };

  const saveLog = async () => {
    try {
      await window.storage.set(`log:${currentLog.date}`, JSON.stringify(currentLog));
      setLogs(prev => ({
        ...prev,
        [currentLog.date]: currentLog
      }));
      alert('Log saved successfully!');
    } catch (error) {
      alert('Error saving log: ' + error.message);
    }
  };

  const calculateTotals = () => {
    if (!currentLog) return { totalSales: 0, totalWages: 0, totalExpenses: 0 };

    const totalSales = Object.values(currentLog.sales).reduce((sum, product) => {
      return sum + (parseFloat(product.salesMade) || 0);
    }, 0);

    const totalWages = currentLog.wages.reduce((sum, wage) => {
      return sum + (parseFloat(wage.amount) || 0);
    }, 0);

    const totalExpenses = currentLog.expenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.amount) || 0);
    }, 0);

    return { totalSales, totalWages, totalExpenses };
  };

  if (!currentLog) return <div className="p-8">Loading...</div>;

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Vitality Purified Drinking Water</h1>
              <p className="text-gray-600 mt-1">Daily Operation Log</p>
            </div>
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={saveLog}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Log
            </button>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-green-900">GH₵ {totals.totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">Total Wages</p>
              <p className="text-2xl font-bold text-orange-900">GH₵ {totals.totalWages.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">GH₵ {totals.totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Sales */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Section 1: Sales</h2>
          
          {['kia', 'bongo', 'meterKing', 'office'].map((product) => (
            <div key={product} className="mb-6 pb-6 border-b last:border-b-0">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 capitalize">
                {product === 'meterKing' ? 'Meter King' : product}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Sachet Bags:
                  </label>
                  <input
                    type="number"
                    value={currentLog.sales[product].bags}
                    onChange={(e) => handleSalesChange(product, 'bags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Made (GH₵):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentLog.sales[product].salesMade}
                    onChange={(e) => handleSalesChange(product, 'salesMade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Used Price (GH₵):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentLog.sales[product].fuelPrice}
                    onChange={(e) => handleSalesChange(product, 'fuelPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Wages */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800">Section 2: Wages</h2>
            <button
              onClick={addWage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Worker
            </button>
          </div>
          
          {currentLog.wages.map((wage, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worker's Name:
                </label>
                <input
                  type="text"
                  value={wage.name}
                  onChange={(e) => updateWage(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter worker's name"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Paid (GH₵):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={wage.amount}
                    onChange={(e) => updateWage(index, 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={() => removeWage(index)}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {currentLog.wages.length === 0 && (
            <p className="text-gray-500 text-center py-4">No wages added yet. Click "Add Worker" to begin.</p>
          )}
        </div>

        {/* Section 3: Expenses */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800">Section 3: Expenses</h2>
            <button
              onClick={addExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
          
          {currentLog.expenses.map((expense, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description:
                </label>
                <input
                  type="text"
                  value={expense.description}
                  onChange={(e) => updateExpense(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter expense description"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Paid (GH₵):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expense.amount}
                    onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={() => removeExpense(index)}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {currentLog.expenses.length === 0 && (
            <p className="text-gray-500 text-center py-4">No expenses added yet. Click "Add Expense" to begin.</p>
          )}
        </div>

        {/* Section 4: Production */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800">Section 4: Production</h2>
            <button
              onClick={addProduction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Roll
            </button>
          </div>
          
          {currentLog.production.map((prod, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={prod.ballWeight}
                  onChange={(e) => updateProduction(index, 'ballWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter roll weight"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sachet Bags:
                  </label>
                  <input
                    type="number"
                    value={prod.sachetBags}
                    onChange={(e) => updateProduction(index, 'sachetBags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of bags"
                  />
                </div>
                <button
                  onClick={() => removeProduction(index)}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {currentLog.production.length === 0 && (
            <p className="text-gray-500 text-center py-4">No production data added yet. Click "Add Roll" to begin.</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm pb-6">
          <p>This form is designed to record daily operations data for quality control, efficiency tracking, and compliance with production standards.</p>
        </div>
      </div>
    </div>
  );
};

export default WaterOperationLog;
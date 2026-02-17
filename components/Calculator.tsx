
import React, { useState, useEffect } from 'react';
import { X, Delete, Divide, Minus, Plus, Equal, Hash, Percent, RotateCcw } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNumber(true);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // Using Function constructor instead of eval for safety in some contexts
      const result = new Function(`return ${fullEquation.replace('×', '*').replace('÷', '/')}`)();
      setDisplay(String(Number(result.toFixed(2))));
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  return (
    <div className="fixed bottom-24 right-8 z-[500] w-80 bg-slate-900/90 backdrop-blur-2xl rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in slide-in-from-bottom-10 duration-300 font-['Cairo']">
      <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-400">
          <Hash size={18} />
          <span className="text-xs font-black uppercase tracking-widest">المساعد الحسابي</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8 space-y-6">
        <div className="text-right space-y-1">
          <div className="h-6 text-slate-500 font-bold text-xs overflow-hidden">{equation}</div>
          <div className="text-5xl font-black text-white tracking-tighter truncate">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <CalcBtn label="C" onClick={clear} color="red" />
          <CalcBtn label="÷" onClick={() => handleOperator('÷')} color="blue" />
          <CalcBtn label="×" onClick={() => handleOperator('×')} color="blue" />
          <CalcBtn label="⌫" onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')} color="slate" />

          {[7, 8, 9].map(n => <CalcBtn key={n} label={String(n)} onClick={() => handleNumber(String(n))} />)}
          <CalcBtn label="-" onClick={() => handleOperator('-')} color="blue" />

          {[4, 5, 6].map(n => <CalcBtn key={n} label={String(n)} onClick={() => handleNumber(String(n))} />)}
          <CalcBtn label="+" onClick={() => handleOperator('+')} color="blue" />

          {[1, 2, 3].map(n => <CalcBtn key={n} label={String(n)} onClick={() => handleNumber(String(n))} />)}
          <CalcBtn label="=" onClick={calculate} color="indigo" rowSpan={2} />

          <CalcBtn label="0" onClick={() => handleNumber('0')} colSpan={2} />
          <CalcBtn label="." onClick={() => handleNumber('.')} />
        </div>
      </div>
      
      <div className="p-4 bg-blue-600/10 text-center">
         <p className="text-[10px] font-bold text-blue-400">نظام البطل بلاس - دقة بلا حدود</p>
      </div>
    </div>
  );
};

const CalcBtn = ({ label, onClick, color = 'white', colSpan = 1, rowSpan = 1 }: any) => {
  const styles: any = {
    white: 'bg-white/5 text-white hover:bg-white/10',
    blue: 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white',
    red: 'bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20',
    slate: 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
  };
  return (
    <button 
      onClick={onClick}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
      className={`py-4 rounded-2xl font-black text-lg transition-all active:scale-90 ${styles[color]}`}
    >
      {label}
    </button>
  );
};

export default Calculator;

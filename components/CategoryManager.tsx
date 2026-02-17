
import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Edit3, Save, Sparkles } from 'lucide-react';

interface CategoryManagerProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories, onClose }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleDelete = (cat: string) => {
    if (cat === 'عام') {
      alert("لا يمكن حذف الفئة الافتراضية");
      return;
    }
    if (confirm(`هل أنت متأكد من حذف فئة "${cat}"؟ لن يتم حذف الأصناف المرتبطة بها ولكن سيتغير تصنيفها لـ "عام".`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  const startEdit = (index: number, val: string) => {
    setEditingIndex(index);
    setEditingValue(val);
  };

  const saveEdit = (index: number) => {
    if (!editingValue.trim() || categories.includes(editingValue.trim())) {
        setEditingIndex(null);
        return;
    }
    const newCats = [...categories];
    newCats[index] = editingValue.trim();
    setCategories(newCats);
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 font-['Cairo'] border-4 border-white">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Tag size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">إدارة فئات الأصناف</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تنسيق وترتيب المخزن</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-8 text-right bg-slate-50/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-500" /> إضافة فئة جديدة
              </label>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAdd()}
                placeholder="اسم الفئة الجديدة..."
                className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              />
              <button 
                onClick={handleAdd}
                className="bg-blue-600 text-white px-6 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase px-2">الفئات الحالية ({categories.length})</label>
            <div className="max-h-80 overflow-y-auto no-scrollbar space-y-2 pr-1">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl group hover:bg-blue-50/50 transition-all border border-slate-100 hover:border-blue-200 shadow-sm">
                  {editingIndex === idx ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        autoFocus
                        value={editingValue} 
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && saveEdit(idx)}
                        className="flex-1 bg-white border-2 border-blue-500 rounded-xl px-4 py-2 font-black outline-none"
                      />
                      <button onClick={() => saveEdit(idx)} className="p-2 bg-green-500 text-white rounded-xl shadow-lg"><Save size={16}/></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Tag size={16} />
                        </div>
                        <span className="font-black text-slate-700">{cat}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => startEdit(idx, cat)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14}/></button>
                        <button 
                          onClick={() => handleDelete(cat)} 
                          className={`p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all ${cat === 'عام' ? 'hidden' : ''}`}
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 text-center border-t">
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">التغييرات في أسماء الفئات تنعكس فوراً على قائمة الأصناف</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;

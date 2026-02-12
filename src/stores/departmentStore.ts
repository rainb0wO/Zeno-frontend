import { create } from 'zustand';
import type { Department } from '../services/department';

interface DepartmentState {
  departments: Department[];
  showDeleted: boolean;
  loading: boolean;
  setDepartments: (departments: Department[]) => void;
  setShowDeleted: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateDepartmentInTree: (id: string, updates: Partial<Department>) => void;
  removeDepartmentFromTree: (id: string) => void;
  addDepartmentToTree: (department: Department, parentId?: string | null) => void;
  getDepartmentById: (id: string) => Department | null;
  getDepartmentCount: (id: string) => number; // 获取部门员工数量（包含子部门）
}

// 递归查找部门
const findDepartment = (departments: Department[], id: string): Department | null => {
  for (const dept of departments) {
    if (dept.id === id) return dept;
    if (dept.children) {
      const found = findDepartment(dept.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 递归更新部门
const updateDepartmentRecursive = (
  departments: Department[],
  id: string,
  updates: Partial<Department>
): Department[] => {
  return departments.map(dept => {
    if (dept.id === id) {
      return { ...dept, ...updates };
    }
    if (dept.children) {
      return { ...dept, children: updateDepartmentRecursive(dept.children, id, updates) };
    }
    return dept;
  });
};

// 递归删除部门
const removeDepartmentRecursive = (departments: Department[], id: string): Department[] => {
  return departments
    .filter(dept => dept.id !== id)
    .map(dept => {
      if (dept.children) {
        return { ...dept, children: removeDepartmentRecursive(dept.children, id) };
      }
      return dept;
    });
};

// 递归添加部门
const addDepartmentRecursive = (
  departments: Department[],
  department: Department,
  parentId?: string | null
): Department[] => {
  if (!parentId) {
    return [...departments, department];
  }
  return departments.map(dept => {
    if (dept.id === parentId) {
      return {
        ...dept,
        children: [...(dept.children || []), department],
      };
    }
    if (dept.children) {
      return { ...dept, children: addDepartmentRecursive(dept.children, department, parentId) };
    }
    return dept;
  });
};

// 递归计算部门员工数量（包含子部门）
const calculateDepartmentCount = (dept: Department): number => {
  let count = dept.employeeCount || 0;
  if (dept.children) {
    dept.children.forEach(child => {
      count += calculateDepartmentCount(child);
    });
  }
  return count;
};

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  showDeleted: false,
  loading: false,

  setDepartments: (departments) => set({ departments }),

  setShowDeleted: (show) => set({ showDeleted: show }),

  setLoading: (loading) => set({ loading }),

  updateDepartmentInTree: (id, updates) =>
    set((state) => ({
      departments: updateDepartmentRecursive(state.departments, id, updates),
    })),

  removeDepartmentFromTree: (id) =>
    set((state) => ({
      departments: removeDepartmentRecursive(state.departments, id),
    })),

  addDepartmentToTree: (department, parentId) =>
    set((state) => ({
      departments: addDepartmentRecursive(state.departments, department, parentId),
    })),

  getDepartmentById: (id) => {
    const { departments } = get();
    return findDepartment(departments, id);
  },

  getDepartmentCount: (id) => {
    const { departments } = get();
    const dept = findDepartment(departments, id);
    if (!dept) return 0;
    return calculateDepartmentCount(dept);
  },
}));


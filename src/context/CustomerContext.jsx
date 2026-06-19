import { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('alpha-customer');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (customer) {
      localStorage.setItem('alpha-customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('alpha-customer');
    }
  }, [customer]);

  const login = (userData) => {
    setCustomer(userData);
  };

  const logout = () => {
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider value={{ customer, login, logout }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);

import React, { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try { const saved = localStorage.getItem("civicai_wishlist"); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    try { localStorage.setItem("civicai_wishlist", JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  const addToWishlist = (scheme) => {
    setWishlist(prev => prev.find(s => s.id === scheme.id) ? prev : [...prev, scheme]);
  };
  const removeFromWishlist = (schemeId) => {
    setWishlist(prev => prev.filter(s => s.id !== schemeId));
    setCompareList(prev => prev.filter(s => s.id !== schemeId));
  };
  const isInWishlist = (schemeId) => wishlist.some(s => s.id === schemeId);
  const toggleWishlist = (scheme) => isInWishlist(scheme.id) ? removeFromWishlist(scheme.id) : addToWishlist(scheme);

  const addToCompare = (scheme) => {
    setCompareList(prev => {
      if (prev.find(s => s.id === scheme.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, scheme];
    });
  };
  const removeFromCompare = (schemeId) => setCompareList(prev => prev.filter(s => s.id !== schemeId));
  const isInCompare = (schemeId) => compareList.some(s => s.id === schemeId);
  const toggleCompare = (scheme) => isInCompare(scheme.id) ? removeFromCompare(scheme.id) : addToCompare(scheme);
  const clearCompare = () => setCompareList([]);
  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider value={{
      wishlist, compareList,
      addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist,
      addToCompare, removeFromCompare, isInCompare, toggleCompare,
      clearCompare, clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

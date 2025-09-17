import React, { useEffect, useState } from 'react';
import productApi from '../../../services/productApi';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getAll();
        if (!isMounted) return;
        // Accept either array or {data: []}
        const list = Array.isArray(data) ? data : (data?.data || []);
        setProducts(list);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load products');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="p-4">Loading products…</div>;
  if (error) return <div className="p-4 text-destructive">{error}</div>;

  return (
    <div className="p-4 space-y-2">
      <h2 className="font-heading text-xl font-bold">Products</h2>
      <ul className="list-disc pl-5">
        {products.map((p) => (
          <li key={p.id} className="font-body text-foreground">
            {p.name} {p.salePrice ? `(₹${p.salePrice})` : (p.price ? `(₹${p.price})` : '')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;



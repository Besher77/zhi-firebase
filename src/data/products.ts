import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface ProductFrontend {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  image: string;
  images: string[];
  desc: string;
  features: string[];
  isFeatured?: boolean;
  categoryId?: string;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductFrontend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const prods: ProductFrontend[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Calculate discount if old price exists and is greater than new price
          let discount = "";
          const newP = Number(data.newPrice);
          const oldP = Number(data.oldPrice);
          if (oldP > newP && oldP > 0) {
            discount = Math.round(((oldP - newP) / oldP) * 100) + "%";
          }

          prods.push({
            id: doc.id,
            name: data.name || '',
            price: newP.toFixed(2),
            oldPrice: oldP > newP ? oldP.toFixed(2) : "",
            discount,
            image: data.images && data.images.length > 0 ? data.images[0] : "",
            images: data.images || [],
            desc: data.desc || '',
            features: data.features || [],
            isFeatured: !!data.isFeatured,
            categoryId: data.categoryId || ""
          });
        });

        // Use mock data fallback if DB is empty
        if (prods.length === 0) {
          prods.push(
            { id: "mock1", name: "Creative Coffee", price: "34.00", oldPrice: "44.00", discount: "23%", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop", images: [], desc: "", features: [] },
            { id: "mock2", name: "Culi Coffee Beans", price: "38.00", oldPrice: "48.00", discount: "19%", image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop", images: [], desc: "", features: [] },
            { id: "mock3", name: "Brazilian Coffee Beans", price: "29.00", oldPrice: "39.00", discount: "12%", image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=600&auto=format&fit=crop", images: [], desc: "", features: [] },
            { id: "mock4", name: "Instant Espresso", price: "48.00", oldPrice: "", discount: "", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop", images: [], desc: "", features: [] },
            { id: "mock5", name: "Coffee Machine", price: "120.00", oldPrice: "150.00", discount: "20%", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=600&auto=format&fit=crop", isFeatured: true, images: [], desc: "", features: [] }
          );
        }

        setProducts(prods);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
}
